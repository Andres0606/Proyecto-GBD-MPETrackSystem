const express = require('express');
const router = express.Router();
const { oracledb } = require('../config/db');

// RUTA: Listar tipos de trámite para solicitud de citas
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
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Obtener trámites del asesor
router.get('/asesor/:cedula', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const sql = `
      SELECT 
        t.idTramite as "idTramite",
        t.idCita as "idCita",
        p.nDocumento as "idCliente",
        p.nombres || ' ' || p.apellidos as "cliente",
        p.telefono as "telefono",
        p.correo as "correo",
        v.Placa as "vehiculo",
        tt.nombre as "tipoTramite",
        NVL(tt.valorBase, 0) as "valorTramite",
        NVL(t.valorOtroConceptos, 0) as "valorOtrosConceptos",
        t.estadoTramite as "estadoTramite",
        c.fechaHoraSolicitud as "fechaCreacion",
        c.fechaHoraProgramada as "fechaCita",
        c.esElDueno as "esElDueno",
        c.idClienteExterno as "idExterno",
        ce.nombres as "nombreDuenioActual",
        ce.apellido as "apellidoDuenioActual",
        ce.cedula as "cedulaDuenioActual",
        CASE 
          WHEN tt.nombre = 'Traspaso' THEN NVL(TRIM(pd.nombres || ' ' || pd.apellidos), TRIM(ce.nombres || ' ' || ce.apellido))
          ELSE NULL 
        END as "nombreDestino",
        CASE 
          WHEN tt.nombre = 'Traspaso' THEN NVL(pd.nDocumento, ce.cedula)
          ELSE NULL 
        END as "cedulaDestino",
        pd.telefono as "telefonoDestino",
        pd.correo as "correoDestino"
      FROM TRAMITE t
      JOIN CITA c ON t.idCita = c.idCita
      JOIN ASESOR a ON c.idAsesor = a.idAsesor
      JOIN CLIENTE cl ON c.idCliente = cl.idCliente
      JOIN PERSONA p ON cl.nDocumento = p.nDocumento
      LEFT JOIN CLIENTE cld ON c.idClienteDestino = cld.idCliente
      LEFT JOIN PERSONA pd ON cld.nDocumento = pd.nDocumento
      LEFT JOIN CLIENTEEXTERNO ce ON c.idClienteExterno = ce.idExterno
      LEFT JOIN VEHICULO v ON c.placaVehiculo = v.Placa
      JOIN TIPOTRAMITE tt ON c.tipoTramite = tt.idTipoTramite
      WHERE a.nDocumento = :1
      ORDER BY t.idTramite DESC
    `;
    
    const result = await connection.execute(sql, [req.params.cedula], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.json({ status: 'OK', tramites: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// NUEVA RUTA: Obtener trámites de un cliente específico (Para "Mis Trámites")
router.get('/cliente/:cedula', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const sql = `
      SELECT * FROM vw_mis_tramites 
      WHERE "cedula_cliente" = :1
      ORDER BY "idTramite" DESC
    `;
    
    const result = await connection.execute(sql, [req.params.cedula], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.json({ status: 'OK', tramites: result.rows });
  } catch (err) {
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
    res.json({ status: 'OK', mensaje: 'Trámite registrado', idTramite: result.outBinds.id[0] });
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Actualizar Estado
router.put('/estado', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const { idTramite, estado } = req.body;
    await connection.execute("UPDATE TRAMITE SET ESTADOTRAMITE = :1 WHERE IDTRAMITE = :2", [estado, idTramite]);
    await connection.commit();
    res.json({ status: 'OK', mensaje: 'Estado actualizado' });
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
