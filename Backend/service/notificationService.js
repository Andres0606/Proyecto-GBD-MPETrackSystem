const nodemailer = require('nodemailer');
const { oracledb } = require('../config/db');
const cron = require('node-cron');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Servicio de Notificaciones y Recordatorios
 */
class NotificationService {
  
  /**
   * Inicializa las tareas programadas (Cron)
   */
  static init() {
    // Ejecutar cada hora para revisar citas próximas (0 * * * *)
    cron.schedule('0 * * * *', () => {
      console.log('⏰ Ejecutando revisión de recordatorios de citas...');
      this.sendAppointmentReminders();
    });
    
    console.log('✅ Servicio de recordatorios programado (Cada hora)');
  }

  /**
   * Busca citas agendadas para las próximas 24 horas que no hayan sido notificadas
   */
  static async sendAppointmentReminders() {
    let connection;
    try {
      connection = await oracledb.getConnection();
      
      // Buscamos citas que ocurran en las próximas 24 horas
      // Que estén en estado 'Agendada'
      // Y que no hayan sido notificadas aún (NOTIFICADO_RECORDATORIO = 'N')
      const sql = `
        SELECT 
          c.IDCITA, 
          c.FECHAHORAPROGRAMADA, 
          c.PLACAVEHICULO,
          p.CORREO, 
          p.NOMBRES,
          t.NOMBRE as TRAMITE
        FROM CITA c
        JOIN CLIENTE cl ON c.IDCLIENTE = cl.IDCLIENTE
        JOIN PERSONA p ON cl.NDOCUMENTO = p.NDOCUMENTO
        JOIN TIPOTRAMITE t ON c.TIPOTRAMITE = t.IDTIPO
        WHERE c.ESTADOCITA = 'Agendada'
          AND c.NOTIFICADO_RECORDATORIO = 'N'
          AND c.FECHAHORAPROGRAMADA <= CURRENT_TIMESTAMP + INTERVAL '24' HOUR
          AND c.FECHAHORAPROGRAMADA > CURRENT_TIMESTAMP
      `;
      
      const result = await connection.execute(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      
      if (result.rows.length === 0) {
        console.log('ℹ️ No hay citas próximas para notificar en este momento.');
        return;
      }

      console.log(`📧 Enviando ${result.rows.length} recordatorios...`);

      for (const cita of result.rows) {
        try {
          await this.sendEmail(cita);
          
          // Marcar como notificada
          await connection.execute(
            "UPDATE CITA SET NOTIFICADO_RECORDATORIO = 'S' WHERE IDCITA = :1",
            [cita.IDCITA]
          );
          await connection.commit();
          
          console.log(`✅ Recordatorio enviado a ${cita.CORREO} para la cita ${cita.IDCITA}`);
        } catch (mailErr) {
          console.error(`❌ Error enviando mail a ${cita.CORREO}:`, mailErr.message);
        }
      }

    } catch (err) {
      console.error('❌ Error en el servicio de recordatorios:', err.message);
    } finally {
      if (connection) {
        try { await connection.close(); } catch (e) {}
      }
    }
  }

  /**
   * Envío de correo electrónico individual
   */
  static async sendEmail(cita) {
    const fecha = new Date(cita.FECHAHORAPROGRAMADA).toLocaleString('es-ES', {
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    });

    const mailOptions = {
      from: `"MPE SYSTEM - Recordatorios" <${process.env.EMAIL_USER}>`,
      to: cita.CORREO,
      subject: '📌 Recordatorio de tu cita en MPE SYSTEM',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #1565C0;">¡Hola, ${cita.NOMBRES}!</h2>
          <p>Este es un recordatorio de que tienes una cita programada para el día de mañana.</p>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Trámite:</strong> ${cita.TRAMITE}</p>
            <p><strong>Vehículo:</strong> ${cita.PLACAVEHICULO || 'No especificado'}</p>
            <p style="font-size: 1.1em; color: #1565C0;"><strong>Fecha y Hora:</strong> ${fecha}</p>
          </div>
          
          <p>Te recomendamos llegar 10 minutos antes de tu hora programada.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 0.9em; color: #777;">Si ya realizaste el trámite o necesitas cancelar, por favor infórmanos a través de la plataforma.</p>
          <p style="text-align: center; font-weight: bold; color: #1565C0;">MPE SYSTEM - Expertos en Trámites Vehiculares</p>
        </div>
      `
    };

    return transporter.sendMail(mailOptions);
  }
}

module.exports = NotificationService;
