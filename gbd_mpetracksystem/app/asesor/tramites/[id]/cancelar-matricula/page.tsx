'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import styles from '../../../../CSS/Asesor/CancelarMatricula.module.css';
import { BACKEND_URL } from '@/lib/config';

/* ── Icons ── */
const CarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h12l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/>
    <circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>
  </svg>
);
const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

export default function CancelarMatriculaPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const idTramite = params.id as string;
  const placa = searchParams.get('placa') || '';
  const idCliente = searchParams.get('idCliente') || '';

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [vehiculoPrendado, setVehiculoPrendado] = useState(false);
  const [cancelacionConfirmada, setCancelacionConfirmada] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const enviandoRef = useRef(false);

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const rol = sessionStorage.getItem('userRol');
    if (!isLoggedIn || rol !== '2') { router.push('/login'); return; }
    if (!placa || !idCliente) { setError('Falta información del vehículo o cliente'); return; }
    verificarPrenda();
  }, []);

const verificarPrenda = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/vehiculos/cliente/${idCliente}`);
    const data = await response.json();

    if (data.status === 'OK' && data.vehiculos) {
      const vehiculo = data.vehiculos.find((v: any) => v.placa === placa);

      const prendado =
        vehiculo?.prendado ??
        vehiculo?.PRENDADO ??
        vehiculo?.Prendado ??
        'N';

      setVehiculoPrendado(prendado.toString().toUpperCase() === 'S');
    }
  } catch (error) {
    console.error('Error verificando prenda:', error);
  }
};

  const desbloquearEnvio = () => {
    enviandoRef.current = false;
    setSubmitting(false);
  };

  const finalizarTramite = async () => {
    const response = await fetch(`${BACKEND_URL}/api/tramite/estado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idTramite: parseInt(idTramite), estado: 'Finalizado' }),
    });
    const data = await response.json();
    if (!response.ok || data.status !== 'OK') {
      throw new Error(data.mensaje || 'No se pudo finalizar el trámite');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enviandoRef.current) return;
    setError(''); setSuccess('');
    if (vehiculoPrendado) {
      setError('No se puede cancelar la matrícula. Este vehículo tiene una prenda activa. Primero debe realizarse el levantamiento de prenda.');
      return;
    }
    if (!cancelacionConfirmada) {
      setError('Debe confirmar que la cancelación de matrícula fue realizada.');
      return;
    }
    setMostrarConfirmacion(true);
  };

