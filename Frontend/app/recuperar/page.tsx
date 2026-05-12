'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Key, 
  ArrowLeft, 
  Car, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import styles from '../CSS/Login/Recuperar.module.css';
import { BACKEND_URL } from '@/lib/config';

export default function RecuperarPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Email, 2: Code + Password
  const [correo, setCorreo] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correo.trim()) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.mensaje || 'Error al enviar el código');

      setStep(2);
      setSuccess('Código enviado a ' + correo);
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo.trim() || !nuevaContrasena.trim() || !confirmarContrasena.trim()) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (nuevaContrasena.length < 6) {
      setError('Mínimo 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, codigo, nuevaContrasena }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.mensaje || 'Error al restablecer');

      setSuccess('¡Éxito! Contraseña actualizada');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  const stepVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: 'easeInOut' }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      transition: { duration: 0.3, ease: 'easeInOut' }
    })
  };

  return (
    <div className={styles.pg}>
      <div className={styles.blobs}>
        <motion.div 
          className={`${styles.blob} ${styles.blob1}`}
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div 
          className={`${styles.blob} ${styles.blob2}`}
          animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0] }}
          transition={{ duration: 12, repeat: Infinity, delay: 2 }}
        />
      </div>
      <div className={styles.grid} />

      <motion.div 
        className={styles.card}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <div className={styles.logoRow}>
          <div className={styles.logoMark}>
            <Car size={24} strokeWidth={2.5} />
          </div>
          <span className={styles.logoText}>Trans<strong>Meta</strong></span>
        </div>

        <div className={styles.head}>
          <h1 className={styles.h1}>Recuperar</h1>
          <p className={styles.sub}>
            {step === 1 
              ? 'Te enviaremos un código de seguridad a tu correo.' 
              : 'Verifica tu identidad y elige una nueva contraseña.'}
          </p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={styles.errorBanner}>
            <AlertCircle size={18} /> {error}
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={styles.successBanner}>
            <CheckCircle2 size={18} /> {success}
          </motion.div>
        )}

        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <AnimatePresence mode="wait" custom={step === 1 ? -1 : 1}>
            {step === 1 ? (
              <motion.form 
                key="step1"
                custom={1}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className={styles.form} 
                onSubmit={handleRequestCode}
              >
                <div className={styles.field}>
                  <label className={styles.label}>Correo Electrónico</label>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldIco}><Mail size={20} /></div>
                    <input
                      className={styles.input}
                      type="email"
                      placeholder="tu@correo.com"
                      value={correo}
                      onChange={e => { setCorreo(e.target.value); setError(''); }}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? <span className={styles.spinner} /> : (
                    <>Enviar Código <ArrowRight size={18} /></>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="step2"
                custom={-1}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className={styles.form} 
                onSubmit={handleResetPassword}
              >
                <div className={styles.field}>
                  <label className={styles.label}>Código de Verificación</label>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldIco}><Key size={20} /></div>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder="6 dígitos"
                      maxLength={6}
                      value={codigo}
                      onChange={e => { setCodigo(e.target.value.replace(/\D/g, '')); setError(''); }}
                      required
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Nueva Contraseña</label>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldIco}><Lock size={20} /></div>
                    <input
                      className={styles.input}
                      type="password"
                      placeholder="Mín. 6 caracteres"
                      value={nuevaContrasena}
                      onChange={e => { setNuevaContrasena(e.target.value); setError(''); }}
                      required
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Confirmar Contraseña</label>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldIco}><ShieldCheck size={20} /></div>
                    <input
                      className={styles.input}
                      type="password"
                      placeholder="Repite tu contraseña"
                      value={confirmarContrasena}
                      onChange={e => { setConfirmarContrasena(e.target.value); setError(''); }}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? <span className={styles.spinner} /> : (
                    <>Actualizar Contraseña <CheckCircle2 size={18} /></>
                  )}
                </button>
                
                <span className={styles.stepText} onClick={() => { setStep(1); setSuccess(''); }}>
                  ¿No llegó el código? Reintentar
                </span>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <Link href="/login" className={styles.backLink}>
          <ArrowLeft size={16} /> Volver al login
        </Link>
      </motion.div>
    </div>
  );
}
