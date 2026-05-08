const oracledb = require('oracledb');
const dotenv = require('dotenv');

dotenv.config();

async function initialize() {
  try {
    // For local development with wallet, we might need to specify TNS_ADMIN
    // If using oracledb Thin mode (default in v6+), you can pass configDir
    await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
      poolMin: 1,
      poolMax: 10,
      poolIncrement: 1
    });
    console.log('Oracle Connection Pool initialized');
  } catch (err) {
    throw err;
  }
}

async function close() {
  await oracledb.getPool().close(0);
}

module.exports = {
  initialize,
  close,
  oracledb
};
