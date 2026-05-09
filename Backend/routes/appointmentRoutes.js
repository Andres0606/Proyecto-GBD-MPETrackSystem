const express = require('express');
const router = express.Router();
const { oracledb } = require('../config/db');

// 1. Solicitar Cita (Con soporte para Clientes Externos y Destinatarios)
router.post('/solicitar', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const data = req.body; 
    
    const clientRes = await connection.execute(
      'SELECT idCliente FROM CLIENTE WHERE nDocumento = :1',
      [data.idCliente],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (clientRes.rows.length === 0) throw new Error('Cliente solicitante no encontrado');
    const realIdCliente = clientRes.rows[0].IDCLIENTE;

    let realIdDestino = null;
    let realIdExterno = null;

    if (data.cedulaDestino) {
      const destRes = await connection.execute(
        'SELECT idCliente FROM CLIENTE WHERE nDocumento = :1',
        [data.cedulaDestino],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      if (destRes.rows.length > 0) {
        realIdDestino = destRes.rows[0].IDCLIENTE;
      } else {
        const cedulaExt = data.cedulaDestino || data.cedulaDuenioActual;
        const nombreExt = data.nombreReceptorExterno || data.nombreDuenioActual;
        const apellidoExt = data.apellidoReceptorExterno || data.apellidoDuenioActual;

        if (cedulaExt && nombreExt) {
          const extExistRes = await connection.execute(
            'SELECT idExterno FROM CLIENTEEXTERNO WHERE cedula = :1',
            [cedulaExt.toString()],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
          );

          if (extExistRes.rows.length > 0) {
            realIdExterno = extExistRes.rows[0].IDEXTERNO;
          } else {
            const sqlExt = `
              INSERT INTO CLIENTEEXTERNO (idExterno, cedula, nombres, apellido)
              VALUES (seq_externo.NEXTVAL, :cedula, :nombres, :apellido)
              RETURNING idExterno INTO :id
            `;
            const extInsertRes = await connection.execute(sqlExt, {
              cedula: cedulaExt.toString(),
              nombres: nombreExt,
              apellido: apellidoExt || '',
              id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
            });
            realIdExterno = extInsertRes.outBinds.id[0];
          }
        }
      }
    }

    const asesorRes = await connection.execute('SELECT idAsesor FROM ASESOR WHERE ROWNUM = 1');
    const idAsesor = asesorRes.rows.length > 0 ? asesorRes.rows[0][0] : 1;

    const sql = `
      INSERT INTO CITA (
        idCita, idCliente, idAsesor, placaVehiculo, tipoTramite, estadoCita, 
        FECHAHORAPROGRAMADA, idClienteDestino, idClienteExterno, esElDueno
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
        c.idCita as "idCita",
        p.nombres || ' ' || p.apellidos as "cliente",
        p.telefono as "telefono",
        p.correo as "correo",
        v.Placa || ' (' || v.Marca || ')' as "vehiculo",
        tt.nombre as "tipoTramite",
        tt.valorBase as "valorBase",
        c.fechaHoraSolicitud as "fechaSolicitud",
        NVL(pd.nombres || ' ' || pd.apellidos, ce.nombres || ' ' || ce.apellido) as "nombreDestinatario",
        NVL(pd.nDocumento, ce.cedula) as "cedulaDestinatario"
      FROM CITA c
      JOIN CLIENTE cl ON c.idCliente = cl.idCliente
      JOIN PERSONA p ON cl.nDocumento = p.nDocumento
      LEFT JOIN CLIENTE cld ON c.idClienteDestino = cld.idCliente
      LEFT JOIN PERSONA pd ON cld.nDocumento = pd.nDocumento
      LEFT JOIN CLIENTEEXTERNO ce ON c.idClienteExterno = ce.idExterno
      LEFT JOIN VEHICULO v ON c.placaVehiculo = v.Placa
      JOIN TIPOTRAMITE tt ON c.tipoTramite = tt.idTipoTramite
      CROSS JOIN ASESOR a 
      WHERE a.nDocumento = :1 AND c.estadoCita = 'PENDIENTE'
    `;
    const result = await connection.execute(sql, [req.params.cedula], { outFormat: oracledb.OUT_FORMAT_OBJECT });
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
        c.idCita as "idCita",
        p.nombres || ' ' || p.apellidos as "cliente",
        p.telefono as "telefono",
        p.correo as "correo",
        v.Placa || ' (' || v.Marca || ')' as "vehiculo",
        tt.nombre as "tipoTramite",
        tt.valorBase as "valorBase",
        c.fechaHoraProgramada as "fechaProgramada",
        NVL(pd.nombres || ' ' || pd.apellidos, ce.nombres || ' ' || ce.apellido) as "nombreDestinatario"
      FROM CITA c
      JOIN ASESOR a ON c.idAsesor = a.idAsesor
      JOIN CLIENTE cl ON c.idCliente = cl.idCliente
      JOIN PERSONA p ON cl.nDocumento = p.nDocumento
      LEFT JOIN CLIENTE cld ON c.idClienteDestino = cld.idCliente
      LEFT JOIN PERSONA pd ON cld.nDocumento = pd.nDocumento
      LEFT JOIN CLIENTEEXTERNO ce ON c.idClienteExterno = ce.idExterno
      LEFT JOIN VEHICULO v ON c.placaVehiculo = v.Placa
      JOIN TIPOTRAMITE tt ON c.tipoTramite = tt.idTipoTramite
      WHERE a.nDocumento = :1 AND c.estadoCita = 'Agendada'
    `;
    const result = await connection.execute(sql, [req.params.cedula], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.json({ status: 'OK', citas: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// 4. Cancelar Cita
router.post('/cancelar', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    await connection.execute("UPDATE CITA SET estadoCita = 'Cancelada' WHERE idCita = :1", [req.body.idCita]);
    await connection.commit();
    res.json({ status: 'OK', mensaje: 'Cita cancelada' });
  } catch (err) { if (connection) await connection.rollback(); res.status(500).json({ status: 'ERROR', mensaje: err.message }); }
  finally { if (connection) await connection.close(); }
});

// 5. Atender/Agendar Cita
router.post('/atender', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const { idCita, idAsesor, fechaProgramada } = req.body;
    const asesorRes = await connection.execute('SELECT idAsesor FROM ASESOR WHERE nDocumento = :1', [idAsesor], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    if (asesorRes.rows.length === 0) throw new Error('Asesor no encontrado');
    const realIdAsesor = asesorRes.rows[0].IDASESOR;

    const sql = `UPDATE CITA SET idAsesor = :idAsesor, estadoCita = 'Agendada', fechaHoraProgramada = TO_TIMESTAMP(:fecha, 'YYYY-MM-DD"T"HH24:MI') WHERE idCita = :idCita`;
    await connection.execute(sql, { idAsesor: realIdAsesor, fecha: fechaProgramada, idCita: idCita });
    await connection.commit();
    res.json({ status: 'OK', mensaje: 'Cita agendada' });
  } catch (err) { if (connection) await connection.rollback(); res.status(500).json({ status: 'ERROR', mensaje: err.message }); }
  finally { if (connection) await connection.close(); }
});

// 6. Completar Cita
router.post('/completar', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    await connection.execute("UPDATE CITA SET estadoCita = 'Atendida' WHERE idCita = :1", [req.body.idCita]);
    await connection.commit();
    res.json({ status: 'OK', mensaje: 'Cita atendida' });
  } catch (err) { if (connection) await connection.rollback(); res.status(500).json({ status: 'ERROR', mensaje: err.message }); }
  finally { if (connection) await connection.close(); }
});

module.exports = router;
