const express = require('express');
const router = express.Router();
const { oracledb } = require('../config/db');

// Obtener estadísticas generales para el dashboard de reportes
router.get('/stats', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    
    // 1. Estados de trámites
    const resEstados = await connection.execute(
      'SELECT * FROM vw_reporte_estados', [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // 2. Ingresos por tipo
    const resIngresos = await connection.execute(
      'SELECT * FROM vw_reporte_ingresos', [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // NUEVO: Trámites por tipo (cantidad)
    const resTipos = await connection.execute(
      'SELECT * FROM vw_reporte_tipos_tramite', [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // NUEVO: Citas por estado
    const resCitasEstado = await connection.execute(
      'SELECT * FROM vw_reporte_citas_estado', [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // 3. Rendimiento de asesores
    const resAsesores = await connection.execute(
      'SELECT * FROM vw_reporte_asesores ORDER BY "citasAtendidas" DESC', [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // 4. Conteos generales rápidos
    const resGeneral = await connection.execute(`
      SELECT 
        (SELECT COUNT(*) FROM VEHICULO) as "totalVehiculos",
        (SELECT COUNT(*) FROM CLIENTE) as "totalClientes",
        (SELECT COUNT(*) FROM CITA WHERE estadoCita = 'PENDIENTE') as "citasPendientes"
      FROM DUAL
    `, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

    res.json({
      status: 'OK',
      data: {
        estados: resEstados.rows,
        ingresos: resIngresos.rows,
        tipos: resTipos.rows,
        citasEstado: resCitasEstado.rows,
        asesores: resAsesores.rows,
        general: resGeneral.rows[0]
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