const confirmarCancelacion = async () => {
  if (enviandoRef.current) return;

  setMostrarConfirmacion(false);
  enviandoRef.current = true;
  setSubmitting(true);
  setError('');
  setSuccess('');

  let cancelacionFinalizada = false;

  try {
    const response = await fetch(`${BACKEND_URL}/api/vehiculos/cancelarMatricula`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        placa,
        idCliente: parseInt(idCliente),
        idTramite: parseInt(idTramite),
      }),
    });

    const data = await response.json();

    if (!response.ok || data.status !== 'OK') {
      throw new Error(data.mensaje || 'Error al cancelar matrícula');
    }

    await finalizarTramite();

    cancelacionFinalizada = true;

    setSuccess(
      `Matrícula del vehículo ${placa} cancelada exitosamente. Trámite finalizado correctamente.`
    );

    setTimeout(() => {
      router.push(`/asesor/tramites/${idTramite}`);
    }, 1800);
  } catch (err: any) {
    setError(err.message || 'Error de conexión o no se pudo finalizar el trámite');
  } finally {
    if (!cancelacionFinalizada) {
      desbloquearEnvio();
    }
  }
};

  const volverAlTramite = () => {
    if (!submitting) router.push(`/asesor/tramites/${idTramite}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.inner}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.logoMark}><CarIcon /></span>
            <span className={styles.logoText}>Trans<strong>Meta</strong></span>
            <span className={styles.badgeAsesor}>Asesor</span>
          </div>
          <button
            type="button"
            disabled={submitting}
            className={`${styles.backButton} ${submitting ? styles.buttonDisabled : ''}`}            
            onClick={volverAlTramite}
          >
            <ArrowLeftIcon /> Volver al Trámite
          </button>
        </div>

        {/* ── Page title ── */}
        <div className={styles.pageTitleRow}>
          <div className={styles.pageIcon}><AlertIcon /></div>
          <div>
            <h1 className={styles.pageTitle}>Cancelar Matrícula</h1>
            <p className={styles.pageSub}>Esta acción es irreversible — revisa la información antes de continuar</p>
          </div>
        </div>

        {/* ── Alerts ── */}
        {error   && <div className={styles.errorAlert}>{error}</div>}
        {success && <div className={styles.successAlert}>{success}</div>}

        {/* ── Form card ── */}
        <div className={styles.formCard}>

          {/* Advertencia */}
          <div className={styles.infoBox}>
            <h3>Advertencia</h3>
            <p>Esta acción cancelará la matrícula del vehículo <strong>{placa}</strong>.</p>
            <p>El vehículo quedará marcado como <strong>CANCELADO</strong> y no podrá realizar nuevos trámites.</p>
            <p>Esta acción es <strong>irreversible</strong>.</p>
          </div>

          {/* Info trámite */}
          <div className={styles.vehicleInfo}>
            <h3>Información del Trámite</h3>
            <p><strong>ID Trámite:</strong> {idTramite}</p>
            <p><strong>Vehículo:</strong> {placa}</p>
            <p><strong>ID Cliente:</strong> {idCliente}</p>
          </div>

          {vehiculoPrendado && (
            <div className={styles.errorAlert}>
              Este vehículo tiene prenda activa. Primero debe realizarse el levantamiento de prenda.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Checkbox confirmación */}
            <div className={styles.actionBox}>
              <div className={styles.actionBoxHeader}>Confirmación requerida</div>
              <p>Confirma que la cancelación de matrícula fue realizada correctamente antes de finalizar el trámite.</p>

              <div
                role="checkbox"
                aria-checked={cancelacionConfirmada}
                tabIndex={0}
                className={`${styles.checkRow} ${cancelacionConfirmada ? styles.checkRowActive : ''}`}
                onClick={() => {
                if (!submitting) {
                  setCancelacionConfirmada(prev => !prev);
                }
              }}
              onKeyDown={e => {
                if (!submitting && e.key === ' ') {
                  setCancelacionConfirmada(prev => !prev);
                }
              }}
              >
                <span className={`${styles.checkBox} ${cancelacionConfirmada ? styles.checkBoxActive : ''}`}>✓</span>
                <span className={styles.checkLabel}>
                  {cancelacionConfirmada ? 'Cancelación de matrícula confirmada' : 'Marcar como realizada'}
                </span>
                <span className={`${styles.checkStatusBadge} ${cancelacionConfirmada ? styles.checkStatusDone : styles.checkStatusPending}`}>
                  {cancelacionConfirmada ? 'Confirmado' : 'Pendiente'}
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
                Volver
              </button>
              <button
                type="submit"
                disabled={submitting || vehiculoPrendado}
                className={styles.cancelButton}
              >
                {submitting ? 'Procesando...' : 'Confirmar cancelación'}
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* ── Modal confirmación ── */}
      {mostrarConfirmacion && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <div className={styles.modalIcon}>!</div>
            <h3>Confirmar cancelación de matrícula</h3>
            <p>
              Se cancelará la matrícula del vehículo <strong>{placa}</strong> y el trámite quedará finalizado.
              Esta acción no podrá modificarse desde este trámite.
            </p>
            <div className={styles.modalActions}>
              <button type="button" className={styles.btnModalCancelar} onClick={() => setMostrarConfirmacion(false)}>
                Cancelar
              </button>
              <button type="button" className={styles.btnModalConfirmar} onClick={confirmarCancelacion}>
                Sí, cancelar y finalizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}