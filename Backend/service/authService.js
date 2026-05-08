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

    // Determine role (simplified for now)
    // Check if in ADMIN, ASESOR, or CLIENTE table
    let role = '1'; // Default to Cliente
    // ... logic to check other tables ...

    return {
      status: 'OK',
      data: {
        cedula: persona.NDOCUMENTO,
        nombres: persona.NOMBRES,
        rol: role // This should be dynamic
      }
    };
  }
}

module.exports = new AuthService();
