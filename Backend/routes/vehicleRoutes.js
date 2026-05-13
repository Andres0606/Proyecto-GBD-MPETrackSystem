const express = require('express');
const router = express.Router();
const { oracledb } = require('../config/db');

// --- Listas de referencia desde Tablas Maestras ---

router.get('/colores', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      'SELECT IDCOLOR as "id", NOMBRECOLOR as "nombre" FROM COLOR ORDER BY NOMBRECOLOR',
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json({ status: 'OK', data: result.rows });
  } catch (err) { res.status(500).json({ status: 'ERROR', mensaje: err.message }); }
  finally { if (connection) await connection.close(); }
});

router.get('/combustibles', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      'SELECT IDCOMBUSTIBLE as "id", NOMBRECOMBUSTIBLE as "nombre" FROM COMBUSTIBLE ORDER BY NOMBRECOMBUSTIBLE',
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json({ status: 'OK', data: result.rows });
  } catch (err) { res.status(500).json({ status: 'ERROR', mensaje: err.message }); }
  finally { if (connection) await connection.close(); }
});

router.get('/tipos-servicio', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      'SELECT IDTIPOSERVICIO as "id", NOMBRESERVICIO as "nombre" FROM TIPOSERVICIO ORDER BY NOMBRESERVICIO',
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json({ status: 'OK', data: result.rows });
  } catch (err) { res.status(500).json({ status: 'ERROR', mensaje: err.message }); }
  finally { if (connection) await connection.close(); }
});

router.get('/clases', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      'SELECT ID_CLASE as "id", NOMBRE as "nombre" FROM CLASE_VEHICULO ORDER BY NOMBRE',
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json({ status: 'OK', data: result.rows });
  } catch (err) { res.status(500).json({ status: 'ERROR', mensaje: err.message }); }
  finally { if (connection) await connection.close(); }
});

router.get('/marcas', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      'SELECT ID_MARCA as "id", NOMBRE as "nombre" FROM MARCA_VEHICULO ORDER BY NOMBRE',
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json({ status: 'OK', data: result.rows });
  } catch (err) { res.status(500).json({ status: 'ERROR', mensaje: err.message }); }
  finally { if (connection) await connection.close(); }
});

router.get('/lineas/:idMarca', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const { idMarca } = req.params;
    const result = await connection.execute(
      'SELECT ID_LINEA as "id", NOMBRE as "nombre" FROM LINEA_VEHICULO WHERE ID_MARCA = :1 ORDER BY NOMBRE',
      [idMarca], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json({ status: 'OK', data: result.rows });
  } catch (err) { res.status(500).json({ status: 'ERROR', mensaje: err.message }); }
  finally { if (connection) await connection.close(); }
});

// --- Rutas de Vehículos ---

// Obtener vehículos de un cliente (Solo los que posee actualmente)
router.get('/cliente/:cedula', async (req, res) => {
  const { cedula } = req.params;
  if (!cedula || cedula === 'undefined' || cedula === 'null' || cedula === '') {
    return res.status(400).json({ status: 'ERROR', mensaje: 'Cédula de cliente no válida' });
  }
  let connection;
  try {
    connection = await oracledb.getConnection();
    const sql = `
      SELECT 
        PLACA as "placa",
        MARCA as "marca",
        LINEA as "linea",
        COLOR as "color",
        MODELO as "modelo",
        CLASE as "clase",
        NUMMOTOR as "numMotor",
        NUMCHASIS as "numChasis",
        TIPOSERVICIO as "tipoServicio",
        PRENDADO as "prendado",
        ESTADO as "estado",
        CEDULA_CLIENTE as "cedulaCliente",
        NUMEROVIN as "numeroVin",
        COMBUSTIBLE as "combustible"
      FROM VW_DETALLE_VEHICULOS
      WHERE TRIM(CEDULA_CLIENTE) = TRIM(:1)
    `;
    const result = await connection.execute(sql, [cedula], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.json({ status: 'OK', vehiculos: result.rows });
  } catch (err) { res.status(500).json({ status: 'ERROR', mensaje: err.message }); }
  finally { if (connection) await connection.close(); }
});

// Actualizar vehículo
router.put('/:placa', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const { placa } = req.params;
    const fields = req.body;
    let setClause = [];
    let binds = { placa };
    if (fields.color) { setClause.push("COLOR = :color"); binds.color = fields.color; }
    if (fields.tipoServicio) { setClause.push("TIPOSERVICIO = :serv"); binds.serv = fields.tipoServicio; }
    if (fields.numMotor) { setClause.push("NUMMOTOR = :motor"); binds.motor = fields.numMotor; }
    if (fields.numChasis) { setClause.push("NUMCHASIS = :chasis"); binds.chasis = fields.numChasis; }
    if (fields.clase) { setClause.push("CLASE = :clase"); binds.clase = fields.clase; }
    if (fields.placa) { setClause.push("PLACA = :nuevaPlaca"); binds.nuevaPlaca = fields.placa; }
    if (setClause.length === 0) return res.status(400).json({ status: 'ERROR', mensaje: 'No hay campos para actualizar' });
    const sql = `UPDATE VEHICULO SET ${setClause.join(', ')} WHERE PLACA = :placa`;
    await connection.execute(sql, binds);
    await connection.commit();
    res.json({ status: 'OK', mensaje: 'Vehículo actualizado correctamente' });
  } catch (err) { res.status(500).json({ status: 'ERROR', mensaje: err.message }); }
  finally { if (connection) await connection.close(); }
});

