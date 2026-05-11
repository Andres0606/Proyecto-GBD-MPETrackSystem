const { createClient } = require('@supabase/supabase-js');
const { oracledb } = require('../config/db');
const personaRepository = require('../repository/personaRepository');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

class BiometricService {
  async registerFace(correo, descriptor, imageBase64) {
    let connection;
    try {
      // 1. Subir imagen a Supabase Storage
      const fileName = `public/${correo}_${Date.now()}.jpg`;
      const buffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('FACE_ID')
        .upload(fileName, buffer, { contentType: 'image/jpeg', upsert: true });

      if (uploadError) throw new Error('Error al subir a Supabase: ' + uploadError.message);

      const { data: urlData } = supabase.storage
        .from('FACE_ID')
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;

      // 2. Guardar en Oracle
      connection = await oracledb.getConnection();
      const sql = `
        UPDATE PERSONA SET 
          FACE_ID_ENABLED = 'Y',
          FACE_DESCRIPTOR = :descriptor,
          FACE_IMAGE_URL = :imageUrl
        WHERE CORREO = :correo
      `;

      await connection.execute(sql, {
        descriptor: JSON.stringify(descriptor),
        imageUrl: imageUrl,
        correo: correo
      });

      await connection.commit();
      return { status: 'OK', mensaje: 'Face ID activado correctamente', imageUrl };
    } catch (err) {
      if (connection) await connection.rollback();
      throw err;
    } finally {
      if (connection) await connection.close();
    }
  }

  async loginFace(descriptor) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      // Buscamos todos los usuarios que tengan Face ID activado
      const sql = `SELECT nDocumento, correo, nombres, apellidos, FACE_DESCRIPTOR 
                   FROM PERSONA WHERE FACE_ID_ENABLED = 'Y'`;
      const result = await connection.execute(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

      const users = result.rows;
      let bestMatch = null;
      let minDistance = 0.7; // Umbral de confianza ajustado (más flexible)

      for (const user of users) {
        if (!user.FACE_DESCRIPTOR) continue;
        
        const storedDescriptor = JSON.parse(user.FACE_DESCRIPTOR);
        const distance = this.euclideanDistance(descriptor, storedDescriptor);

        if (distance < minDistance) {
          minDistance = distance;
          bestMatch = user;
        }
      }

      if (!bestMatch) {
        throw new Error('Rostro no reconocido. Por favor usa correo y contraseña.');
      }

      // Obtener el rol (mismo proceso que el login normal)
      const nDocumento = bestMatch.NDOCUMENTO;
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
        cedula: bestMatch.NDOCUMENTO,
        nombres: bestMatch.NOMBRES,
        apellido: bestMatch.APELLIDOS,
        correo: bestMatch.CORREO,
        rol: rol
      };
    } finally {
      if (connection) await connection.close();
    }
  }

  euclideanDistance(arr1, arr2) {
    if (arr1.length !== arr2.length) return 1;
    let sum = 0;
    for (let i = 0; i < arr1.length; i++) {
      sum += Math.pow(arr1[i] - arr2[i], 2);
    }
    return Math.sqrt(sum);
  }
}

module.exports = new BiometricService();
