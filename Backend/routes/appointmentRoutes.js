const express = require('express');
const router = express.Router();
const { oracledb } = require('../config/db');

// 1. Solicitar Cita
router.post('/solicitar', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const data = req.body; 
    
    const clientRes = await connection.execute(
      'SELECT IDCLIENTE FROM CLIENTE WHERE NDOCUMENTO = :1',
      [data.idCliente],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (clientRes.rows.length === 0) throw new Error('Cliente solicitante no encontrado');
    const realIdCliente = clientRes.rows[0].IDCLIENTE;

    let realIdDestino = null;
    let realIdExterno = null;

    const cedulaContraparte = data.cedulaDestino || data.cedulaDuenioActual;
    
    if (cedulaContraparte) {
      const destRes = await connection.execute(
        'SELECT IDCLIENTE FROM CLIENTE WHERE NDOCUMENTO = :1',
        [cedulaContraparte],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (destRes.rows.length > 0) {
        realIdDestino = destRes.rows[0].IDCLIENTE;
      } else {
        const nombreExt = data.nombreReceptorExterno || data.nombreDuenioActual;
        const apellidoExt = data.apellidoReceptorExterno || data.apellidoDuenioActual;

        if (nombreExt) {
          const extExistRes = await connection.execute(
            'SELECT IDEXTERNO FROM CLIENTEEXTERNO WHERE CEDULA = :1',
            [cedulaContraparte.toString()],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
          );

          if (extExistRes.rows.length > 0) {
            realIdExterno = extExistRes.rows[0].IDEXTERNO;
            await connection.execute(
              'UPDATE CLIENTEEXTERNO SET NOMBRES = :1, APELLIDO = :2 WHERE IDEXTERNO = :3',
              [nombreExt, apellidoExt || '', realIdExterno]
            );
          } else {
            const sqlExt = `
              INSERT INTO CLIENTEEXTERNO (IDEXTERNO, CEDULA, NOMBRES, APELLIDO)
              VALUES (seq_externo.NEXTVAL, :cedula, :nombres, :apellido)
              RETURNING IDEXTERNO INTO :id
            `;
            const extInsertRes = await connection.execute(sqlExt, {
              cedula: cedulaContraparte.toString(),
              nombres: nombreExt,
              apellido: apellidoExt || '',
              id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
            });
            realIdExterno = extInsertRes.outBinds.id[0];
          }
        }
      }
    }

    const asesorRes = await connection.execute('SELECT IDASESOR FROM ASESOR WHERE ROWNUM = 1');
    const idAsesor = asesorRes.rows.length > 0 ? asesorRes.rows[0][0] : 1;

    const sql = `
      INSERT INTO CITA (
        IDCITA, IDCLIENTE, IDASESOR, PLACAVEHICULO, TIPOTRAMITE, ESTADOCITA, 
        FECHAHORAPROGRAMADA, IDCLIENTEDESTINO, IDCLIENTEEXTERNO, ESELDUENO
      ) VALUES (
        seq_cita.NEXTVAL, :idCliente, :idAsesor, :placa, :tipo, 'PENDIENTE', 
        CURRENT_TIMESTAMP + INTERVAL '1' DAY, :idDestino, :idExterno, :esDueno
      )
    `;
    
    await connection.execute(sql, {
      idCliente: realIdCliente,
      idAsesor: idAsesor,
      placa: data.idVehiculo || null,
      tipo: data.idTipoTramite,
      idDestino: realIdDestino,
      idExterno: realIdExterno,
      esDueno: data.esDueno || 'S'
    });
    
    await connection.commit();
    res.json({ status: 'OK', mensaje: 'Cita solicitada correctamente' });
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// 2. Citas Pendientes
router.get('/pendientes/:cedula', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const sql = `
      SELECT 
        c.IDCITA as "idCita",
        p.NOMBRES || ' ' || p.APELLIDOS as "cliente",
        p.TELEFONO as "telefono",
        p.CORREO as "correo",
        v.PLACA || ' (' || v.MARCA || ')' as "vehiculo",
        tt.NOMBRE as "tipoTramite",
        tt.VALORBASE as "valorBase",
        c.FECHAHORASOLICITUD as "fechaSolicitud",
        NVL(pd.NOMBRES || ' ' || pd.APELLIDOS, ce.NOMBRES || ' ' || ce.APELLIDO) as "nombreDestinatario",
        NVL(pd.NDOCUMENTO, ce.CEDULA) as "cedulaDestinatario"
      FROM CITA c
      JOIN CLIENTE cl ON c.IDCLIENTE = cl.IDCLIENTE
      JOIN PERSONA p ON cl.NDOCUMENTO = p.NDOCUMENTO
      LEFT JOIN CLIENTE cld ON c.IDCLIENTEDESTINO = cld.IDCLIENTE
      LEFT JOIN PERSONA pd ON cld.NDOCUMENTO = pd.NDOCUMENTO
      LEFT JOIN CLIENTEEXTERNO ce ON c.IDCLIENTEEXTERNO = ce.IDEXTERNO
      LEFT JOIN VEHICULO v ON c.PLACAVEHICULO = v.PLACA
      JOIN TIPOTRAMITE tt ON c.TIPOTRAMITE = tt.IDTIPOTRAMITE
      WHERE c.ESTADOCITA = 'PENDIENTE'
      ORDER BY c.FECHAHORASOLICITUD DESC
    `;
    const result = await connection.execute(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.json({ status: 'OK', citas: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// 3. Citas Agendadas
router.get('/agendadas/:cedula', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const sql = `
      SELECT 
        c.IDCITA as "idCita",
        p.NOMBRES || ' ' || p.APELLIDOS as "cliente",
        p.TELEFONO as "telefono",
        p.CORREO as "correo",
        v.PLACA || ' (' || v.MARCA || ')' as "vehiculo",
        tt.NOMBRE as "tipoTramite",
        tt.VALORBASE as "valorBase",
        c.FECHAHORAPROGRAMADA as "fechaProgramada",
        NVL(pd.NOMBRES || ' ' || pd.APELLIDOS, ce.NOMBRES || ' ' || ce.APELLIDO) as "nombreDestinatario",
        NVL(pd.NDOCUMENTO, ce.CEDULA) as "cedulaDestinatario"
      FROM CITA c
      JOIN ASESOR a ON c.IDASESOR = a.IDASESOR
      JOIN CLIENTE cl ON c.IDCLIENTE = cl.IDCLIENTE
      JOIN PERSONA p ON cl.NDOCUMENTO = p.NDOCUMENTO
      LEFT JOIN CLIENTE cld ON c.IDCLIENTEDESTINO = cld.IDCLIENTE
      LEFT JOIN PERSONA pd ON cld.NDOCUMENTO = pd.NDOCUMENTO
      LEFT JOIN CLIENTEEXTERNO ce ON c.IDCLIENTEEXTERNO = ce.IDEXTERNO
      LEFT JOIN VEHICULO v ON c.PLACAVEHICULO = v.PLACA
      JOIN TIPOTRAMITE tt ON c.TIPOTRAMITE = tt.IDTIPOTRAMITE
      WHERE a.NDOCUMENTO = :1 AND c.ESTADOCITA = 'Agendada'
      ORDER BY c.FECHAHORAPROGRAMADA ASC
    `;
    const result = await connection.execute(sql, [req.params.cedula], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.json({ status: 'OK', citas: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// 4. Atender Cita
router.post('/atender', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const { idCita, idAsesor, fechaProgramada } = req.body;
    const asesorRes = await connection.execute("SELECT IDASESOR FROM ASESOR WHERE NDOCUMENTO = :1", [idAsesor]);
    if (asesorRes.rows.length === 0) throw new Error('Asesor no encontrado');
    const realIdAsesor = asesorRes.rows[0][0];

    const sql = `UPDATE CITA SET ESTADOCITA = 'Agendada', IDASESOR = :1, FECHAHORAPROGRAMADA = TO_TIMESTAMP(:2, 'YYYY-MM-DD"T"HH24:MI') WHERE IDCITA = :3`;
    await connection.execute(sql, [realIdAsesor, fechaProgramada, idCita]);
    await connection.commit();
    res.json({ status: 'OK', mensaje: 'Cita agendada exitosamente' });
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// 5. Cancelar Cita (POST compatible con frontend)
router.post('/cancelar', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const { idCita } = req.body;
    await connection.execute("UPDATE CITA SET ESTADOCITA = 'Cancelada' WHERE IDCITA = :1", [idCita]);
    await connection.commit();
    res.json({ status: 'OK', mensaje: 'Cita cancelada' });
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// 6. Completar Cita (POST compatible con frontend)
router.post('/completar', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const { idCita } = req.body;
    await connection.execute("UPDATE CITA SET ESTADOCITA = 'Atendida' WHERE IDCITA = :1", [idCita]);
    await connection.commit();
    res.json({ status: 'OK', mensaje: 'Cita completada exitosamente' });
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
