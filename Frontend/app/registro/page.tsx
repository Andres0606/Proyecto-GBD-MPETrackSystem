'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../CSS/Registro/Registro.module.css';
import { BACKEND_URL } from '@/lib/config';
import FaceCapture from '../components/FaceCapture';

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
    licenciaConduccion: 'S'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para Biometría
  const [useFaceId, setUseFaceId] = useState(false);
  const [showFaceCapture, setShowFaceCapture] = useState(false);
  const [faceData, setFaceData] = useState<{ descriptor: number[], image: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'numeroDocumento') {
      // Solo números, sin letras
      const cleanValue = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: cleanValue }));
    } else if (name === 'nombres' || name === 'apellido') {
      // Solo letras, máximo 25 caracteres
      const cleanValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').slice(0, 25);
      setFormData(prev => ({ ...prev, [name]: cleanValue }));
    } else if (name === 'telefono') {
      // Solo números, máximo 10 caracteres
      const cleanValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: cleanValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setError('');
  };

  const onFaceCapture = (descriptor: number[], image: string) => {
    setFaceData({ descriptor, image });
    setShowFaceCapture(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // --- Protección Anti-Inyección SQL ---
    const suspiciousPatterns = [
      /'/g, /"/g, /;/g, /--/g, /\/\*/g, /\*\//g, /xp_/gi,
      /\b(SELECT|INSERT|DELETE|UPDATE|DROP|UNION|ALTER|TRUNCATE|EXEC)\b/gi,
      /OR\s+1\s*=\s*1/gi,
      /'\s+OR\s+'/gi
    ];
    const isSuspicious = (text: string) => suspiciousPatterns.some(pattern => pattern.test(text));
    const hasInjection = Object.values(formData).some(val => typeof val === 'string' && isSuspicious(val));

    if (hasInjection) {
      setError('Acción bloqueada: Se detectaron caracteres o palabras no permitidas por seguridad.');
      return;
    }
    // --------------------------------------

    if (!formData.numeroDocumento || !formData.nombres || !formData.correo || !formData.contrasena) {
      setError('Por favor completa todos los campos obligatorios (*)');
      return;
    }

    if (formData.telefono && formData.telefono.length !== 10) {
      setError('El teléfono debe tener exactamente 10 dígitos');
      return;
    }

    const emailValidDomains = ['@gmail.com', '@hotmail.com', '@outlok.com', '@outlook.com'];
    const lastAtIdx = formData.correo.lastIndexOf('@');
    const emailDomain = lastAtIdx !== -1 ? formData.correo.substring(lastAtIdx).toLowerCase() : '';

    if (!emailValidDomains.includes(emailDomain)) {
      setError('Se requiere una cuenta @gmail.com, @hotmail.com o @outlook.com ya que es de un uso privado y personal');
      return;
    }

    // Mínimo 8 caracteres, una minúscula, una mayúscula, un número y un carácter especial
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(formData.contrasena)) {
      setError('La contraseña debe tener mínimo 8 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial');
      return;
    }

    if (formData.contrasena !== formData.confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (useFaceId && !faceData) {
      setError('Debes capturar tu rostro si activaste Face ID');
      return;
    }

    setLoading(true);

    try {
      const fecha = new Date(formData.fechaNacimiento);
      const fechaFormateada = `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;

      // 1. Registro normal
      const response = await fetch(`${BACKEND_URL}/api/auth/register/cliente`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          numeroDocumento: parseInt(formData.numeroDocumento),
          telefono: formData.telefono ? parseInt(formData.telefono) : null,
          fechaNacimiento: fechaFormateada
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.mensaje || 'Error en el registro');

      // 2. Si Face ID está activo, enviar datos biométricos
      if (useFaceId && faceData) {
        setSuccess('Datos básicos guardados. Vinculando rostro...');
        const bioResponse = await fetch(`${BACKEND_URL}/api/biometric/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            correo: formData.correo,
            descriptor: faceData.descriptor,
            image: faceData.image
          }),
        });
        const bioData = await bioResponse.json();
        if (!bioResponse.ok) console.error('Error Face ID:', bioData.mensaje);
      }

      setSuccess('¡Registro completado exitosamente!');
      setTimeout(() => router.push('/login'), 2000);
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
        <Link href="/" className={styles.backHome}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Volver al inicio</span>
        </Link>

        <div className={styles.logoRow}>
          <span className={styles.logoMark}><CarIcon /></span>
          <span className={styles.logoText}>MPE <strong>SYSTEM</strong></span>
        </div>

        <div className={styles.head}>
          <h1>Crear cuenta</h1>
          <p className={styles.subtitle}>Regístrate para acceder al sistema</p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}
        {success && <div className={styles.successAlert}>{success}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Tipo de documento *</label>
              <select name="tipoDocumento" value={formData.tipoDocumento} onChange={handleChange}>
                <option value="CEDULA">Cédula de Ciudadanía</option>
                <option value="NIT">NIT</option>
                <option value="PASAPORTE">Pasaporte</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>Número de documento *</label>
              <input type="text" name="numeroDocumento" value={formData.numeroDocumento} onChange={handleChange} />
            </div>
            <div className={styles.field}>
              <label>Nombres *</label>
              <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} />
            </div>
            <div className={styles.field}>
              <label>Apellidos *</label>
              <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} />
            </div>
            <div className={styles.field}>
              <label>Fecha de nacimiento *</label>
              <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} />
            </div>
            <div className={styles.field}>
              <label>Teléfono</label>
              <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} />
            </div>
            <div className={styles.field} style={{ gridColumn: 'span 2' }}>
              <label>Correo electrónico *</label>
              <input type="email" name="correo" value={formData.correo} onChange={handleChange} />
            </div>
            <div className={styles.field}>
              <label>Contraseña *</label>
              <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} />
            </div>
            <div className={styles.field}>
              <label>Confirmar contraseña *</label>
              <input type="password" name="confirmarContrasena" value={formData.confirmarContrasena} onChange={handleChange} />
            </div>

            {/* FACE ID OPTION */}
            <div className={styles.faceIdContainer}>
              <label htmlFor="faceId" className={styles.faceToggle}>
                <input
                  type="checkbox"
                  id="faceId"
                  checked={useFaceId}
                  onChange={e => setUseFaceId(e.target.checked)}
                />
                <span>Activar Verificación Facial (Face ID)</span>
              </label>

              {useFaceId && (
                <button
                  type="button"
                  onClick={() => setShowFaceCapture(true)}
                  className={`${styles.faceBtn} ${faceData ? styles.faceBtnCaptured : ''}`}
                >
                  {faceData ? (
                    <>   Rostro capturado</>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
                      </svg>
                      Capturar mi rostro
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Procesando...' : <><span>Registrarse</span><ArrowRightIcon /></>}
          </button>
        </form>

        <p className={styles.loginLink}>
          ¿Ya tienes cuenta? <Link href="/login">Inicia sesión aquí</Link>
        </p>
      </div>

      {showFaceCapture && (
        <FaceCapture
          onCapture={onFaceCapture}
          onCancel={() => setShowFaceCapture(false)}
        />
      )}
    </div>
  );
}
