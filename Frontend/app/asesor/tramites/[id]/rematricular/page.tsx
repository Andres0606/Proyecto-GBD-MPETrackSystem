'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import styles from '../../../../CSS/Asesor/Rematricular.module.css';
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

const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);

export default function RematricularPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const idTramite = params.id as string;
  const placa = searchParams.get('placa') || '';
  const idCliente = searchParams.get('idCliente') || '';

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const enviandoRef = useRef(false);
const [rematriculaConfirmada, setRematriculaConfirmada] = useState(false);
const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const rol = sessionStorage.getItem('userRol');

    if (!isLoggedIn || rol !== '2') {
      router.push('/login');
      return;
    }

    if (!placa || !idCliente) {
      setError('Falta información del vehículo o cliente');
    }
  }, []);

  const desbloquearEnvio = () => {
  enviandoRef.current = false;
  setSubmitting(false);
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

const volverAlTramite = () => {
  if (!submitting) {
    router.push(`/asesor/tramites/${idTramite}`);
  }
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (enviandoRef.current) return;

  setError('');
  setSuccess('');

  if (!placa || !idCliente) {
    setError('Falta información del vehículo o cliente.');
    return;
  }

  if (!rematriculaConfirmada) {
    setError('Debe confirmar que la rematrícula fue realizada.');
    return;
  }

  setMostrarConfirmacion(true);
};

const confirmarRematricula = async () => {
  if (enviandoRef.current) return;

  setMostrarConfirmacion(false);
  enviandoRef.current = true;
  setSubmitting(true);
  setError('');
  setSuccess('');

  const rematriculaData = {
    placa,
    idCliente: parseInt(idCliente),
    idTramite: parseInt(idTramite),
  };

  let rematriculaFinalizada = false;

  try {
    const response = await fetch(`${BACKEND_URL}/api/vehiculos/rematricular`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rematriculaData),
    });

    const data = await response.json();

    if (!response.ok || data.status !== 'OK') {
      throw new Error(data.mensaje || 'Error al realizar rematrícula');
    }

    await finalizarTramite();

    rematriculaFinalizada = true;

    setSuccess(
      `Rematrícula del vehículo ${placa} realizada exitosamente. Trámite finalizado correctamente.`
    );

    setTimeout(() => {
      router.push(`/asesor/tramites/${idTramite}`);
    }, 1800);
  } catch (err: any) {
    setError(err.message || 'Error de conexión o no se pudo finalizar el trámite');
  } finally {
    if (!rematriculaFinalizada) {
      desbloquearEnvio();
    }
  }
};

  return (
    <div className={styles.container}>
      <div className={styles.inner}>

        {/* Header */}
        <div className={styles.header}>
        <button
          type="button"
          disabled={submitting}
          className={`${styles.backButton} ${submitting ? styles.buttonDisabled : ''}`}
          onClick={volverAlTramite}
        >
          <ArrowLeftIcon /> Volver al Trámite
        </button>
          <h1>Rematrícula</h1>
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

          {/* Info reactivación */}
          <div className={styles.infoBox}>
            <h3><CheckCircleIcon /> Reactivar Vehículo</h3>
            <p>
              Esta acción reactivará la matrícula del vehículo <strong>{placa}</strong>.
            </p>
            <p>
              El vehículo volverá a estar en estado <strong>ACTIVO</strong> y podrá realizar nuevos trámites.
            </p>
          </div>

          {/* Info del trámite */}
          <div className={styles.vehicleInfo}>
            <h3>Información del Trámite</h3>
            <p><strong>ID Trámite:</strong> #{idTramite}</p>
            <p><strong>Vehículo:</strong> {placa}</p>
            <p><strong>ID Cliente:</strong> {idCliente}</p>
          </div>

<form onSubmit={handleSubmit}>
  <div className={styles.actionBox}>
    <div className={styles.actionBoxHeader}>
      Confirmación requerida
    </div>

    <p>
      Confirma que la rematrícula fue realizada correctamente antes de finalizar el trámite.
    </p>

    <div
      role="checkbox"
      aria-checked={rematriculaConfirmada}
      tabIndex={0}
      className={`${styles.checkRow} ${rematriculaConfirmada ? styles.checkRowActive : ''}`}
      onClick={() => {
        if (!submitting) {
          setRematriculaConfirmada(prev => !prev);
        }
      }}
      onKeyDown={e => {
        if (!submitting && e.key === ' ') {
          setRematriculaConfirmada(prev => !prev);
        }
      }}
    >
      <span className={`${styles.checkBox} ${rematriculaConfirmada ? styles.checkBoxActive : ''}`}>
        ✓
      </span>

      <span className={styles.checkLabel}>
        {rematriculaConfirmada
          ? 'Rematrícula confirmada'
          : 'Marcar como realizada'}
      </span>

      <span className={`${styles.checkStatusBadge} ${rematriculaConfirmada ? styles.checkStatusDone : styles.checkStatusPending}`}>
        {rematriculaConfirmada ? 'Confirmado' : 'Pendiente'}
      </span>
    </div>
  </div>

  <div className={styles.buttonGroup}>
    <button
      type="button"
      disabled={submitting}
      className={`${styles.backButtonForm} ${submitting ? styles.buttonDisabled : ''}`}
      onClick={volverAlTramite}
    >
      Cancelar
    </button>

    <button type="submit" disabled={submitting} className={styles.reactivateButton}>
      <RefreshIcon />
      {submitting ? 'Procesando...' : 'Confirmar rematrícula'}
    </button>
  </div>
</form>

        </div>
      </div>

      {mostrarConfirmacion && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalBox}>
      <div className={styles.modalIcon}>
        <RefreshIcon />
      </div>

      <h3>Confirmar rematrícula</h3>

      <p>
        Se reactivará la matrícula del vehículo <strong>{placa}</strong> y el trámite quedará finalizado.
        El vehículo volverá a estado ACTIVO.
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
          onClick={confirmarRematricula}
        >
          Sí, rematricular y finalizar
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}