const express = require('express');
const router = express.Router();
const { oracledb } = require('../config/db');

router.get('/list', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      'SELECT idTipoTramite as "id", nombre as "nombre", valorBase as "valorBase", requiereVehiculo as "requiereVehiculo" FROM TIPOTRAMITE',
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json({ status: 'OK', tiposTramite: result.rows });
  } catch (err) {
    console.error('Error fetching tramites:', err);
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

router.get('/asesor/:cedula', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const sql = `
      SELECT 
        t.idTramite as "idTramite",
        t.idCita as "idCita",
        p.nombres || ' ' || p.apellidos as "cliente",
        p.telefono as "telefono",
        p.correo as "correo",
        v.Placa || ' (' || v.Marca || ')' as "vehiculo",
        tt.nombre as "tipoTramite",
        tt.valorBase as "valorTramite",
        t.valorOtroConceptos as "valorOtrosConceptos",
        t.estadoTramite as "estadoTramite",
        c.fechaHoraSolicitud as "fechaCreacion",
        c.fechaHoraProgramada as "fechaCita"
      FROM TRAMITE t
      JOIN CITA c ON t.idCita = c.idCita
      JOIN ASESOR a ON c.idAsesor = a.idAsesor
      JOIN CLIENTE cl ON c.idCliente = cl.idCliente
      JOIN PERSONA p ON cl.nDocumento = p.nDocumento
      LEFT JOIN VEHICULO v ON c.placaVehiculo = v.Placa
      JOIN TIPOTRAMITE tt ON c.tipoTramite = tt.idTipoTramite
      WHERE a.nDocumento = :1
      ORDER BY t.idTramite DESC
    `;
    
    const result = await connection.execute(sql, [req.params.cedula], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.json({ status: 'OK', tramites: result.rows });
  } catch (err) {
    console.error('Error fetching advisor tramites:', err);
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Registrar Trámite Finalizado
router.post('/register', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const { idCita, valorOtrosConceptos } = req.body;
    
    const sql = `
      INSERT INTO TRAMITE (IDTRAMITE, IDCITA, ESTADOTRAMITE, VALOROTROCONCEPTOS)
      VALUES (seq_tramite.NEXTVAL, :idCita, 'Activo', :otros)
      RETURNING IDTRAMITE INTO :id
    `;
    
    const result = await connection.execute(sql, {
      idCita: idCita,
      otros: valorOtrosConceptos || 0,
      id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
    });
    
    await connection.commit();
    res.json({ 
      status: 'OK', 
      mensaje: 'Trámite registrado correctamente', 
      idTramite: result.outBinds.id[0] 
    });
  } catch (err) {
    console.error('Error registering tramite:', err);
    if (connection) await connection.rollback();
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Actualizar Estado del Trámite
router.put('/estado', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const { idTramite, estado } = req.body;
    
    await connection.execute(
      "UPDATE TRAMITE SET ESTADOTRAMITE = :1 WHERE IDTRAMITE = :2",
      [estado, idTramite]
    );
    
    await connection.commit();
    res.json({ status: 'OK', mensaje: 'Estado actualizado correctamente' });
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
