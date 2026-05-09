const personaRepository = require('../repository/personaRepository');
const clienteRepository = require('../repository/clienteRepository');
const { oracledb } = require('../config/db');

class AuthService {
  async registerCliente(data) {
    // 1. Check if person already exists
    const existingPersona = await personaRepository.findByDocumento(data.numeroDocumento);
    if (existingPersona) {
      throw new Error('El usuario ya existe con ese número de documento');
    }

    const existingEmail = await personaRepository.findByCorreo(data.correo);
    if (existingEmail) {
      throw new Error('El correo ya está registrado');
    }

    let connection;
    try {
      // 2. Start manual transaction
      connection = await oracledb.getConnection();
      
      // 3. Create Persona
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
        contrasena: data.contrasena, // Encriptar en producción
        fechaNacimiento: data.fechaNacimiento,
        telefono: data.telefono
      });

      // 4. Create Cliente
      const clienteSql = `
        INSERT INTO CLIENTE (
          idCliente, nDocumento, LicenciaConduccion
        ) VALUES (
          seq_cliente.NEXTVAL, :nDocumento, :licenciaConduccion
        )
      `;
      
      await connection.execute(clienteSql, {
        nDocumento: data.numeroDocumento,
        licenciaConduccion: data.licenciaConduccion || 'N'
      });

      // 5. Commit
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

    let connection;
    try {
      connection = await oracledb.getConnection();
      const nDocumento = persona.NDOCUMENTO;
      let rol = '1'; // Default: Cliente

      // Check if Admin
      const adminRes = await connection.execute(
        'SELECT nDocumento FROM ADMIN WHERE nDocumento = :1',
        [nDocumento]
      );
      if (adminRes.rows.length > 0) {
        rol = '3';
      } else {
        // Check if Asesor
        const asesorRes = await connection.execute(
          'SELECT nDocumento FROM ASESOR WHERE nDocumento = :1',
          [nDocumento]
        );
        if (asesorRes.rows.length > 0) {
          rol = '2';
        }
      }

      return {
        status: 'OK',
        cedula: persona.NDOCUMENTO,
        nombres: persona.NOMBRES,
        apellido: persona.APELLIDOS,
        correo: persona.CORREO,
        rol: rol
      };
    } finally {
      if (connection) await connection.close();
    }
  }

  async getPerfil(cedula) {
    const persona = await personaRepository.findByDocumento(cedula);
    if (!persona) {
      throw new Error('Perfil no encontrado');
    }

    let connection;
    try {
      connection = await oracledb.getConnection();
      
      // Intentar obtener licencia si es cliente
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
        licenciaConduccion: clienteRes.rows.length > 0 ? clienteRes.rows[0].LICENCIACONDUCCION : 'N'
      };
    } finally {
      if (connection) await connection.close();
    }
  }

  async updatePerfil(data) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      
      // 1. Actualizar PERSONA
      const personaSql = `
        UPDATE PERSONA SET 
          nombres = :nombres,
          apellidos = :apellido,
          correo = :correo,
          telefono = :telefono,
          fechaNacimiento = TO_DATE(:fechaNacimiento, 'DD/MM/YYYY')
          ${data.contrasena ? ', contrasena = :contrasena' : ''}
        WHERE nDocumento = :cedula
      `;

      const personaParams = {
        nombres: data.nombres,
        apellido: data.apellido,
        correo: data.correo,
        telefono: data.telefono,
        fechaNacimiento: data.fechaNacimiento,
        cedula: data.numeroDocumento
      };
      if (data.contrasena) personaParams.contrasena = data.contrasena;

      await connection.execute(personaSql, personaParams);

      // 2. Actualizar CLIENTE (solo si viene licenciaConduccion)
      if (data.licenciaConduccion !== undefined) {
        await connection.execute(
          'UPDATE CLIENTE SET LicenciaConduccion = :1 WHERE nDocumento = :2',
          [data.licenciaConduccion, data.numeroDocumento]
        );
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
    if (existingPersona) {
      throw new Error('El usuario ya existe con ese número de documento');
    }

    let connection;
    try {
      connection = await oracledb.getConnection();
      
      // 1. Insertar PERSONA
      const personaSql = `
        INSERT INTO PERSONA (
          nDocumento, tipoDocumento, nombres, apellidos, 
          correo, contrasena, fechaNacimiento, telefono
        ) VALUES (
          :nDocumento, 1, :nombres, :apellidos, 
          :correo, :contrasena, TO_DATE(:fechaNacimiento, 'DD/MM/YYYY'), :telefono
        )
      `;
      
      await connection.execute(personaSql, {
        nDocumento: data.cedula,
        nombres: data.nombres,
        apellidos: data.apellido,
        correo: data.correo,
        contrasena: data.contrasena,
        fechaNacimiento: data.fechaNacimiento,
        telefono: data.telefono
      });

      // 2. Insertar ASESOR
      const asesorSql = `
        INSERT INTO ASESOR (
          idAsesor, nDocumento, especialidadTramite, estado, sueldo
        ) VALUES (
          seq_asesor.NEXTVAL, :nDocumento, :especialidad, 'Activo', :sueldo
        )
      `;
      
      await connection.execute(asesorSql, {
        nDocumento: data.cedula,
        especialidad: data.especialidadTramite,
        sueldo: data.sueldo
      });

      await connection.commit();
      return { status: 'OK', mensaje: 'Asesor registrado correctamente' };

    } catch (err) {
      if (connection) await connection.rollback();
      throw err;
    } finally {
      if (connection) await connection.close();
    }
  }
}

module.exports = new AuthService();
