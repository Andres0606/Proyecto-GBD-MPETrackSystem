'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../../../../CSS/Asesor/GestionarPrenda.module.css';
import { BACKEND_URL } from '@/lib/config';

/* ── Icons ── */
const ArrowLeftIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const AlertCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const UnlockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
  </svg>
);

export default function GestionarPrendaPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const idTramite = params.id as string;
  const placa = searchParams.get('placa') || '';
  const tipo = searchParams.get('tipo') || ''; // 'inscribir' o 'levantar'

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const enviandoRef = useRef(false);
const [accionConfirmada, setAccionConfirmada] = useState(false);
const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const rol = sessionStorage.getItem('userRol');

    if (!isLoggedIn || rol !== '2') {
      router.push('/login');
      return;
    }

    if (!placa) {
      setError('Falta información del vehículo');
    }
  }, []);

  const desbloquearEnvio = () => {
  enviandoRef.current = false;
  setSubmitting(false);
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (enviandoRef.current) return;

  setError('');
  setSuccess('');

  if (!placa) {
    setError('Falta información del vehículo.');
    return;
  }

  if (!accionConfirmada) {
    setError(
      esInscripcion
        ? 'Debe confirmar que la inscripción de prenda fue realizada.'
        : 'Debe confirmar que el levantamiento de prenda fue realizado.'
    );
    return;
  }

  setMostrarConfirmacion(true);
};

const finalizarTramite = async () => {
  const response = await fetch(`${BACKEND_URL}/api/tramite/estado`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idTramite: parseInt(idTramite),
      estado: 'Finalizado',
    }),
  });

  const data = await response.json();

  if (!response.ok || data.status !== 'OK') {
    throw new Error(data.mensaje || 'No se pudo finalizar el trámite');
  }
};

