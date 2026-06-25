// src/tags.js

// PLC'den okunacak ana 5 tag şablonu (nodes7 adres yapısına uygun format)
const tags = [
  { id: 'TANK_SICAKLIGI', name: 'Tank Sıcaklığı', type: 'real', address: 'DB1,REAL0', unit: '°C' },
  { id: 'TANK_BASINCI', name: 'Tank Basıncı', type: 'real', address: 'DB1,REAL4', unit: 'bar' },
  { id: 'TANK_SIVI_SEVIYESI', name: 'Tank Sıvı Seviyesi', type: 'int', address: 'DB1,INT8', unit: '%' },
  { id: 'URETIM_ADEDI', name: 'Üretim Adedi', type: 'dint', address: 'DB1,DINT10', unit: 'Adet' },
  { id: 'ILETKENLIK_DEGERI', name: 'İletkenlik Değeri', type: 'int', address: 'DB1,INT14', unit: 'µS/cm' }
];

// Sistemi kontrol eden tetikleyici merker sinyali (%M0.5)
const controlTag = {
  id: 'START_MEM',
  name: 'Sistem Başlat Merkeri',
  type: 'bool',
  address: 'M0.5',
  unit: ''
};

function getAllTags() {
  return [...tags, controlTag];
}

function getMainTags() {
  return tags;
}

function getControlTag() {
  return controlTag;
}

module.exports = {
  getAllTags,
  getMainTags,
  getControlTag
};