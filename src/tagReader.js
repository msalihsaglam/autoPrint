// src/tagReader.js

class TagReader {
  constructor(plcConnection) {
    this.connection = plcConnection;
    this.client = plcConnection.getClient();
  }

  registerTags(tags) {}

  /**
   * Yeni REAL ve INT şablonuna göre gelen nesne verilerini doğrular.
   */
  processPLCVals(values) {
    if (!values) return { startMem: false, tags: [] };

    const startMemValue = values['START_MEM'] !== undefined ? values['START_MEM'] : false;

    const results = [
      { id: 'TANK_SICAKLIGI', name: 'Tank Sıcaklığı', value: values['TANK_SICAKLIGI'] !== undefined ? parseFloat(values['TANK_SICAKLIGI'].toFixed(2)) : 0, unit: '°C', success: values['TANK_SICAKLIGI'] !== undefined },
      { id: 'TANK_BASINCI', name: 'Tank Basıncı', value: values['TANK_BASINCI'] !== undefined ? parseFloat(values['TANK_BASINCI'].toFixed(2)) : 0, unit: 'bar', success: values['TANK_BASINCI'] !== undefined },
      { id: 'TANK_SIVI_SEVIYESI', name: 'Tank Sıvı Seviyesi', value: values['TANK_SIVI_SEVIYESI'] !== undefined ? parseInt(values['TANK_SIVI_SEVIYESI']) : 0, unit: '%', success: values['TANK_SIVI_SEVIYESI'] !== undefined },
      { id: 'ILETKENLIK_DEGERI', name: 'İletkenlik Değeri', value: values['ILETKENLIK_DEGERI'] !== undefined ? parseFloat(values['ILETKENLIK_DEGERI'].toFixed(2)) : 0, unit: 'µS/cm', success: values['ILETKENLIK_DEGERI'] !== undefined },
      { id: 'WFI_SICAKLIGI', name: 'WFI Sıcaklığı', value: values['WFI_SICAKLIGI'] !== undefined ? parseInt(values['WFI_SICAKLIGI']) : 0, unit: '°C', success: values['WFI_SICAKLIGI'] !== undefined }
    ];

    return {
      startMem: startMemValue,
      tags: results
    };
  }
}

module.exports = TagReader;