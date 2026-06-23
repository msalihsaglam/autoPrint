require('dotenv').config();

module.exports = {
  plc: {
    host: process.env.PLC_HOST || '192.168.0.1',
    rack: parseInt(process.env.PLC_RACK || '0'),
    slot: parseInt(process.env.PLC_SLOT || '1'),
    timeout: parseInt(process.env.PLC_TIMEOUT || '5000'),
    connectTimeout: parseInt(process.env.PLC_CONNECT_TIMEOUT || '3000'),
  },
  app: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
  },
  log: {
    level: process.env.LOG_LEVEL || 'info',
  }
};
