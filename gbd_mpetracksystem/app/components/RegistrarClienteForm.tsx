'use client';

import { useState } from 'react';
import styles from '../CSS/Components/RegistrarClienteForm.module.css';
import { BACKEND_URL } from '@/lib/config';

interface RegistrarClienteFormProps {
  cedulaInicial?: string;
  onSuccess: (cliente: { cedula: number; nombres: string; apellido: string; telefono: string; correo: string }) => void;
  onCancel?: () => void;
  buttonText?: string;
}

export default function RegistrarClienteForm({ 
  cedulaInicial = '', 
  onSuccess, 
  onCancel, 
  buttonText = 'Registrar Cliente' 
}: RegistrarClienteFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    tipoDocumento: 'CEDULA',
    numeroDocumento: cedulaInicial,
    nombres: '',
    apellido: '',
    fechaNacimiento: '',
    telefono: '',
    correo: '',
    contrasena: '',
    licenciaConduccion: 'N'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Validaciones
    if (!formData.numeroDocumento) {
      setError('El número de documento es requerido');
      setSubmitting(false);
      return;
    }
    if (!formData.nombres) {
      setError('Los nombres son requeridos');
      setSubmitting(false);
      return;
    }
    if (!formData.apellido) {
      setError('Los apellidos son requeridos');
      setSubmitting(false);
      return;
    }
    if (!formData.correo) {
      setError('El correo es requerido');
      setSubmitting(false);
      return;
    }
    if (!formData.contrasena) {
      setError('La contraseña es requerida');
      setSubmitting(false);
      return;
    }
    if (formData.contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setSubmitting(false);
      return;
    }

    // Formatear fecha
    let fechaFormateada = '';
    if (formData.fechaNacimiento) {
      const fecha = new Date(formData.fechaNacimiento);
      const dia = fecha.getDate().toString().padStart(2, '0');
      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const anio = fecha.getFullYear();
      fechaFormateada = `${dia}/${mes}/${anio}`;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/register/cliente`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoDocumento: formData.tipoDocumento,
          numeroDocumento: parseInt(formData.numeroDocumento),
          nombres: formData.nombres,
          apellido: formData.apellido,
          fechaNacimiento: fechaFormateada,
          telefono: formData.telefono ? parseInt(formData.telefono) : null,
          correo: formData.correo,
          contrasena: formData.contrasena,
          licenciaConduccion: formData.licenciaConduccion
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'OK') {
        onSuccess({
          cedula: data.numeroDocumento,
          nombres: formData.nombres,
          apellido: formData.apellido,
          telefono: formData.telefono || 'No registrado',
          correo: formData.correo
        });
      } else {
        setError(data.mensaje || 'Error al registrar el cliente');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.errorAlert}>{error}</div>}
      
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>Tipo de Documento *</label>
          <select name="tipoDocumento" value={formData.tipoDocumento} onChange={handleChange}>
            <option value="CEDULA">Cédula de Ciudadanía</option>
            <option value="CEDULA">Cédula de extranjería</option>
            <option value="NIT">NIT</option>
            <option value="PASAPORTE">Pasaporte</option>
            <option value="TARJETA_IDENTIDAD">Tarjeta de Identidad</option>
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label>Número de Documento *</label>
          <input type="text" name="numeroDocumento" value={formData.numeroDocumento} onChange={handleChange} required />
        </div>
        
        <div className={styles.formGroup}>
          <label>Nombres *</label>
          <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} required />
        </div>
        
        <div className={styles.formGroup}>
          <label>Apellidos *</label>
          <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required />
        </div>
        
        <div className={styles.formGroup}>
          <label>Fecha de Nacimiento</label>
          <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} />
        </div>
        
        <div className={styles.formGroup}>
          <label>Teléfono</label>
          <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} />
        </div>
        
        <div className={styles.formGroup}>
          <label>Correo *</label>
          <input type="email" name="correo" value={formData.correo} onChange={handleChange} required />
        </div>
        
        <div className={styles.formGroup}>
          <label>Contraseña *</label>
          <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} required placeholder="Mínimo 6 caracteres" />
        </div>
        
        <div className={styles.formGroup}>
          <label>¿Tiene licencia de conducción?</label>
          <select name="licenciaConduccion" value={formData.licenciaConduccion} onChange={handleChange}>
            <option value="N">No</option>
            <option value="S">Sí</option>
          </select>
        </div>
      </div>

      <div className={styles.buttonGroup}>
        <button type="submit" disabled={submitting} className={styles.submitButton}>
          {submitting ? 'Registrando...' : buttonText}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={styles.cancelButton}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}