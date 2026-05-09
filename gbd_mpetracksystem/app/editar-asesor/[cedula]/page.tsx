'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../../CSS/Admin/EditarAsesor.module.css';
import { BACKEND_URL } from '@/lib/config';

// Iconos
const UserIcon = () => (
  <svg className={styles.titleIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const MailIcon = () => (
  <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const PhoneIcon = () => (
  <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z"/>
  </svg>
);

const BriefcaseIcon = () => (
  <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);

const MoneyIcon = () => (
  <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const CheckIcon = () => (
  <svg className={styles.alertIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const AlertIcon = () => (
  <svg className={styles.alertIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
);

export default function EditarAsesorPage() {
  const router = useRouter();
  const params = useParams();
  const cedula = params.cedula as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    nombres: '',
    apellido: '',
    correo: '',
    telefono: '',
    especialidad: '',
    sueldo: '',
  });

  useEffect(() => {
    cargarAsesor();
  }, [cedula]);

  const cargarAsesor = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/asesores/${cedula}`);
      const data = await response.json();
      
      if (response.ok && data.status === 'OK') {
        setFormData({
          nombres: data.nombres || '',
          apellido: data.apellido || '',
          correo: data.correo || '',
          telefono: data.telefono || '',
          especialidad: data.especialidad || '',
          sueldo: data.sueldo || '',
        });
      } else {
        setError(data.mensaje || 'Error al cargar asesor');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/asesores/${cedula}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombres: formData.nombres,
          apellido: formData.apellido,
          correo: formData.correo,
          telefono: formData.telefono ? parseInt(formData.telefono) : null,
          especialidad: formData.especialidad,
          sueldo: parseFloat(formData.sueldo),
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'OK') {
        setSuccess('Asesor actualizado exitosamente');
        setTimeout(() => router.push('/listar-asesores'), 2000);
      } else {
        setError(data.mensaje || 'Error al actualizar asesor');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <span className={styles.loadingText}>Cargando datos del asesor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <Link href="/listar-asesores" className={styles.backButton}>
          <ArrowLeftIcon /> Volver a la lista
        </Link>

        <div className={styles.header}>
          <h1 className={styles.title}>
            <UserIcon />
            Editar Asesor
          </h1>
        </div>

        {error && (
          <div className={`${styles.alert} ${styles.errorAlert}`}>
            <AlertIcon />
            {error}
          </div>
        )}

        {success && (
          <div className={`${styles.alert} ${styles.successAlert}`}>
            <CheckIcon />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nombres *</label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Nombres del asesor"
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Apellidos *</label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Apellidos del asesor"
                  required
                />
              </div>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Correo electrónico *</label>
              <div className={styles.inputWrapper}>
                <MailIcon />
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Teléfono</label>
              <div className={styles.inputWrapper}>
                <PhoneIcon />
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Número de teléfono"
                />
              </div>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Especialidad *</label>
              <div className={styles.inputWrapper}>
                <BriefcaseIcon />
                <input
                  type="text"
                  name="especialidad"
                  value={formData.especialidad}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Ej: Matrícula/Registro"
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Sueldo *</label>
              <div className={styles.inputWrapper}>
                <MoneyIcon />
                <input
                  type="number"
                  name="sueldo"
                  value={formData.sueldo}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </div>
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <Link href="/listar-asesores" className={styles.cancelButton}>
              Cancelar
            </Link>
            <button type="submit" className={styles.saveButton} disabled={saving}>
              <SaveIcon />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}