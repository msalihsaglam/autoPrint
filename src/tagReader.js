const config = require('./config');
const snap7 = require('snap7');

class TagReader {
  constructor(plcConnection) {
    this.connection = plcConnection;
    this.client = plcConnection.getClient();
    
    // Snap7 Constants
    this.S7_AREA_MEMORY = snap7.S7AreaMK;   // Memory area (%M)
    this.S7_AREA_INPUT = snap7.S7AreaPE;   // Input area (%I)
    this.S7_AREA_OUTPUT = snap7.S7AreaPA;  // Output area (%Q)
    this.S7_WL_BYTE = snap7.S7WLByte;      // Word length: byte
  }

  /**
   * Data Block'tan INT (16-bit işaretli tamsayı) oku
   * @param {number} dbNumber - Data Block numarası
   * @param {number} offset - Byte kaydırması
   * @returns {Promise<number>}
   */
  async readInt(dbNumber, offset) {
    try {
      await this.connection.ensureConnected();
      
      const buffer = Buffer.alloc(2);
      const result = this.client.DBRead(dbNumber, offset, 2, buffer);
      
      if (result === 0) {
        return buffer.readInt16BE(0);
      } else {
        throw new Error(`DB okuma hatası (Kod: ${result})`);
      }
    } catch (error) {
      console.error(`INT okuma hatası [DB${dbNumber}:${offset}]:`, error.message);
      throw error;
    }
  }

  /**
   * Data Block'tan DINT (32-bit işaretli tamsayı) oku
   * @param {number} dbNumber - Data Block numarası
   * @param {number} offset - Byte kaydırması
   * @returns {Promise<number>}
   */
  async readDInt(dbNumber, offset) {
    try {
      await this.connection.ensureConnected();
      
      const buffer = Buffer.alloc(4);
      const result = this.client.DBRead(dbNumber, offset, 4, buffer);
      
      if (result === 0) {
        return buffer.readInt32BE(0);
      } else {
        throw new Error(`DB okuma hatası (Kod: ${result})`);
      }
    } catch (error) {
      console.error(`DINT okuma hatası [DB${dbNumber}:${offset}]:`, error.message);
      throw error;
    }
  }

  /**
   * Data Block'tan REAL (32-bit kayan nokta) oku
   * @param {number} dbNumber - Data Block numarası
   * @param {number} offset - Byte kaydırması
   * @returns {Promise<number>}
   */
  async readReal(dbNumber, offset) {
    try {
      await this.connection.ensureConnected();
      
      const buffer = Buffer.alloc(4);
      const result = this.client.DBRead(dbNumber, offset, 4, buffer);
      
      if (result === 0) {
        return buffer.readFloatBE(0);
      } else {
        throw new Error(`DB okuma hatası (Kod: ${result})`);
      }
    } catch (error) {
      console.error(`REAL okuma hatası [DB${dbNumber}:${offset}]:`, error.message);
      throw error;
    }
  }

  /**
   * Data Block'tan BOOL (bit) oku
   * @param {number} dbNumber - Data Block numarası
   * @param {number} byteOffset - Byte kaydırması
   * @param {number} bitOffset - Bit kaydırması (0-7)
   * @returns {Promise<boolean>}
   */
  async readBool(dbNumber, byteOffset, bitOffset = 0) {
    try {
      await this.connection.ensureConnected();
      
      const buffer = Buffer.alloc(1);
      const result = this.client.DBRead(dbNumber, byteOffset, 1, buffer);
      
      if (result === 0) {
        const byte = buffer[0];
        return ((byte >> bitOffset) & 1) === 1;
      } else {
        throw new Error(`DB okuma hatası (Kod: ${result})`);
      }
    } catch (error) {
      console.error(`BOOL okuma hatası [DB${dbNumber}:${byteOffset}.${bitOffset}]:`, error.message);
      throw error;
    }
  }

