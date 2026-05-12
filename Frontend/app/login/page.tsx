'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../CSS/Login/Login.module.css';
import { BACKEND_URL } from '@/lib/config';
import FaceCapture from '../components/FaceCapture';

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
const FaceIdIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
    <path d="M8 7v2m8-2v2M9 13s.5 1 3 1 3-1 3-1"/>
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
  
  // Estados para OTP y Biometría
  const [isOtpRequired, setIsOtpRequired] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [showFaceCapture, setShowFaceCapture] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correo.trim() || !password.trim()) { 
        setError('Ingresa tus credenciales.'); 
        return; 
    }
    setLoading(true);
    setError('');
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, contrasena: password }),
        });
        
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.mensaje || 'Error en el servidor');

        if (data.status === 'OTP_REQUIRED') {
            setIsOtpRequired(true);
            setOtpMessage(data.mensaje);
            setLoading(false);
            return;
        }

        if (data.status === 'OK') handleLoginSuccess(data);
        else throw new Error(data.mensaje || 'Credenciales inválidas');
        
    } catch (err: any) {
        setError(err.message || 'Error de conexión');
    } finally {
        setLoading(false);
    }
  };

  const onFaceCapture = async (descriptor: number[]) => {
    setShowFaceCapture(false);
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/biometric/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descriptor }),
      });
      const data = await response.json();
      if (!response.ok || data.status !== 'OK') throw new Error(data.mensaje || 'Rostro no reconocido');
      handleLoginSuccess(data);
    } catch (err: any) {
      setError(err.message || 'Error en reconocimiento facial');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
        setError('Ingresa el código completo.');
        return;
    }
    setLoading(true);
    setError('');

    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, codigo: otpCode }),
        });
        const data = await response.json();
        if (!response.ok || data.status !== 'OK') throw new Error(data.mensaje || 'Código inválido');
        handleLoginSuccess(data);
    } catch (err: any) {
        setError(err.message || 'Error de verificación');
    } finally {
        setLoading(false);
    }
  };

  const handleLoginSuccess = (data: any) => {
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('userCedula', data.cedula?.toString() || '');
    sessionStorage.setItem('userCorreo', data.correo || correo);
    sessionStorage.setItem('userRol', data.rol?.toString() || '1');
    if (data.nombres) sessionStorage.setItem('userNombres', data.nombres);
    if (data.apellido) sessionStorage.setItem('userApellido', data.apellido);
    
    const rol = data.rol?.toString();
    if (rol === '3') router.push('/dashboard-admin');
    else if (rol === '2') router.push('/dashboard-asesor');
    else router.push('/dashboard');
  };

  return (
    <div className={styles.pg}>
      <div className={styles.blobs} aria-hidden>
        <div className={`${styles.blob} ${styles.blob1}`} />
        <div className={`${styles.blob} ${styles.blob2}`} />
      </div>
      <div className={styles.grid} aria-hidden />

      <div className={styles.card} style={{ position: 'relative' }}>
        <Link href="/" className={styles.backHome}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>Volver al inicio</span>
        </Link>

        <div className={styles.logoRow}>
          <span className={styles.logoMark}><CarIcon /></span>
          <span className={styles.logoText}>MPE <strong>SYSTEM</strong></span>
        </div>

        <div className={styles.head}>
          <h1 className={styles.h1}>{isOtpRequired ? 'Verifica tu identidad' : '¡Bienvenido!'}</h1>
          <p className={styles.sub}>{isOtpRequired ? otpMessage : 'Accede a tu panel de trámites'}</p>
        </div>

        {!isOtpRequired ? (
          <>
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div className={styles.field}>
                <label className={styles.label}>Correo electrónico</label>
                <div className={styles.fieldRow}>
                  <span className={styles.fieldIco}><IdCardIcon /></span>
                  <input
                    className={styles.input}
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={correo}
                    onChange={e => { setCorreo(e.target.value); setError(''); }}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>Contraseña</label>
                  <Link href="/recuperar" className={styles.forgot}>¿Olvidaste tu contraseña?</Link>
                </div>
                <div className={styles.fieldRow}>
                  <span className={styles.fieldIco}><LockIcon /></span>
                  <input
                    className={styles.input}
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPwd(v => !v)}>
                    {showPwd ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {error && <div className={styles.errorBanner}>{error}</div>}

              <button type="submit" className={`${styles.submitBtn} ${loading ? styles.loading : ''}`} disabled={loading}>
                {loading ? <span className={styles.spinner} /> : <><span>Ingresar</span><ArrowRightIcon /></>}
              </button>
            </form>

            <div className={styles.divider}><span>O inicia sesión con biometría</span></div>

            <button 
              type="button" 
              className={styles.faceIdBtn} 
              onClick={() => setShowFaceCapture(true)}
              disabled={loading}
            >
              <FaceIdIcon />
              <span>Ingresar con Face ID</span>
            </button>
          </>
        ) : (
          <form className={styles.form} onSubmit={handleVerifyOtp} noValidate>
            <div className={styles.field}>
              <label className={styles.label}>Código OTP</label>
              <div className={styles.fieldRow}>
                <span className={styles.fieldIco}><LockIcon /></span>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={otpCode}
                  onChange={e => { setOtpCode(e.target.value.replace(/\D/g, '')); setError(''); }}
                  autoFocus
                />
              </div>
              <p className={styles.forgot} style={{ marginTop: '0.5rem', cursor: 'pointer' }} onClick={() => setIsOtpRequired(false)}>
                ← Volver al login
              </p>
            </div>

            {error && <div className={styles.errorBanner}>{error}</div>}

            <button type="submit" className={`${styles.submitBtn} ${loading ? styles.loading : ''}`} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : <><span>Verificar</span><ArrowRightIcon /></>}
            </button>
          </form>
        )}

        <div className={styles.divider}><span>¿Aún no tienes cuenta?</span></div>
        <Link href="/registro" className={styles.registerBtn}>
          Crear cuenta gratis <ArrowRightIcon />
        </Link>
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
