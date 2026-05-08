const { oracledb } = require('../config/db');

class PersonaRepository {
  async findByDocumento(nDocumento) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      const result = await connection.execute(
        `SELECT * FROM PERSONA WHERE nDocumento = :1`,
        [nDocumento],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows[0];
    } finally {
      if (connection) await connection.close();
    }
  }

  async findByCorreo(correo) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      const result = await connection.execute(
        `SELECT * FROM PERSONA WHERE correo = :1`,
        [correo],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows[0];
    } finally {
      if (connection) await connection.close();
    }
  }

  async createPersona(personaData) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      const sql = `
        INSERT INTO PERSONA (
          nDocumento, tipoDocumento, nombres, apellidos, 
          correo, contrasena, fechaNacimiento, telefono
        ) VALUES (
          :nDocumento, :tipoDocumento, :nombres, :apellidos, 
          :correo, :contrasena, TO_DATE(:fechaNacimiento, 'DD/MM/YYYY'), :telefono
        )
      `;
      await connection.execute(sql, personaData, { autoCommit: false });
      return connection; // Return connection to continue transaction if needed
    } catch (err) {
      if (connection) await connection.close();
      throw err;
    }
  }
}

module.exports = new PersonaRepository();
