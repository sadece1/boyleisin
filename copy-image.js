import { copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const source = join(__dirname, 'Gemini_Generated_Image_rtkisertkisertki.png');
const dest = join(__dirname, 'public', 'hero-bg.png');

try {
  copyFileSync(source, dest);
  console.log('Dosya başarıyla kopyalandı!');
} catch (error) {
  console.error('Hata:', error.message);
}

