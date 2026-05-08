const { oracledb } = require('../config/db');

class ClienteRepository {
  async createCliente(connection, clienteData) {
    const sql = `
      INSERT INTO CLIENTE (
        idCliente, nDocumento, LicenciaConduccion
      ) VALUES (
        seq_cliente.NEXTVAL, :nDocumento, :licenciaConduccion
      )
    `;
    await connection.execute(sql, clienteData, { autoCommit: false });
  }
}

module.exports = new ClienteRepository();
