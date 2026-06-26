// src/tags.js

// PLC'den okunacak ana 5 tag şablonu (nodes7 adres yapısına uygun format)
const tags = [
  { id: 'TANK_SICAKLIGI', name: 'Tank Sıcaklığı', type: 'real', address: 'DB2,REAL2', unit: '°C' },
  { id: 'TANK_BASINCI', name: 'Tank Basıncı', type: 'real', address: 'DB2,REAL6', unit: 'bar' },
  { id: 'TANK_SIVI_SEVIYESI', name: 'Tank Sıvı Seviyesi', type: 'int', address: 'DB2,INT10', unit: '%' },
  { id: 'ILETKENLIK_DEGERI', name: 'İletkenlik Değeri', type: 'real', address: 'DB2,REAL12', unit: 'µS/cm' }
];

// Sistemi kontrol eden tetikleyici merker sinyali
const controlTag = {
  id: 'START_MEM',
  name: 'Sistem Başlat Merkeri',
  type: 'bool',
  address: 'DB2,X0.0',
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