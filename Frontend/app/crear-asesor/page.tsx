'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../CSS/Admin/CrearAsesor.module.css';
import { BACKEND_URL } from '@/lib/config';

interface TipoTramite {
  id: number;
  nombre: string;
  descripcion: string;
  valorBase: number;
}

/* ── Icons ── */
const CarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h12l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" />
    <circle cx="7.5" cy="17.5" r="2.5" /><circle cx="16.5" cy="17.5" r="2.5" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

export default function CrearAsesorPage() {
  const router = useRouter();
  const [tiposTramite, setTiposTramite] = useState<TipoTramite[]>([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [formData, setFormData] = useState({
    cedula: '',
    nombres: '',
    apellido: '',
    fechaNacimiento: '',
    telefono: '',
    correo: '',
    contrasena: '',
    especialidadTramite: '',
    sueldo: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userRol = sessionStorage.getItem('userRol');

    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    if (userRol !== '3') {
      router.push('/dashboard');
      return;
    }

    cargarTiposTramite();
  }, [router]);

  const cargarTiposTramite = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/tipo-tramite/list`);
      const data = await response.json();
      if (data.status === 'OK' && data.tiposTramite) {
        setTiposTramite(data.tiposTramite);
      }
    } catch (error) {
      console.error('Error cargando tipos de trámite:', error);
    } finally {
      setLoadingTipos(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cedula' || name === 'telefono') {
        const cleanValue = value.replace(/\D/g, '');
        setFormData(prev => ({ ...prev, [name]: cleanValue }));
    } else if (name === 'nombres' || name === 'apellido') {
        const cleanValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').slice(0, 25);
        setFormData(prev => ({ ...prev, [name]: cleanValue }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // --- Protección Anti-Inyección SQL ---
    const suspiciousPatterns = [/'/g, /"/g, /;/g, /--/g, /\/\*/g, /\*\//g, /\b(SELECT|INSERT|DELETE|UPDATE|DROP|UNION|ALTER|TRUNCATE|EXEC)\b/gi];
    const hasInjection = Object.values(formData).some(val => typeof val === 'string' && suspiciousPatterns.some(p => p.test(val)));
    if (hasInjection) {
      setError('Acción bloqueada por seguridad.');
      return;
    }

    // Validaciones
    if (!formData.cedula || !formData.nombres || !formData.apellido || !formData.fechaNacimiento || !formData.correo || !formData.contrasena || !formData.especialidadTramite || !formData.sueldo || !formData.telefono) {
      setError('Todos los campos marcados con * son obligatorios');
      return;
    }

    setLoading(true);

    try {
      const fecha = new Date(formData.fechaNacimiento);
      const fechaFormateada = `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;

      const response = await fetch(`${BACKEND_URL}/api/auth/asesor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          cedula: parseInt(formData.cedula),
          telefono: formData.telefono ? parseInt(formData.telefono) : null,
          fechaNacimiento: fechaFormateada,
          sueldo: parseFloat(formData.sueldo)
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.mensaje || 'Error al registrar asesor');

      setSuccess('¡Asesor registrado exitosamente!');
      setTimeout(() => router.push('/dashboard-admin'), 2000);

    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid} aria-hidden />

      <div className={styles.card}>
        <Link href="/dashboard-admin" className={styles.backHome}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Volver al Dashboard</span>
        </Link>

        <div className={styles.logoRow}>
          <span className={styles.logoMark}><CarIcon /></span>
          <span className={styles.logoText}>MPE <strong>SYSTEM</strong></span>
        </div>

        <div className={styles.head}>
          <h1>Registrar Nuevo Asesor</h1>
          <p className={styles.subtitle}>Complete los datos para dar de alta a un nuevo asesor en el sistema</p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}
        {success && <div className={styles.successAlert}>{success}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Cédula *</label>
              <input
                type="text"
                name="cedula"
                value={formData.cedula}
                onChange={handleChange}
                placeholder="Número de identificación"
                className={styles.input}
                required
              />
            </div>

            <div className={styles.field}>
              <label>Nombres *</label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                placeholder="Nombres"
                className={styles.input}
                required
              />
            </div>

            <div className={styles.field}>
              <label>Apellidos *</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                placeholder="Apellidos"
                className={styles.input}
                required
              />
            </div>

            <div className={styles.field}>
              <label>Fecha de Nacimiento *</label>
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.field}>
              <label>Teléfono *</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Número móvil"
                className={styles.input}
                required
              />
            </div>

            <div className={styles.field}>
              <label>Correo Electrónico *</label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                className={styles.input}
                required
              />
            </div>

            <div className={styles.field}>
              <label>Contraseña *</label>
              <input
                type="password"
                name="contrasena"
                value={formData.contrasena}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                className={styles.input}
                required
              />
              <p className={styles.inputNote}>💡 El asesor recibirá esta contraseña por correo y el sistema le solicitará cambiarla al ingresar.</p>
            </div>

            <div className={styles.field}>
              <label>Especialidad *</label>
              <select
                name="especialidadTramite"
                value={formData.especialidadTramite}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="">Seleccione especialidad</option>
                {tiposTramite.map((tipo) => (
                  <option key={tipo.id} value={tipo.nombre}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label>Sueldo Base *</label>
              <input
                type="number"
                name="sueldo"
                value={formData.sueldo}
                onChange={handleChange}
                placeholder="Ej: 1500000"
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Procesando...' : 'Registrar Asesor'}
            </button>
            <Link href="/dashboard-admin" className={styles.cancelBtn}>
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
