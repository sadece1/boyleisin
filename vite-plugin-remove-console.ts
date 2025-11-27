import type { Plugin } from 'vite';

/**
 * Vite plugin to remove console.log statements in production
 * This reduces bundle size and prevents Lighthouse console errors
 */
export function removeConsole(): Plugin {
  return {
    name: 'remove-console',
    enforce: 'post',
    apply: 'build',
    transform(code, id) {
      // Only process JavaScript/TypeScript files
      if (!id.match(/\.(js|ts|tsx|jsx)$/)) {
        return null;
      }
      
      // Skip node_modules (they should be minified already)
      if (id.includes('node_modules')) {
        return null;
      }
      
      // Remove console.log, console.warn, console.info, console.debug
      // Keep console.error for error tracking
      const transformedCode = code
        .replace(/console\.(log|warn|info|debug)\([^)]*\);?/g, '')
        .replace(/console\.(log|warn|info|debug)\([^)]*\)/g, '');
      
      if (transformedCode !== code) {
        return {
          code: transformedCode,
          map: null,
        };
      }
      
      return null;
    },
  };
}

