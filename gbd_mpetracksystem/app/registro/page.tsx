'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../CSS/Registro/Registro.module.css';
import { BACKEND_URL } from '@/lib/config';

/* ── Icons ── */
const CarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h12l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/>
    <circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

export default function RegistroPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    tipoDocumento: 'CEDULA',
    numeroDocumento: '',
    nombres: '',
    apellido: '',
    fechaNacimiento: '',
    telefono: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    licenciaConduccion: 'S'  // 'S' o 'N'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked ? 'S' : 'N' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.numeroDocumento.trim()) { setError('El número de documento es requerido'); return; }
    if (!formData.nombres.trim()) { setError('Los nombres son requeridos'); return; }
    if (!formData.apellido.trim()) { setError('Los apellidos son requeridos'); return; }
    if (!formData.fechaNacimiento) { setError('La fecha de nacimiento es requerida'); return; }
    if (!formData.correo.trim()) { setError('El correo es requerido'); return; }
    if (!formData.contrasena) { setError('La contraseña es requerida'); return; }
    if (formData.contrasena !== formData.confirmarContrasena) { setError('Las contraseñas no coinciden'); return; }
    if (formData.contrasena.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }

    setLoading(true);

    try {
      let fechaFormateada = '';
      if (formData.fechaNacimiento) {
        const fecha = new Date(formData.fechaNacimiento);
        const dia = fecha.getDate().toString().padStart(2, '0');
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const anio = fecha.getFullYear();
        fechaFormateada = `${dia}/${mes}/${anio}`;
      }

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
          licenciaConduccion: formData.licenciaConduccion  // 'S' o 'N'
        }),
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.mensaje || 'Error en el registro');
      
      if (data.status === 'OK') {
        setSuccess('¡Registro exitoso! Redirigiendo al login...');
        setTimeout(() => { router.push('/login'); }, 2000);
      } else {
        throw new Error(data.mensaje || 'Error en el registro');
      }
    } catch (err: any) {
      console.error('Error en registro:', err);
      setError(err.message || 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid} aria-hidden />
      <div className={styles.particles} aria-hidden>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className={styles.particle} />
        ))}
      </div>

      <div className={styles.card}>
        <div className={styles.logoRow}>
          <span className={styles.logoMark}><CarIcon /></span>
          <span className={styles.logoText}>Trans<strong>Meta</strong></span>
        </div>

        <div className={styles.head}>
          <h1>Crear cuenta</h1>
          <p className={styles.subtitle}>Regístrate para acceder al sistema</p>
        </div>

        {error && <div className={styles.errorAlert} role="alert">{error}</div>}
        {success && <div className={styles.successAlert} role="alert">{success}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Tipo de documento *</label>
              <select name="tipoDocumento" value={formData.tipoDocumento} onChange={handleChange}>
                <option value="CEDULA">Cédula de Ciudadanía</option>
                <option value="NIT">NIT</option>
                <option value="PASAPORTE">Pasaporte</option>
                <option value="TARJETA_IDENTIDAD">Tarjeta de Identidad</option>
              </select>
            </div>

            <div className={styles.field}>
              <label>Número de documento *</label>
              <input type="text" name="numeroDocumento" value={formData.numeroDocumento}
                onChange={handleChange} placeholder="Número de documento" />
            </div>

            <div className={styles.field}>
              <label>Nombres *</label>
              <input type="text" name="nombres" value={formData.nombres}
                onChange={handleChange} placeholder="Tus nombres" />
            </div>

            <div className={styles.field}>
              <label>Apellidos *</label>
              <input type="text" name="apellido" value={formData.apellido}
                onChange={handleChange} placeholder="Tus apellidos" />
            </div>

            <div className={styles.field}>
              <label>Fecha de nacimiento *</label>
              <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento}
                onChange={handleChange} />
            </div>

            <div className={styles.field}>
              <label>Teléfono</label>
              <input type="tel" name="telefono" value={formData.telefono}
                onChange={handleChange} placeholder="Número de teléfono" />
            </div>

            <div className={styles.field}>
              <label>Correo electrónico *</label>
              <input type="email" name="correo" value={formData.correo}
                onChange={handleChange} placeholder="ejemplo@correo.com" />
            </div>

            {/* Checkbox para licencia */}
            <div className={styles.field} style={{ gridColumn: 'span 2' }}>
  <label>¿Tiene licencia de conducción?</label>
  <div className={styles.toggleRow}>
    <span className={styles.toggleLabel}>
      {formData.licenciaConduccion === 'S' ? 'Sí, tengo licencia' : 'No tengo licencia'}
    </span>
    <div className={styles.toggleBtns}>
      <button
        type="button"
        className={`${styles.toggleBtn} ${formData.licenciaConduccion === 'S' ? styles.toggleBtnActive : ''}`}
        onClick={() => setFormData(prev => ({ ...prev, licenciaConduccion: 'S' }))}
      >
        Sí
      </button>
      <button
        type="button"
        className={`${styles.toggleBtn} ${formData.licenciaConduccion === 'N' ? styles.toggleBtnActive : ''}`}
        onClick={() => setFormData(prev => ({ ...prev, licenciaConduccion: 'N' }))}
      >
        No
      </button>
    </div>
  </div>
</div>

            <div className={styles.field}>
              <label>Contraseña *</label>
              <input type="password" name="contrasena" value={formData.contrasena}
                onChange={handleChange} placeholder="Mínimo 6 caracteres" />
            </div>

            <div className={styles.field}>
              <label>Confirmar contraseña *</label>
              <input type="password" name="confirmarContrasena" value={formData.confirmarContrasena}
                onChange={handleChange} placeholder="Repite tu contraseña" />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Registrando...' : <><span>Registrarse</span><ArrowRightIcon /></>}
          </button>
        </form>

        <p className={styles.loginLink}>
          ¿Ya tienes cuenta? <Link href="/login">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
}