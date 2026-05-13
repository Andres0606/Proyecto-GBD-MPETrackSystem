const express = require('express');
const router = express.Router();
const { oracledb, getConnection } = require('../config/db');

// Solicitar nueva cita
router.post('/solicitar', async (req, res) => {
  let connection;
  try {
    const { userCedula } = req.body;
    connection = await getConnection(userCedula || 'CLIENTE_EXTERNO');
    const c = req.body;

    // 1. Obtener el IDCLIENTE real a partir de la cédula (NDOCUMENTO)
    const resCliente = await connection.execute(
      'SELECT IDCLIENTE FROM CLIENTE WHERE NDOCUMENTO = :1',
      [c.idCliente],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (resCliente.rows.length === 0) {
      return res.status(404).json({ status: 'ERROR', mensaje: 'No se encontró el cliente en la base de datos' });
    }

    const idClienteReal = resCliente.rows[0].IDCLIENTE;

    // 2. Manejo de la contraparte (Dueño o Comprador)
    let idDestinoReal = null;
    let idExternoReal = null;

    // Si hay una cédula de destino (traspaso)
    if (c.cedulaDestino) {
      // Intentamos buscarlo en CLIENTE (Registrados)
      const resDestino = await connection.execute(
        'SELECT IDCLIENTE FROM CLIENTE WHERE NDOCUMENTO = :1',
        [c.cedulaDestino],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (resDestino.rows.length > 0) {
        idDestinoReal = resDestino.rows[0].IDCLIENTE;
      } else {
        // No es cliente registrado -> Usar CLIENTEEXTERNO
        // Primero verificamos si ya existe en CLIENTEEXTERNO
        const resExterno = await connection.execute(
          'SELECT IDEXTERNO FROM CLIENTEEXTERNO WHERE CEDULA = :1',
          [c.cedulaDestino],
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (resExterno.rows.length > 0) {
          idExternoReal = resExterno.rows[0].IDEXTERNO;
        } else {
          // No existe -> Lo creamos
          // Determinamos los nombres/apellidos según quién sea el externo
          const nombres = c.nombreDuenioActual || c.nombreReceptorExterno || 'Desconocido';
          const apellidos = c.apellidoDuenioActual || c.apellidoReceptorExterno || 'Desconocido';

          const resNewExterno = await connection.execute(
            `INSERT INTO CLIENTEEXTERNO (IDEXTERNO, CEDULA, NOMBRES, APELLIDO) 
             VALUES (seq_clienteexterno.NEXTVAL, :1, :2, :3) 
             RETURNING IDEXTERNO INTO :id`,
            { 
              1: c.cedulaDestino, 
              2: nombres, 
              3: apellidos, 
              id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } 
            }
          );
          idExternoReal = resNewExterno.outBinds.id[0];
        }
      }
    }

    // 3. Normalizar 'esDueno' para Oracle (S/N)
    let esDuenoStr = 'S';
    if (c.esDueno === false || c.esDueno === 'N') esDuenoStr = 'N';

    const sql = `
      INSERT INTO CITA (IDCITA, IDCLIENTE, PLACAVEHICULO, TIPOTRAMITE, ESTADOCITA, FECHAHORASOLICITUD, ESELDUENO, IDCLIENTEEXTERNO, IDCLIENTEDESTINO, IDSEDE)
      VALUES (seq_cita.NEXTVAL, :idCliente, :placa, :idTipo, 'PENDIENTE', CURRENT_TIMESTAMP, :esDueno, :idExterno, :idDestino, :idSede)
    `;
    
    await connection.execute(sql, {
      idCliente: idClienteReal,
      placa: c.idVehiculo || null,
      idTipo: c.idTipoTramite,
      esDueno: esDuenoStr,
      idExterno: idExternoReal,
      idDestino: idDestinoReal,
      idSede: c.idSede
    });

    await connection.commit();
    res.json({ status: 'OK', mensaje: 'Cita solicitada correctamente' });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error en solicitar cita:', err.message);
    
    const msg = err.message.includes('ORA-20') 
      ? err.message.split('\n')[0].replace(/ORA-\d+:\s*/, '')
      : 'Error interno al procesar la cita: ' + err.message;
      
    res.status(500).json({ status: 'ERROR', mensaje: msg });
  } finally {
    if (connection) await connection.close();
  }
});



// Obtener citas ACTIVAS de un cliente específico (Que aún no son trámites)
router.get('/cliente/:cedula', async (req, res) => {
  const { cedula } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection();
    const sql = `
      SELECT 
        idCita as "idCita",
        tipoTramite as "tipoTramite",
        placa as "placa",
        fechaCita as "fechaCita",
        fechaSolicitud as "fechaSolicitud",
        asesor as "asesor",
        idAsesor as "idAsesor"
      FROM TABLE(fn_get_citas_cliente(:1))
      ORDER BY 
        CASE WHEN fechaCita IS NULL THEN 2 ELSE 1 END,
        fechaCita ASC,
        fechaSolicitud DESC
    `;
    const result = await connection.execute(sql, [cedula], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.json({ status: 'OK', citas: result.rows });
  } catch (err) { res.status(500).json({ status: 'ERROR', mensaje: err.message }); }
  finally { if (connection) await connection.close(); }
});

// Obtener citas pendientes para el asesor (Sin agendar)
router.get('/pendientes/:cedulaAsesor', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const sql = `
      SELECT * FROM vw_gestion_citas_asesor
      WHERE "fechaProgramada" IS NULL
      ORDER BY "fechaSolicitud" ASC
    `;
    const result = await connection.execute(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.json({ status: 'OK', citas: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Obtener citas AGENDADAS por un asesor
router.get('/agendadas/:cedulaAsesor', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const sql = `
      SELECT * FROM vw_gestion_citas_asesor
      WHERE "cedula_asesor" = :1
      AND "fechaProgramada" IS NOT NULL
      ORDER BY "fechaProgramada" ASC
    `;
    const result = await connection.execute(sql, [req.params.cedulaAsesor], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.json({ status: 'OK', citas: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Cancelar cita (Limpiar fecha programada)
router.post('/cancelar', async (req, res) => {
  let connection;
  try {
    const { idCita, userCedula } = req.body;
    connection = await getConnection(userCedula);
    await connection.execute(
      "UPDATE CITA SET FECHAHORAPROGRAMADA = NULL, IDASESOR = NULL WHERE IDCITA = :1",
      [idCita]
    );
    await connection.commit();
    res.json({ status: 'OK', mensaje: 'Cita cancelada y devuelta a pendientes' });
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Asignar fecha y hora a una cita (Agendar/Atender)
router.post('/atender', async (req, res) => {
  let connection;
  try {
    const { idCita, fechaProgramada, idAsesor, userCedula } = req.body;
    connection = await getConnection(userCedula || idAsesor);

    // 1. Obtener ID real del asesor a partir de la cédula
    let idAsesorReal = null;
    const resAsesor = await connection.execute(
      'SELECT IDASESOR FROM ASESOR WHERE NDOCUMENTO = :1',
      [idAsesor],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (resAsesor.rows.length === 0) {
      return res.status(404).json({ status: 'ERROR', mensaje: 'El asesor con cédula ' + idAsesor + ' no existe en la tabla ASESOR.' });
    }

    idAsesorReal = resAsesor.rows[0].IDASESOR;

    // 2. Actualizar la cita
    const sql = `
      UPDATE CITA 
      SET FECHAHORAPROGRAMADA = TO_TIMESTAMP(:1, 'YYYY-MM-DD"T"HH24:MI'), 
          IDASESOR = :2,
          ESTADOCITA = 'Agendada'
      WHERE IDCITA = :3
    `;
    
    await connection.execute(sql, [fechaProgramada, idAsesorReal, idCita]);
    await connection.commit();
    
    res.json({ status: 'OK', mensaje: 'Cita agendada correctamente' });
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Mantener /agendar por compatibilidad si es necesario
router.put('/agendar', async (req, res) => {
  // ... similar logic or redirect to the same handler
  res.status(405).json({ status: 'ERROR', mensaje: 'Use POST /atender' });
});

// Marcar cita como completada/atendida
router.post('/completar', async (req, res) => {
  let connection;
  try {
    const { idCita, userCedula } = req.body;
    connection = await getConnection(userCedula);
    
    await connection.execute(
      "UPDATE CITA SET ESTADOCITA = 'Atendida' WHERE IDCITA = :1",
      [idCita]
    );
    await connection.commit();
    
    res.json({ status: 'OK', mensaje: 'Cita marcada como atendida' });
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Marcar cita como No_Asistio (Inasistencia manual por parte del asesor)
router.post('/inasistencia', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const { idCita } = req.body;
    
    // Ejecutamos un bloque PL/SQL para hacer todo de forma atómica en la BD
    const sql = `
      DECLARE
        v_id_cliente NUMBER;
        v_strikes NUMBER;
      BEGIN
        UPDATE CITA 
        SET ESTADOCITA = 'No_Asistio' 
        WHERE IDCITA = :1
        RETURNING IDCLIENTE INTO v_id_cliente;
        
        UPDATE CLIENTE
        SET STRIKES = NVL(STRIKES, 0) + 1
        WHERE IDCLIENTE = v_id_cliente
        RETURNING STRIKES INTO v_strikes;
        
        IF v_strikes >= 3 THEN
           UPDATE CLIENTE
           SET FECHA_DESBLOQUEO = SYSDATE + 30,
               STRIKES = 0
           WHERE IDCLIENTE = v_id_cliente;
        END IF;
      END;
    `;
    
    await connection.execute(sql, [idCita]);
    await connection.commit();
    
    res.json({ status: 'OK', mensaje: 'Cita marcada como inasistencia. Se ha sumado 1 strike al cliente.' });
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