  /**
   * Data Block'tan STRING oku
   * @param {number} dbNumber - Data Block numarası
   * @param {number} offset - Byte kaydırması
   * @param {number} maxLength - Maksimum uzunluk
   * @returns {Promise<string>}
   */
  async readString(dbNumber, offset, maxLength = 256) {
    try {
      await this.connection.ensureConnected();
      
      const buffer = Buffer.alloc(maxLength);
      const result = this.client.DBRead(dbNumber, offset, maxLength, buffer);
      
      if (result === 0) {
        // S7 String format: ilk 2 byte maksimum uzunluk, 3. byte gerçek uzunluk
        const realLength = buffer[1];
        return buffer.toString('utf8', 2, 2 + realLength);
      } else {
        throw new Error(`DB okuma hatası (Kod: ${result})`);
      }
    } catch (error) {
      console.error(`STRING okuma hatası [DB${dbNumber}:${offset}]:`, error.message);
      throw error;
    }
  }

  /**
   * Data Block'tan belirtilen bayt sayısını oku (Raw)
   * @param {number} dbNumber - Data Block numarası
   * @param {number} offset - Byte kaydırması
   * @param {number} length - Bayt sayısı
   * @returns {Promise<Buffer>}
   */
  async readBytes(dbNumber, offset, length) {
    try {
      await this.connection.ensureConnected();
      
      const buffer = Buffer.alloc(length);
      const result = this.client.DBRead(dbNumber, offset, length, buffer);
      
      if (result === 0) {
        return buffer;
      } else {
        throw new Error(`DB okuma hatası (Kod: ${result})`);
      }
    } catch (error) {
      console.error(`BYTES okuma hatası [DB${dbNumber}:${offset}:${length}]:`, error.message);
      throw error;
    }
  }

  /**
   * Input (I) alanından INT oku
   * @param {number} offset - Bayt kaydırması
   * @returns {Promise<number>}
   */
  async readInputInt(offset) {
    try {
      await this.connection.ensureConnected();
      
      const buffer = Buffer.alloc(2);
      const result = this.client.ReadArea(snap7.S7AreaPE, 0, offset, 2, snap7.S7WLByte, buffer);
      
      if (result === 0) {
        return buffer.readInt16BE(0);
      } else {
        throw new Error(`Input okuma hatası (Kod: ${result})`);
      }
    } catch (error) {
      console.error(`Input INT okuma hatası [${offset}]:`, error.message);
      throw error;
    }
  }

  /**
   * Output (Q) alanından INT oku
   * @param {number} offset - Bayt kaydırması
   * @returns {Promise<number>}
   */
  async readOutputInt(offset) {
    try {
      await this.connection.ensureConnected();
      
      const buffer = Buffer.alloc(2);
      const result = this.client.ReadArea(snap7.S7AreaPA, 0, offset, 2, snap7.WLByte, buffer);
      
      if (result === 0) {
        return buffer.readInt16BE(0);
      } else {
        throw new Error(`Output okuma hatası (Kod: ${result})`);
      }
    } catch (error) {
      console.error(`Output INT okuma hatası [${offset}]:`, error.message);
      throw error;
    }
  }

  /**
   * Merkezi Memory (M) alanından INT oku
   * @param {number} offset - Bayt kaydırması
   * @returns {Promise<number>}
   */
  async readMemoryInt(offset) {
    try {
      await this.connection.ensureConnected();
      
      const buffer = Buffer.alloc(2);
      const result = this.client.ReadArea(snap7.S7AreaMK, 0, offset, 2, snap7.S7WLByte, buffer);
      
      if (result === 0) {
        return buffer.readInt16BE(0);
      } else {
        throw new Error(`Memory okuma hatası (Kod: ${result})`);
      }
    } catch (error) {
      console.error(`Memory INT okuma hatası [${offset}]:`, error.message);
      throw error;
    }
  }

