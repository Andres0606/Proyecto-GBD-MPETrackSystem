const express = require('express');
const router = express.Router();
const { oracledb } = require('../config/db');

router.post('/solicitar', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const data = req.body;
    
    // 1. Obtener ID interno del cliente usando su cédula (nDocumento)
    const clientRes = await connection.execute(
      'SELECT idCliente FROM CLIENTE WHERE nDocumento = :1',
      [data.idCliente],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (clientRes.rows.length === 0) {
      throw new Error('No se encontró el cliente con esa cédula');
    }
    const realIdCliente = clientRes.rows[0].IDCLIENTE;

    // 2. Obtener un asesor disponible (simplificado)
    const asesorRes = await connection.execute(
      'SELECT idAsesor FROM ASESOR WHERE ROWNUM = 1',
      [],
      { outFormat: oracledb.OUT_FORMAT_ARRAY }
    );
    const idAsesor = asesorRes.rows.length > 0 ? asesorRes.rows[0][0] : 1;

    // 3. Insertar la cita
    const sql = `
      INSERT INTO CITA (
        idCita, idCliente, idAsesor, placaVehiculo, tipoTramite, estadoCita, FECHAHORAPROGRAMADA
      ) VALUES (
        seq_cita.NEXTVAL, :idCliente, :idAsesor, :placaVehiculo, :tipoTramite, 'Agendada', 
        CURRENT_TIMESTAMP + INTERVAL '1' DAY
      )
    `;
    
    await connection.execute(sql, {
      idCliente: realIdCliente,
      idAsesor: idAsesor,
      placaVehiculo: data.idVehiculo || null,
      tipoTramite: data.idTipoTramite
    });
    
    await connection.commit();
    res.json({ status: 'OK', mensaje: 'Cita agendada correctamente' });
  } catch (err) {
    console.error('Error creating appointment:', err);
    if (connection) await connection.rollback();
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
