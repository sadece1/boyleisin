import { exec } from 'child_process';
import { promisify } from 'util';
import logger from './logger';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

/**
 * Virus Scanner - ClamAV integration for file scanning
 */

interface VirusScanResult {
  clean: boolean;
  infected: boolean;
  threatName?: string;
  error?: string;
}

/**
 * Check if ClamAV is available
 */
export const isClamAVAvailable = async (): Promise<boolean> => {
  try {
    await execAsync('clamscan --version');
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Scan file for viruses using ClamAV
 */
export const scanFile = async (filePath: string): Promise<VirusScanResult> => {
  // Check if ClamAV is available
  const available = await isClamAVAvailable();
  
  if (!available) {
    logger.warn('ClamAV not available, skipping virus scan');
    // In development, if ClamAV is not available, we can skip scanning
    // In production, you might want to fail the upload or use cloud-based scanning
    if (process.env.NODE_ENV === 'production' && process.env.REQUIRE_VIRUS_SCAN === 'true') {
      return {
        clean: false,
        infected: false,
        error: 'Virus scanner not available',
      };
    }
    
    // Development mode: skip scan but log it
    return {
      clean: true,
      infected: false,
    };
  }

  try {
    // Use ClamAV to scan the file
    // --infected flag exits with code 1 if virus found
    // --no-summary for cleaner output
    const { stdout, stderr } = await execAsync(
      `clamscan --infected --no-summary --quiet "${filePath}"`
    );

    // ClamAV returns exit code 0 if clean, 1 if infected
    // If we get here without error, file is clean
    logger.info(`Virus scan completed: ${path.basename(filePath)} - Clean`);
    
    return {
      clean: true,
      infected: false,
    };
  } catch (error: any) {
    // Exit code 1 means virus found
    if (error.code === 1) {
      // Parse threat name from stderr or stdout
      const output = error.stderr || error.stdout || '';
      const threatMatch = output.match(/.*FOUND$/m);
      const threatName = threatMatch ? threatMatch[0].replace(/\s+FOUND$/, '') : 'Unknown threat';
      
      logger.warn(`Virus detected: ${path.basename(filePath)} - ${threatName}`);
      
      return {
        clean: false,
        infected: true,
        threatName,
      };
    }

    // Other errors
    logger.error(`Virus scan error: ${error.message}`);
    return {
      clean: false,
      infected: false,
      error: error.message,
    };
  }
};

/**
 * Scan multiple files
 */
export const scanFiles = async (filePaths: string[]): Promise<VirusScanResult[]> => {
  const results = await Promise.all(
    filePaths.map(filePath => scanFile(filePath))
  );
  return results;
};

/**
 * Cloud-based virus scanning alternative (placeholder for services like VirusTotal)
 */
export const scanFileCloud = async (
  filePath: string,
  apiKey?: string
): Promise<VirusScanResult> => {
  // Placeholder for cloud-based scanning services
  // Examples: VirusTotal API, Google Safe Browsing, etc.
  
  if (!apiKey) {
    logger.warn('Cloud scanning API key not configured');
    return {
      clean: true,
      infected: false,
      error: 'API key not configured',
    };
  }

  try {
    const fileBuffer = fs.readFileSync(filePath);
    const fileHash = crypto
      .createHash('sha256')
      .update(fileBuffer)
      .digest('hex');

    // Example: VirusTotal API integration
    // const response = await fetch(`https://www.virustotal.com/vtapi/v2/file/report?apikey=${apiKey}&resource=${fileHash}`);
    // const result = await response.json();
    
    // For now, return clean (implement actual API call)
    logger.info(`Cloud virus scan (placeholder): ${path.basename(filePath)}`);
    
    return {
      clean: true,
      infected: false,
    };
  } catch (error: any) {
    logger.error(`Cloud virus scan error: ${error.message}`);
    return {
      clean: false,
      infected: false,
      error: error.message,
    };
  }
};