const confirmarGestionPrenda = async () => {
  if (enviandoRef.current) return;

  setMostrarConfirmacion(false);
  enviandoRef.current = true;
  setSubmitting(true);
  setError('');
  setSuccess('');

  const endpoint =
    tipo === 'inscribir'
      ? `${BACKEND_URL}/api/vehiculos/inscribirPrenda`
      : `${BACKEND_URL}/api/vehiculos/levantarPrenda`;

  const data = {
    placa,
    idTramite: parseInt(idTramite),
  };

  let procesoRealizado = false;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

if (response.ok && result.status === 'OK') {
  await finalizarTramite();

  procesoRealizado = true;

  setSuccess(
    esInscripcion
      ? `Prenda inscrita correctamente. El vehículo ${placa} quedó marcado como prendado. Trámite finalizado correctamente.`
      : `Prenda levantada correctamente. El vehículo ${placa} ya no queda marcado como prendado. Trámite finalizado correctamente.`
  );

  setTimeout(() => {
    router.push(`/asesor/tramites/${idTramite}`);
  }, 1800);
} else {
      setError(result.mensaje || 'Error al procesar la prenda');
    }
  } catch {
    setError('Error de conexión con el servidor');
  } finally {
    if (!procesoRealizado) {
      desbloquearEnvio();
    }
  }
};
 

  const esInscripcion = tipo === 'inscribir';
  const titulo = esInscripcion ? 'Inscripción de Prenda' : 'Levantamiento de Prenda';
  const accion = esInscripcion ? 'Inscribir Prenda' : 'Levantar Prenda';
  const colorBoton = esInscripcion ? styles.inscribirButton : styles.levantarButton;

  return (
    <div className={styles.container}>
      <div className={styles.inner}>

        {/* Header */}
        <div className={styles.header}>
        <button
          type="button"
          disabled={submitting}
          className={`${styles.backButton} ${submitting ? styles.buttonDisabled : ''}`}
          onClick={() => {
            if (!submitting) {
              router.push(`/asesor/tramites/${idTramite}`);
            }
          }}
        >
          <ArrowLeftIcon /> Volver al Trámite
        </button>
          <h1>{titulo}</h1>
        </div>

        {/* Alertas */}
        {error && (
          <div className={styles.errorAlert}>
            <AlertCircleIcon /> {error}
          </div>
        )}
        {success && (
          <div className={styles.successAlert}>
            <CheckCircleIcon /> {success}
          </div>
        )}

        {/* Card principal */}
        <div className={styles.formCard}>

          <div className={styles.infoBox}>
            <h3>
              {esInscripcion ? <LockIcon /> : <UnlockIcon />}
              {esInscripcion ? 'Inscripción de Prenda' : 'Levantamiento de Prenda'}
            </h3>
            <p><strong>Vehículo:</strong> {placa}</p>
            <p><strong>ID Trámite:</strong> #{idTramite}</p>
          </div>

       <form onSubmit={handleSubmit}>
  <div className={styles.actionBox}>
    <div className={styles.actionBoxHeader}>
      <div className={styles.actionBoxHeaderIcon}>
        {esInscripcion ? <LockIcon /> : <UnlockIcon />}
      </div>
      <p className={styles.actionBoxHeaderText}>Confirmación requerida</p>
    </div>

    <div className={styles.actionBoxBody}>
      <p className={styles.actionBoxDesc}>
        {esInscripcion
          ? 'Confirma que la prenda fue inscrita correctamente para este vehículo antes de finalizar el trámite.'
          : 'Confirma que la prenda fue levantada correctamente para este vehículo antes de finalizar el trámite.'}
      </p>

      <div
        role="checkbox"
        aria-checked={accionConfirmada}
        tabIndex={0}
        className={`${styles.checkRow} ${accionConfirmada ? styles.checkRowActive : ''}`}
        onClick={() => setAccionConfirmada(prev => !prev)}
        onKeyDown={e => e.key === ' ' && setAccionConfirmada(prev => !prev)}
      >
        <div className={`${styles.checkBox} ${accionConfirmada ? styles.checkBoxActive : ''}`}>
          <CheckCircleIcon />
        </div>

        <span className={`${styles.checkLabel} ${accionConfirmada ? styles.checkLabelActive : ''}`}>
          {accionConfirmada
            ? esInscripcion
              ? 'Inscripción de prenda confirmada'
              : 'Levantamiento de prenda confirmado'
            : 'Marcar como realizado'}
        </span>

        <span className={`${styles.checkStatusBadge} ${accionConfirmada ? styles.checkStatusDone : styles.checkStatusPending}`}>
          {accionConfirmada ? 'Confirmado' : 'Pendiente'}
        </span>
      </div>
    </div>
  </div>

  <div className={styles.buttonGroup}>
    <button
      type="button"
      disabled={submitting}
      className={`${styles.backButtonForm} ${submitting ? styles.buttonDisabled : ''}`}
      onClick={() => {
        if (!submitting) {
          router.push(`/asesor/tramites/${idTramite}`);
        }
      }}
    >
      Cancelar
    </button>

    <button type="submit" disabled={submitting} className={colorBoton}>
      {esInscripcion ? <LockIcon /> : <UnlockIcon />}
      {submitting ? 'Procesando...' : accion}
    </button>
  </div>
</form>

        </div>
      </div>
      {mostrarConfirmacion && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalBox}>
      <div className={styles.modalIcon}>
        <AlertCircleIcon />
      </div>

      <h3>
        {esInscripcion ? 'Confirmar inscripción de prenda' : 'Confirmar levantamiento de prenda'}
      </h3>

      <p>
        {esInscripcion
        ? `Se marcará el vehículo ${placa} como prendado y el trámite quedará finalizado.`
        : `Se quitará la marca de prendado al vehículo ${placa} y el trámite quedará finalizado.` }    
      </p>

      <div className={styles.modalActions}>
        <button
          type="button"
          className={styles.btnModalCancelar}
          onClick={() => setMostrarConfirmacion(false)}
        >
          Cancelar
        </button>

        <button
          type="button"
          className={styles.btnModalConfirmar}
          onClick={confirmarGestionPrenda}
        >
          Sí, confirmar
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}