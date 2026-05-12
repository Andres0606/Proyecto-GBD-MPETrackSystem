const personaRepository = require('../repository/personaRepository');
const clienteRepository = require('../repository/clienteRepository');
const { oracledb } = require('../config/db');
const nodemailer = require('nodemailer');

// Almacén temporal de OTPs (en memoria para este proyecto)
// Formato: { 'correo@test.com': { code: '123456', expires: timestamp } }
const OTP_STORE = {};
const RESET_OTP_STORE = {};

// Configuración del transporte de correo
const transporter = nodemailer.createTransport({
  service: 'gmail', // Puedes cambiarlo por 'outlook', 'hotmail', etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

class AuthService {
  async registerCliente(data) {
    const existingPersona = await personaRepository.findByDocumento(data.numeroDocumento);
    if (existingPersona) throw new Error('El usuario ya existe con ese número de documento');

    const existingEmail = await personaRepository.findByCorreo(data.correo);
    if (existingEmail) throw new Error('El correo ya está registrado');

    const existingTelefono = await personaRepository.findByTelefono(data.telefono);
    if (existingTelefono) throw new Error('El número de teléfono ya está registrado');

    let connection;
    try {
      connection = await oracledb.getConnection();
      const personaSql = `
        INSERT INTO PERSONA (
          nDocumento, tipoDocumento, nombres, apellidos, 
          correo, contrasena, fechaNacimiento, telefono
        ) VALUES (
          :nDocumento, :tipoDocumento, :nombres, :apellidos, 
          :correo, :contrasena, TO_DATE(:fechaNacimiento, 'DD/MM/YYYY'), :telefono
        )
      `;
      
      await connection.execute(personaSql, {
        nDocumento: data.numeroDocumento,
        tipoDocumento: data.tipoDocumento,
        nombres: data.nombres,
        apellidos: data.apellido,
        correo: data.correo,
        contrasena: data.contrasena,
        fechaNacimiento: data.fechaNacimiento,
        telefono: data.telefono
      });

      const clienteSql = `
        INSERT INTO CLIENTE (idCliente, nDocumento, LicenciaConduccion)
        VALUES (seq_cliente.NEXTVAL, :nDocumento, :licenciaConduccion)
      `;
      
      await connection.execute(clienteSql, {
        nDocumento: data.numeroDocumento,
        licenciaConduccion: data.licenciaConduccion || 'N'
      });

      await connection.commit();
      return { status: 'OK', mensaje: 'Registro exitoso' };
    } catch (err) {
      if (connection) await connection.rollback();
      throw err;
    } finally {
      if (connection) await connection.close();
    }
  }

  async login(correo, contrasena) {
    const persona = await personaRepository.findByCorreo(correo);
    if (!persona || persona.CONTRASENA !== contrasena) {
      throw new Error('Credenciales inválidas');
    }

    // Paso 1: Enviar OTP por correo
    await this.sendOTP(persona.CORREO);

    return {
      status: 'OTP_REQUIRED',
      mensaje: 'Código de verificación enviado a tu correo electrónico: ' + persona.CORREO,
      correo: persona.CORREO
    };
  }

  async sendOTP(correo) {
    try {
      // Generar código aleatorio de 6 dígitos
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Guardar en el almacén con expiración de 15 minutos
      OTP_STORE[correo] = {
        code: code,
        expires: Date.now() + 2 * 60 * 1000 // 15 minutos
      };

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: correo,
        subject: 'Código de Verificación - MPE Track System',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #2563eb;">Verificación de Seguridad</h2>
            <p>Hola,</p>
            <p>Tu código de verificación para ingresar al sistema es:</p>
            <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1e40af; border-radius: 5px;">
              ${code}
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">Este código expirará en 2 minutos.</p>
            <p>Si no solicitaste este código, por favor ignora este mensaje.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`OTP enviado a ${correo}: ${code}`);
    } catch (err) {
      console.error('Email Send Error:', err);
      throw new Error('Error al enviar el correo de verificación: ' + err.message);
    }
  }

  async verifyOTP(correo, code) {
    const otpData = OTP_STORE[correo];

    if (!otpData) {
      throw new Error('No hay un código pendiente para este correo');
    }

    if (Date.now() > otpData.expires) {
      delete OTP_STORE[correo];
      throw new Error('El código ha expirado. Por favor solicita uno nuevo.');
    }

    if (otpData.code !== code) {
      throw new Error('Código de verificación incorrecto');
    }

    // Código válido, eliminarlo del almacén
    delete OTP_STORE[correo];

    const persona = await personaRepository.findByCorreo(correo);
    if (!persona) throw new Error('Usuario no encontrado');

    let connection;
    try {
      connection = await oracledb.getConnection();
      const nDocumento = persona.NDOCUMENTO;
      let rol = '1';

      const adminRes = await connection.execute('SELECT nDocumento FROM ADMIN WHERE nDocumento = :1', [nDocumento]);
      if (adminRes.rows.length > 0) {
        rol = '3';
      } else {
        const asesorRes = await connection.execute('SELECT nDocumento FROM ASESOR WHERE nDocumento = :1', [nDocumento]);
        if (asesorRes.rows.length > 0) rol = '2';
      }

      return {
        status: 'OK',
        cedula: persona.NDOCUMENTO,
        nombres: persona.NOMBRES,
        apellido: persona.APELLIDOS,
        correo: persona.CORREO,
        rol: rol
      };
    } catch (err) {
      throw new Error(err.message || 'Error al verificar el código');
    } finally {
      if (connection) await connection.close();
    }
  }

  async getPerfil(cedula) {
    const persona = await personaRepository.findByDocumento(cedula);
    if (!persona) throw new Error('Perfil no encontrado');
    let connection;
    try {
      connection = await oracledb.getConnection();
      const clienteRes = await connection.execute(
        'SELECT LicenciaConduccion FROM CLIENTE WHERE nDocumento = :1',
        [cedula],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return {
        status: 'OK',
        cedula: persona.NDOCUMENTO,
        nombres: persona.NOMBRES,
        apellido: persona.APELLIDOS,
        correo: persona.CORREO,
        telefono: persona.TELEFONO,
        fechaNacimiento: persona.FECHANACIMIENTO ? new Date(persona.FECHANACIMIENTO).toLocaleDateString('es-ES') : '',
        licenciaConduccion: clienteRes.rows.length > 0 ? clienteRes.rows[0].LICENCIACONDUCCION : 'N',
        faceIdEnabled: persona.FACE_ID_ENABLED === 'Y'
      };
    } finally {
      if (connection) await connection.close();
    }
  }

  async updatePerfil(data) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      const personaSql = `
        UPDATE PERSONA SET 
          nombres = :nombres, apellidos = :apellido, correo = :correo, telefono = :telefono,
          fechaNacimiento = TO_DATE(:fechaNacimiento, 'DD/MM/YYYY')
          ${data.contrasena ? ', contrasena = :contrasena' : ''}
        WHERE nDocumento = :cedula
      `;
      const personaParams = {
        nombres: data.nombres, apellido: data.apellido, correo: data.correo,
        telefono: data.telefono, fechaNacimiento: data.fechaNacimiento, cedula: data.numeroDocumento
      };
      if (data.contrasena) personaParams.contrasena = data.contrasena;
      await connection.execute(personaSql, personaParams);
      if (data.licenciaConduccion !== undefined) {
        await connection.execute('UPDATE CLIENTE SET LicenciaConduccion = :1 WHERE nDocumento = :2', [data.licenciaConduccion, data.numeroDocumento]);
      }
      await connection.commit();
      return { status: 'OK', mensaje: 'Perfil actualizado exitosamente' };
    } catch (err) {
      if (connection) await connection.rollback();
      throw err;
    } finally {
      if (connection) await connection.close();
    }
  }

  async registerAsesor(data) {
    const existingPersona = await personaRepository.findByDocumento(data.cedula);
    if (existingPersona) throw new Error('El usuario ya existe con ese número de documento');
    let connection;
    try {
      connection = await oracledb.getConnection();
      const personaSql = `
        INSERT INTO PERSONA (nDocumento, tipoDocumento, nombres, apellidos, correo, contrasena, fechaNacimiento, telefono)
        VALUES (:nDocumento, 1, :nombres, :apellidos, :correo, :contrasena, TO_DATE(:fechaNacimiento, 'DD/MM/YYYY'), :telefono)
      `;
      await connection.execute(personaSql, {
        nDocumento: data.cedula, nombres: data.nombres, apellidos: data.apellido, correo: data.correo,
        contrasena: data.contrasena, fechaNacimiento: data.fechaNacimiento, telefono: data.telefono
      });
      const asesorSql = `
        INSERT INTO ASESOR (idAsesor, nDocumento, especialidadTramite, estado, sueldo)
        VALUES (seq_asesor.NEXTVAL, :nDocumento, :especialidad, 'Activo', :sueldo)
      `;
      await connection.execute(asesorSql, { nDocumento: data.cedula, especialidad: data.especialidadTramite, sueldo: data.sueldo });
      await connection.commit();
      return { status: 'OK', mensaje: 'Asesor registrado correctamente' };
    } catch (err) {
      if (connection) await connection.rollback();
      throw err;
    } finally {
      if (connection) await connection.close();
    }
  }

  async listAsesores() {
    let connection;
    try {
      connection = await oracledb.getConnection();
      const sql = 'SELECT p.nDocumento as "cedula", p.nombres as "nombres", p.apellidos as "apellido", p.correo as "correo", a.especialidadTramite as "especialidad", a.sueldo as "sueldo" FROM PERSONA p JOIN ASESOR a ON p.nDocumento = a.nDocumento';
      const result = await connection.execute(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      return { status: 'OK', asesores: result.rows.map(row => ({ ...row, tipoUsuario: 2 })) };
    } finally {
      if (connection) await connection.close();
    }
  }

  async deleteAsesor(cedula) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      await connection.execute('DELETE FROM ASESOR WHERE nDocumento = :1', [cedula]);
      await connection.execute('DELETE FROM PERSONA WHERE nDocumento = :1', [cedula]);
      await connection.commit();
      return { status: 'OK', mensaje: 'Asesor eliminado correctamente' };
    } catch (err) {
      if (connection) await connection.rollback();
      throw err;
    } finally {
      if (connection) await connection.close();
    }
  }

  async getAsesor(cedula) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      const sql = 'SELECT p.nombres as "nombres", p.apellidos as "apellido", p.correo as "correo", p.telefono as "telefono", a.especialidadTramite as "especialidad", a.sueldo as "sueldo" FROM PERSONA p JOIN ASESOR a ON p.nDocumento = a.nDocumento WHERE p.nDocumento = :1';
      const result = await connection.execute(sql, [cedula], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      if (result.rows.length === 0) throw new Error('Asesor no encontrado');
      return { status: 'OK', ...result.rows[0] };
    } finally {
      if (connection) await connection.close();
    }
  }

  async updateAsesor(cedula, data) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      await connection.execute('UPDATE PERSONA SET nombres = :nombres, apellidos = :apellido, correo = :correo, telefono = :telefono WHERE nDocumento = :cedula', { nombres: data.nombres, apellido: data.apellido, correo: data.correo, telefono: data.telefono, cedula });
      await connection.execute('UPDATE ASESOR SET especialidadTramite = :especialidad, sueldo = :sueldo WHERE nDocumento = :cedula', { especialidad: data.especialidad, sueldo: data.sueldo, cedula });
      await connection.commit();
      return { status: 'OK', mensaje: 'Asesor actualizado correctamente' };
    } catch (err) {
      if (connection) await connection.rollback();
      throw err;
    } finally {
      if (connection) await connection.close();
    }
  }

  async forgotPassword(correo) {
    const persona = await personaRepository.findByCorreo(correo);
    if (!persona) {
      throw new Error('No existe una cuenta asociada a este correo electrónico');
    }

    // Generar código aleatorio de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Guardar en el almacén de RESET con expiración de 10 minutos
    RESET_OTP_STORE[correo] = {
      code: code,
      expires: Date.now() + 10 * 60 * 1000
    };

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: correo,
      subject: 'Recuperación de Contraseña - MPE Track System',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb;">Recuperación de Contraseña</h2>
          <p>Hola,</p>
          <p>Has solicitado restablecer tu contraseña. Utiliza el siguiente código temporal:</p>
          <div style="background: #fef2f2; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #dc2626; border-radius: 5px;">
            ${code}
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">Este código expirará en 10 minutos.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Reset OTP enviado a ${correo}: ${code}`);
    
    return { status: 'OK', mensaje: 'Código de recuperación enviado' };
  }

  async resetPassword(correo, code, nuevaContrasena) {
    const otpData = RESET_OTP_STORE[correo];

    if (!otpData) {
      throw new Error('No hay una solicitud de recuperación pendiente para este correo');
    }

    if (Date.now() > otpData.expires) {
      delete RESET_OTP_STORE[correo];
      throw new Error('El código ha expirado. Por favor solicita uno nuevo.');
    }

    if (otpData.code !== code) {
      throw new Error('Código de recuperación incorrecto');
    }

    let connection;
    try {
      connection = await oracledb.getConnection();
      
      const sql = 'UPDATE PERSONA SET contrasena = :nuevaContrasena WHERE correo = :correo';
      const result = await connection.execute(sql, { nuevaContrasena, correo });
      
      if (result.rowsAffected === 0) {
        throw new Error('No se pudo actualizar la contraseña. Usuario no encontrado.');
      }

      await connection.commit();
      
      // Limpiar el código usado
      delete RESET_OTP_STORE[correo];

      return { status: 'OK', mensaje: 'Contraseña actualizada exitosamente' };
    } catch (err) {
      if (connection) await connection.rollback();
      throw err;
    } finally {
      if (connection) await connection.close();
    }
  }
}

module.exports = new AuthService();
