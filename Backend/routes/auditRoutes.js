const express = require('express');
const router = express.Router();
const { oracledb } = require('../config/db');

// Obtener todos los registros de auditoría con detalles del responsable
router.get('/logs', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const sql = `
      SELECT 
        a.idAuditoria as "id",
        a.nombreTabla as "tabla",
        a.operacion as "operacion",
        a.usuarioBD as "usuarioID",
        CASE 
          WHEN p.nombres IS NOT NULL THEN p.nombres || ' ' || p.apellidos
          WHEN a.usuarioBD = 'ADMIN' THEN 'SISTEMA AUTOMÁTICO'
          WHEN a.usuarioBD = 'CLIENTE_EXTERNO' THEN 'USUARIO EXTERNO'
          ELSE 'OPERADOR: ' || a.usuarioBD
        END as "responsable",
        CASE 
          WHEN a.usuarioBD = 'ADMIN' THEN 'ADMINISTRADOR DB'
          WHEN a.usuarioBD = 'CLIENTE_EXTERNO' THEN 'CLIENTE (SIN CUENTA)'
          ELSE 'GESTIÓN MANUAL'
        END as "cargo",
        TO_CHAR(a.fecha, 'DD/MM/YYYY HH24:MI:SS') as "fecha",
        a.idRegistroAfectado as "idRegistro",
        a.detalleCambio as "detalle"
      FROM AUDITORIA a
      LEFT JOIN PERSONA p ON a.usuarioBD = TO_CHAR(p.nDocumento)
      ORDER BY a.fecha DESC
    `;
    const result = await connection.execute(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.json({ status: 'OK', logs: result.rows });
  } catch (err) {
    console.error('Error obteniendo auditoría:', err);
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