// Inscribir Prenda
router.post('/inscribirPrenda', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const { placa } = req.body;
    if (!placa) throw new Error('Placa no proporcionada');
    await connection.execute("UPDATE VEHICULO SET PRENDADO = 'S' WHERE PLACA = :1", [placa]);
    await connection.commit();
    res.json({ status: 'OK', mensaje: 'Prenda inscrita exitosamente' });
  } catch (err) { res.status(500).json({ status: 'ERROR', mensaje: err.message }); }
  finally { if (connection) await connection.close(); }
});

// Levantar Prenda
router.post('/levantarPrenda', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const { placa } = req.body;
    if (!placa) throw new Error('Placa no proporcionada');
    await connection.execute("UPDATE VEHICULO SET PRENDADO = 'N' WHERE PLACA = :1", [placa]);
    await connection.commit();
    res.json({ status: 'OK', mensaje: 'Prenda levantada exitosamente' });
  } catch (err) { res.status(500).json({ status: 'ERROR', mensaje: err.message }); }
  finally { if (connection) await connection.close(); }
});

// Cancelar Matrícula (Alineado con SCHEMA: INACTIVO + FECHA_CANCELACION)
router.post('/cancelarMatricula', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const { placa } = req.body;
    if (!placa) throw new Error('Placa no proporcionada');
    
    const sql = `
      UPDATE VEHICULO 
      SET ESTADO = 'INACTIVO', 
          FECHA_CANCELACION = SYSDATE 
      WHERE PLACA = :1
    `;
    await connection.execute(sql, [placa]);
    await connection.commit();
    res.json({ status: 'OK', mensaje: 'Matrícula cancelada exitosamente' });
  } catch (err) { res.status(500).json({ status: 'ERROR', mensaje: err.message }); }
  finally { if (connection) await connection.close(); }
});

// Rematricular (Alineado con SCHEMA: ACTIVO + FECHA_REACTIVACION)
router.post('/rematricular', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const { placa } = req.body;
    if (!placa) throw new Error('Placa no proporcionada');
    
    const sql = `
      UPDATE VEHICULO 
      SET ESTADO = 'ACTIVO', 
          FECHA_REACTIVACION = SYSDATE 
      WHERE PLACA = :1
    `;
    await connection.execute(sql, [placa]);
    await connection.commit();
    res.json({ status: 'OK', mensaje: 'Vehículo rematriculado exitosamente' });
  } catch (err) { res.status(500).json({ status: 'ERROR', mensaje: err.message }); }
  finally { if (connection) await connection.close(); }
});

router.post('/register', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const v = req.body;
    const sqlVehiculo = `INSERT INTO VEHICULO (PLACA, ID_MARCA, ID_LINEA, MODELO, ID_CLASE, NUMMOTOR, NUMCHASIS, COMBUSTIBLE, NUMEROVIN, TIPOSERVICIO, COLOR, ESTADO, PRENDADO) VALUES (:placa, :marca, :linea, :modelo, :clase, :motor, :chasis, :comb, :vin, :serv, :color, 'ACTIVO', :prendado)`;
    await connection.execute(sqlVehiculo, { placa: v.placa, marca: v.marca, linea: v.linea, modelo: v.modelo, clase: v.clase, motor: v.numMotor, chasis: v.numChasis, comb: v.combustible, vin: v.numeroVin, serv: v.tipoServicio, color: v.color, prendado: v.prendado || 'N' });
    if (v.idTramite) {
      await connection.execute(`UPDATE CITA SET PLACAVEHICULO = :placa WHERE IDCITA = (SELECT IDCITA FROM TRAMITE WHERE IDTRAMITE = :idTramite)`, { placa: v.placa, idTramite: v.idTramite });
    }
    await connection.commit();
    res.json({ status: 'OK', mensaje: 'Vehículo registrado' });
  } catch (err) { if (connection) await connection.rollback(); res.status(500).json({ status: 'ERROR', mensaje: err.message }); }
  finally { if (connection) await connection.close(); }
});

router.post('/traspaso', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const { placa, idTramite } = req.body;

    // 1. Finalizar el trámite
    await connection.execute("UPDATE TRAMITE SET ESTADOTRAMITE = 'Finalizado' WHERE IDTRAMITE = :1", [idTramite]);

    // 2. Desvincular el vehículo del dueño actual (vendedor) 
    // Al poner ESELDUENO = 'N', ya no aparecerá en su lista de "Mis Vehículos"
    const sqlCita = `
      UPDATE CITA 
      SET ESELDUENO = 'N' 
      WHERE IDCITA = (SELECT IDCITA FROM TRAMITE WHERE IDTRAMITE = :1)
    `;
    await connection.execute(sqlCita, [idTramite]);

    await connection.commit();
    res.json({ status: 'OK', mensaje: 'Traspaso completado y vehículo desvinculado del dueño anterior' });
  } catch (err) { 
    if (connection) await connection.rollback(); 
    res.status(500).json({ status: 'ERROR', mensaje: err.message }); 
  }
  finally { if (connection) await connection.close(); }
});

module.exports = router;
