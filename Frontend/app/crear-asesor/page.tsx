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
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones
    if (!formData.cedula.trim()) {
      setError('La cédula es requerida');
      return;
    }
    if (!formData.nombres.trim()) {
      setError('Los nombres son requeridos');
      return;
    }
    if (!formData.apellido.trim()) {
      setError('Los apellidos son requeridos');
      return;
    }
    if (!formData.fechaNacimiento) {
      setError('La fecha de nacimiento es requerida');
      return;
    }
    if (!formData.correo.trim()) {
      setError('El correo es requerido');
      return;
    }
    if (!formData.contrasena.trim()) {
      setError('La contraseña es requerida');
      return;
    }
    if (formData.contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (!formData.especialidadTramite) {
      setError('La especialidad es requerida');
      return;
    }
    if (!formData.sueldo.trim()) {
      setError('El sueldo es requerido');
      return;
    }

    setLoading(true);

    try {
      // Formatear fecha a DD/MM/YYYY
      const fecha = new Date(formData.fechaNacimiento);
      const dia = fecha.getDate().toString().padStart(2, '0');
      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const anio = fecha.getFullYear();
      const fechaFormateada = `${dia}/${mes}/${anio}`;

      const response = await fetch(`${BACKEND_URL}/api/auth/asesor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cedula: parseInt(formData.cedula),
          nombres: formData.nombres,
          apellido: formData.apellido,
          fechaNacimiento: fechaFormateada,
          telefono: formData.telefono ? parseInt(formData.telefono) : null,
          correo: formData.correo,
          contrasena: formData.contrasena,
          especialidadTramite: formData.especialidadTramite,
          sueldo: parseFloat(formData.sueldo)
        }),
      });

      const data = await response.json();

      if (data.status === 'OK') {
        setSuccess('¡Asesor registrado exitosamente!');
        setFormData({
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
        setTimeout(() => {
          router.push('/dashboard-admin');
        }, 2000);
      } else {
        throw new Error(data.mensaje || 'Error al registrar asesor');
      }

    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Registrar Nuevo Asesor</h1>
        <p className={styles.subtitle}>Complete todos los datos del nuevo asesor</p>

        {error && (
          <div className={styles.errorAlert} role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className={styles.successAlert} role="alert">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Cédula *</label>
              <input
                type="text"
                name="cedula"
                value={formData.cedula}
                onChange={handleChange}
                placeholder="Número de cédula"
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Nombres *</label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                placeholder="Nombres completos"
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Apellidos *</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                placeholder="Apellidos completos"
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Fecha de Nacimiento *</label>
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Teléfono</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Número de teléfono"
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Correo Electrónico *</label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Contraseña *</label>
              <input
                type="password"
                name="contrasena"
                value={formData.contrasena}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Especialidad *</label>
              <select
                name="especialidadTramite"
                value={formData.especialidadTramite}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="">Seleccione una especialidad</option>
                {tiposTramite.map((tipo) => (
                  <option key={tipo.id} value={tipo.nombre}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Sueldo *</label>
              <input
                type="number"
                name="sueldo"
                value={formData.sueldo}
                onChange={handleChange}
                placeholder="Sueldo mensual"
                step="0.01"
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrar Asesor'}
            </button>
            <Link href="/dashboard-admin" className={styles.cancelBtn}>
              Cancelar
            </Link>
          </div>
        </form>

        <Link href="/dashboard-admin" className={styles.backLink}>
          ← Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}