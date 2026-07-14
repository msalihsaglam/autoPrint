// src/printerConfig.js
// Yazıcı adını bir txt dosyasından okuyan yardımcı modül.
// Dosya bulunamazsa, boşsa veya sadece yorum satırları içeriyorsa null döner
// ve sistemin varsayılan (default) yazıcısı kullanılır.
const fs = require('fs');
const path = require('path');

function getDefaultConfigPath() {
  // pkg ile paketlenmiş EXE modunda, dosya exe'nin yanında aranır.
  if (process.pkg) {
    return path.join(path.dirname(process.execPath), 'printer.txt');
  }
  // Normal Node.js modunda proje kök dizininde aranır.
  return path.join(__dirname, '..', 'printer.txt');
}

function getPrinterName() {
  const configPath = process.env.PRINTER_CONFIG_PATH || getDefaultConfigPath();
  try {
    if (!fs.existsSync(configPath)) return null;

    const lines = fs.readFileSync(configPath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) return trimmed;
    }
    return null;
  } catch (e) {
    console.error('⚠️  Yazıcı adı dosyası okunamadı:', e.message);
    return null;
  }
}

module.exports = { getPrinterName };