  /**
   * Birden fazla tag'i aynı anda oku (daha verimli)
   * @param {Array} tags - [{type: 'int', db: 1, offset: 0}, ...]
   * @returns {Promise<Array>} - [value1, value2, ...]
   */
  async readMultipleTags(tags) {
    try {
      const results = [];
      
      for (const tag of tags) {
        let value;
        
        switch (tag.type.toLowerCase()) {
          case 'int':
            value = await this.readInt(tag.db, tag.offset);
            break;
          case 'dint':
            value = await this.readDInt(tag.db, tag.offset);
            break;
          case 'real':
            value = await this.readReal(tag.db, tag.offset);
            break;
          case 'bool':
            value = await this.readBool(tag.db, tag.offset, tag.bit || 0);
            break;
          case 'string':
            value = await this.readString(tag.db, tag.offset, tag.length || 256);
            break;
          default:
            throw new Error(`Desteklenmeyen tip: ${tag.type}`);
        }
        
        results.push({
          ...tag,
          value: value,
          timestamp: new Date().toISOString(),
          success: true
        });
      }
      
      return results;
    } catch (error) {
      console.error('Birden fazla tag okuma hatası:', error.message);
      throw error;
    }
  }

  /**
   * Memory alanından REAL oku (%MD)
   * @param {number} offset - Byte kaydırması
   * @returns {Promise<number>}
   */
  async readMemoryReal(offset) {
    try {
      await this.connection.ensureConnected();
      
      const buffer = Buffer.alloc(4);
      const result = this.client.ReadArea(this.S7_AREA_MEMORY, 0, offset, 4, this.S7_WL_BYTE, buffer);
      
      if (result === 0) {
        return buffer.readFloatBE(0);
      } else {
        throw new Error(`Memory okuma hatası (Kod: ${result})`);
      }
    } catch (error) {
      console.error(`Memory REAL okuma hatası [%MD${offset}]:`, error.message);
      throw error;
    }
  }

  /**
   * Input alanından REAL oku (%ID)
   * @param {number} offset - Byte kaydırması
   * @returns {Promise<number>}
   */
  async readInputReal(offset) {
    try {
      await this.connection.ensureConnected();
      
      const buffer = Buffer.alloc(4);
      const result = this.client.ReadArea(this.S7_AREA_INPUT, 0, offset, 4, this.S7_WL_BYTE, buffer);
      
      if (result === 0) {
        return buffer.readFloatBE(0);
      } else {
        throw new Error(`Input okuma hatası (Kod: ${result})`);
      }
    } catch (error) {
      console.error(`Input REAL okuma hatası [%ID${offset}]:`, error.message);
      throw error;
    }
  }

  /**
   * Yapılandırılmış tag'ı oku (tags.js tarafından tanımlanan yapı)
   * @param {Object} tag - Tag tanımı {type, area, offset}
   * @returns {Promise<{value, timestamp, unit}>}
   */
  async readConfiguredTag(tag) {
    try {
      await this.connection.ensureConnected();
      
      let value;
      const tagInfo = `[${tag.name}]`;

      if (tag.area === 'memory') {
        switch (tag.type.toLowerCase()) {
          case 'real':
            value = await this.readMemoryReal(tag.offset);
            break;
          case 'int':
            value = await this.readMemoryInt(tag.offset);
            break;
          default:
            throw new Error(`Desteklenmeyen tip: ${tag.type}`);
        }
      } else if (tag.area === 'input') {
        switch (tag.type.toLowerCase()) {
          case 'real':
            value = await this.readInputReal(tag.offset);
            break;
          case 'int':
            value = await this.readInputInt(tag.offset);
            break;
          default:
            throw new Error(`Desteklenmeyen tip: ${tag.type}`);
        }
      } else {
        throw new Error(`Desteklenmeyen alan: ${tag.area}`);
      }

      return {
        id: tag.id,
        name: tag.name,
        value: value,
        unit: tag.unit,
        timestamp: new Date().toISOString(),
        success: true
      };
    } catch (error) {
      console.error(`Tag okuma hatası [${tag.name}]:`, error.message);
      return {
        id: tag.id,
        name: tag.name,
        value: null,
        unit: tag.unit,
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Birden fazla yapılandırılmış tag'ı oku
   * @param {Array} tags - Tag listesi
   * @returns {Promise<Array>}
   */
  async readConfiguredTags(tags) {
    const results = [];
    
    for (const tag of tags) {
      const result = await this.readConfiguredTag(tag);
      results.push(result);
    }
    
    return results;
  }
}

module.exports = TagReader;
