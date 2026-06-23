/**
 * PLC TAG TANIMLARI
 * 
 * Okunacak tüm tag'ların merkezi tanımı
 * Periyodik okuma için bu liste kullanılır
 */

const TAGS = {
  // Tank Sıcaklığı - REAL (4 byte)
  // %MD14 = Memory, offset 14, REAL
  TANK_SICAKLIGI: {
    id: 'TANK_SICAKLIGI',
    name: 'Tank Sıcaklığı',
    type: 'real',
    area: 'memory',  // Memory area (%M)
    offset: 14,
    unit: '°C',
    description: 'Tank içerisindeki sıvının sıcaklığı'
  },

  // Tank Basıncı - REAL (4 byte)
  // %MD22 = Memory, offset 22, REAL
  TANK_BASINCI: {
    id: 'TANK_BASINCI',
    name: 'Tank Basıncı',
    type: 'real',
    area: 'memory',
    offset: 22,
    unit: 'bar',
    description: 'Tank içerisindeki basınç değeri'
  },

  // Tank Sıvı Seviyesi - INT (2 byte)
  // %MW30 = Memory, offset 30, INT (WORD)
  TANK_SIVI_SEVIYESI: {
    id: 'TANK_SIVI_SEVIYESI',
    name: 'Tank Sıvı Seviyesi',
    type: 'int',
    area: 'memory',
    offset: 30,
    unit: '%',
    description: 'Tank içerisindeki sıvı seviye yüzdesi'
  },

  // İletkenlik Değeri - REAL (4 byte)
  // %MD44 = Memory, offset 44, REAL
  ILETKENLIK_DEGERI: {
    id: 'ILETKENLIK_DEGERI',
    name: 'İletkenlik Değeri',
    type: 'real',
    area: 'memory',
    offset: 44,
    unit: 'µS/cm',
    description: 'Sıvının elektrik iletkenlik değeri'
  },

  // WiFi Sıcaklığı - INT (2 byte)
  // %IW38 = Input, offset 38, INT (WORD)
  WIFI_SICAKLIGI: {
    id: 'WIFI_SICAKLIGI',
    name: 'WiFi Sıcaklığı',
    type: 'int',
    area: 'input',   // Input area (%I)
    offset: 38,
    unit: '°C',
    description: 'Dış ortamın WiFi sensöründen ölçülen sıcaklığı'
  },

  // Control: Ana Okuma Başlangıcı - BOOL (1 bit)
  // %M0.5 = Memory, byte 0, bit 5 (bool)
  START_MEM: {
    id: 'START_MEM',
    name: 'Okuma Başlangıcı',
    type: 'bool',
    area: 'memory',
    offset: 0,
    bitOffset: 5,
    unit: '-',
    description: 'TRUE: Ana tag okumasını başla, FALSE: Dur. Dakikada 1 kez okunur + ilk okuma hemen'
  }
};

/**
 * Tüm tag'ları array olarak döndür
 */
function getAllTags() {
  return Object.values(TAGS);
}

/**
 * Ana 5 tag'ı (kontrol tag'ı hariç) döndür
 */
function getMainTags() {
  return Object.values(TAGS).filter(tag => tag.id !== 'START_MEM');
}

/**
 * Control tag'ını döndür
 */
function getControlTag() {
  return TAGS.START_MEM;
}

/**
 * Belirli bir tag'ı ID ile getir
 */
function getTag(id) {
  return TAGS[id];
}

/**
 * Tag listesini yazdır
 */
function printTagInfo() {
  console.log('\n📊 PLC TAG BİLGİLERİ:\n');
  getAllTags().forEach((tag, index) => {
    console.log(`${index + 1}. ${tag.name}`);
    console.log(`   ID: ${tag.id}`);
    console.log(`   Tip: ${tag.type.toUpperCase()}`);
    console.log(`   Bölge: ${tag.area === 'memory' ? 'Memory (%M)' : 'Input (%I)'}`);
    console.log(`   Offset: ${tag.offset}`);
    console.log(`   Birim: ${tag.unit}`);
    console.log(`   Açıklama: ${tag.description}`);
    console.log('');
  });
}

module.exports = {
  TAGS,
  getAllTags,
  getMainTags,
  getControlTag,
  getTag,
  printTagInfo
};
