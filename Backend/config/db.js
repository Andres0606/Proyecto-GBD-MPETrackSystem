const oracledb = require('oracledb');
const dotenv = require('dotenv');

dotenv.config();

// Inicializar Oracle Instant Client
oracledb.initOracleClient({
  libDir: '/opt/oracle/instantclient_23_8'
});

async function initialize() {
  try {
    await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
      configDir: process.env.WALLET_PATH,
      poolMin: 1,
      poolMax: 10,
      poolIncrement: 1
    });
    console.log('Oracle Connection Pool initialized');
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function close() {
  await oracledb.getPool().close(0);
}

// Helper para obtener conexión con identidad de usuario
const getConnection = async (userCedula = 'SISTEMA') => {
  const conn = await oracledb.getConnection();
  
  // Ejecutamos el comando directo de Oracle para setear la identidad
  // Esto es más robusto que la propiedad clientIdentifier
  await conn.execute(
    `BEGIN DBMS_SESSION.SET_IDENTIFIER(:id); END;`,
    { id: userCedula.toString() }
  );
  
  return conn;
};

module.exports = {
  initialize,
  close,
  oracledb,
  getConnection
};
