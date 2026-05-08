'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../CSS/Login/Login.module.css';
import { BACKEND_URL } from '@/lib/config';

/* ── Icons ── */
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IdCardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <circle cx="8" cy="12" r="2.5"/>
    <line x1="13" y1="10" x2="19" y2="10"/>
    <line x1="13" y1="14" x2="17" y2="14"/>
  </svg>
);
const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const CarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h12l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/>
    <circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!correo.trim()) { 
        setError('Ingresa tu correo electrónico.'); 
        return; 
    }
    if (!password.trim()) { 
        setError('Ingresa tu contraseña.'); 
        return; 
    }
    
    setLoading(true);
    
    try {
        // SOLO UNA LLAMADA - Login
        const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                correo: correo, 
                contrasena: password 
            }),
        });
        
        const data = await response.json();
        console.log('Respuesta login completa:', data);
        
        if (!response.ok || data.status !== 'OK') {
            throw new Error(data.mensaje || 'Credenciales inválidas');
        }
        
        // Guardar TODOS los datos que vienen del login
        const cedula = data.cedula?.toString() || '';
        const rol = data.rol?.toString() || '2';
        const correoUsuario = data.correo || correo;
        
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userCedula', cedula);
        sessionStorage.setItem('userCorreo', correoUsuario);
        sessionStorage.setItem('userRol', rol);
        
        // Guardar nombres y apellidos DIRECTAMENTE de la respuesta del login
        if (data.nombres) {
            sessionStorage.setItem('userNombres', data.nombres);
        } else {
            const nombreDesdeCorreo = correoUsuario.split('@')[0];
            sessionStorage.setItem('userNombres', nombreDesdeCorreo);
        }
        
        if (data.apellido) {
            sessionStorage.setItem('userApellido', data.apellido);
        } else {
            sessionStorage.setItem('userApellido', '');
        }
        
        console.log('Datos guardados en sessionStorage:', {
            cedula: sessionStorage.getItem('userCedula'),
            rol: sessionStorage.getItem('userRol'),
            nombres: sessionStorage.getItem('userNombres'),
            apellido: sessionStorage.getItem('userApellido'),
            correo: sessionStorage.getItem('userCorreo')
        });
        
        // Redirigir según rol
        if (rol === '3') {
            console.log('Redirigiendo a dashboard-admin');
            router.push('/dashboard-admin');
        } else if (rol === '2') {
            console.log('Redirigiendo a dashboard-asesor');
            router.push('/dashboard-asesor');
        } else {
            console.log('Redirigiendo a dashboard');
            router.push('/dashboard');
        }
        
    } catch (err: any) {
        console.error('Error en login:', err);
        setError(err.message || 'Error de conexión con el servidor');
    } finally {
        setLoading(false);
    }
};
  return (
    <div className={styles.pg}>
      {/* Blobs de fondo */}
      <div className={styles.blobs} aria-hidden>
        <div className={`${styles.blob} ${styles.blob1}`} />
        <div className={`${styles.blob} ${styles.blob2}`} />
        <div className={`${styles.blob} ${styles.blob3}`} />
        <div className={`${styles.blob} ${styles.blob4}`} />
      </div>

      {/* Grid sutil */}
      <div className={styles.grid} aria-hidden />

      {/* Orbes flotantes decorativos */}
      <div className={styles.orbs} aria-hidden>
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
        <div className={`${styles.orb} ${styles.orb3}`} />
      </div>

      {/* Partículas flotantes */}
      <div className={styles.particles} aria-hidden>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className={styles.particle} />
        ))}
      </div>

      {/* Tarjeta principal */}
      <div className={`${styles.card} ${visible ? styles.cardVisible : ''}`}>

        {/* Logo */}
        <div className={styles.logoRow}>
          <span className={styles.logoMark}><CarIcon /></span>
          <span className={styles.logoText}>Trans<strong>Meta</strong></span>
        </div>

        {/* Encabezado */}
        <div className={styles.head}>
          <h1 className={styles.h1}>¡Bienvenido de nuevo!</h1>
          <p className={styles.sub}>Accede a tu panel de trámites</p>
        </div>

        {/* Formulario */}
        <form className={styles.form} onSubmit={handleSubmit} noValidate>

          {/* Correo Electrónico */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="correo">Correo electrónico</label>
            <div className={`${styles.fieldRow} ${error && !correo ? styles.fieldRowError : ''}`}>
              <span className={styles.fieldIco}><IdCardIcon /></span>
              <input
                id="correo"
                className={styles.input}
                type="email"
                placeholder="ejemplo@correo.com"
                value={correo}
                onChange={e => { setCorreo(e.target.value); setError(''); }}
                autoComplete="username"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.label} htmlFor="password">Contraseña</label>
              <Link href="/recuperar" className={styles.forgot}>¿Olvidaste tu contraseña?</Link>
            </div>
            <div className={`${styles.fieldRow} ${error && correo && !password ? styles.fieldRowError : ''}`}>
              <span className={styles.fieldIco}><LockIcon /></span>
              <input
                id="password"
                className={styles.input}
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPwd(v => !v)}
                aria-label={showPwd ? 'Ocultar' : 'Mostrar'}
              >
                {showPwd ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className={styles.errorBanner} role="alert">{error}</div>
          )}

          {/* Botón */}
          <button
            type="submit"
            className={`${styles.submitBtn} ${loading ? styles.loading : ''}`}
            disabled={loading}
          >
            {loading
              ? <span className={styles.spinner} />
              : <><span>Ingresar</span><ArrowRightIcon /></>
            }
          </button>
        </form>

        {/* Divider */}
        <div className={styles.divider}><span>¿Aún no tienes cuenta?</span></div>

        {/* Registro */}
        <Link href="/registro" className={styles.registerBtn}>
          Crear cuenta gratis <ArrowRightIcon />
        </Link>

        {/* Volver */}
        <p className={styles.back}>
          <Link href="/">← Volver al inicio</Link>
        </p>
      </div>
    </div>
  );
}