'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../../../../CSS/Asesor/CompletarCita.module.css';
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
const ClipboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
);
const MoneyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z"/>
  </svg>
);
const VehicleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h12l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/>
    <circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>
  </svg>
);
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const TagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);
const HashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/>
    <line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const SuccessIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

interface CitaInfo {
  idCita: number;
  cliente: string;
  telefono: string;
  vehiculo: string;
  tipoTramite: string;
  valorBase: number;
  fechaProgramada: string;
}

export default function CompletarCitaPage() {
const router = useRouter();
const params = useParams();
const idCita = params.id as string;

const enviandoRef = useRef(false);

const [cita, setCita] = useState<CitaInfo | null>(null);
const [loading, setLoading] = useState(true);
const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [valorOtrosConceptos, setValorOtrosConceptos] = useState<number>(0);

  const cedulaAsesor =
    typeof window !== 'undefined' ? sessionStorage.getItem('userCedula') : null;

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const rol = sessionStorage.getItem('userRol');
    if (!isLoggedIn || !cedulaAsesor || rol !== '2') {
      router.push('/login');
      return;
    }
    cargarCita();
  }, []);

  const cargarCita = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/citas/agendadas/${cedulaAsesor}`);
      const data = await response.json();

      if (data.status === 'OK' && data.citas) {
        const found = data.citas.find((c: any) => c.idCita === parseInt(idCita));
        setCita(found ?? null);
      } else {
        setError('No se pudo cargar la información de la cita');
      }
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const desbloquearEnvio = () => {
  enviandoRef.current = false;
  setSubmitting(false);
};

const handleVolver = () => {
  if (enviandoRef.current || submitting) return;
  router.push('/asesor/citas');
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (enviandoRef.current) return;

  enviandoRef.current = true;
  setSubmitting(true);
  setError('');
  setSuccess('');

  const base = Number(cita?.valorBase || 0);
  const otros = Number(valorOtrosConceptos || 0);
  const total = base + otros;

  try {
    const resCita = await fetch(`${BACKEND_URL}/api/citas/completar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idCita: parseInt(idCita) }),
    });

    const dataCita = await resCita.json();

    if (!resCita.ok || dataCita.status !== 'OK') {
      throw new Error(dataCita.mensaje || 'Error al completar la cita');
    }

    const resTramite = await fetch(`${BACKEND_URL}/api/tramite/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idCita: parseInt(idCita),
        valorTramite: base,
        valorOtrosConceptos: otros,
      }),
    });

    const dataTramite = await resTramite.json();

    if (resTramite.ok && dataTramite.status === 'OK') {
      setSuccess(
        `Trámite #${dataTramite.idTramite} creado exitosamente — Valor total: $${total.toLocaleString()}`
      );

      setTimeout(() => router.push('/asesor/tramites'), 2500);
    } else {
      throw new Error(dataTramite.mensaje || 'Error al crear el trámite');
    }
  } catch (err: any) {
    setError(err.message || 'Error de conexión con el servidor');
    desbloquearEnvio();
  }
};

  /* ── Loading ── */
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Cargando información de la cita...</p>
      </div>
    );
  }

  /* ── Not found ── */
  if (!cita) {
    return (
      <div className={styles.container}>
        <div className={styles.grid_bg} aria-hidden />
        <div className={styles.inner}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <span className={styles.logoMark}><CarIcon /></span>
              <span className={styles.logoText}>Trans<strong>Meta</strong></span>
              <span className={styles.badgeAsesor}>Asesor</span>
            </div>
            <button
              type="button"
              className={styles.backBtn}
              onClick={handleVolver}
              disabled={submitting}
            >
              <ArrowLeftIcon /> Volver a Citas
            </button>
          </div>
          <div className={styles.errorAlert}>
            <AlertIcon /> Cita no encontrada
          </div>
        </div>
      </div>
    );
  }

const base = Number(cita.valorBase || 0);
const otros = Number(valorOtrosConceptos || 0);
const total = base + otros;

  return (
    <div className={styles.container}>
      <div className={styles.grid_bg} aria-hidden />
      <div className={styles.particles} aria-hidden>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles.particle} />
        ))}
      </div>

      <div className={styles.inner}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.logoMark}><CarIcon /></span>
            <span className={styles.logoText}>Trans<strong>Meta</strong></span>
            <span className={styles.badgeAsesor}>Asesor</span>
          </div>
          <Link href="/asesor/citas" className={styles.backBtn}>
            <ArrowLeftIcon /> Volver a Citas
          </Link>
        </div>

        {/* ── Page title ── */}
        <div className={styles.pageTitleRow}>
          <div className={styles.pageIcon}><ClipboardIcon /></div>
          <div>
            <h1 className={styles.pageTitle}>Completar Cita y Crear Trámite</h1>
            <p className={styles.pageSub}>Revisa la información y registra los valores del trámite</p>
          </div>
        </div>

        {/* ── Alerts ── */}
        {error && (
          <div className={styles.errorAlert}>
            <AlertIcon /> {error}
          </div>
        )}
        {success && (
          <div className={styles.successAlert}>
            <SuccessIcon /> {success}
          </div>
        )}

        {/* ── Info de la cita ── */}
        <div className={styles.infoCard}>
          <div className={styles.cardTitleRow}>
            <div className={styles.cardTitleIcon}><ClipboardIcon /></div>
            <h2 className={styles.cardTitle}>Información de la Cita</h2>
          </div>
          <div className={styles.infoGrid}>
            <div className={styles.infoChip}>
              <span className={styles.chipIcon}><HashIcon /></span>
              <div>
                <span className={styles.chipLabel}>ID Cita</span>
                <span className={styles.chipValue}>#{cita.idCita}</span>
              </div>
            </div>
            <div className={styles.infoChip}>
              <span className={styles.chipIcon}><UserIcon /></span>
              <div>
                <span className={styles.chipLabel}>Cliente</span>
                <span className={styles.chipValue}>{cita.cliente}</span>
              </div>
            </div>
            <div className={styles.infoChip}>
              <span className={styles.chipIcon}><PhoneIcon /></span>
              <div>
                <span className={styles.chipLabel}>Teléfono</span>
                <span className={styles.chipValue}>{cita.telefono}</span>
              </div>
            </div>
            <div className={styles.infoChip}>
              <span className={styles.chipIcon}><VehicleIcon /></span>
              <div>
                <span className={styles.chipLabel}>Vehículo</span>
                <span className={styles.chipValue}>{cita.vehiculo || 'No aplica'}</span>
              </div>
            </div>
            <div className={styles.infoChip}>
              <span className={styles.chipIcon}><TagIcon /></span>
              <div>
                <span className={styles.chipLabel}>Trámite</span>
                <span className={styles.chipValue}>{cita.tipoTramite}</span>
              </div>
            </div>
            <div className={styles.infoChip}>
              <span className={styles.chipIcon}><CalendarIcon /></span>
              <div>
                <span className={styles.chipLabel}>Fecha programada</span>
                <span className={styles.chipValue}>
                  {new Date(cita.fechaProgramada).toLocaleString('es-CO', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Formulario de valores ── */}
        <div className={styles.formCard}>
          <div className={styles.cardTitleRow}>
            <div className={styles.cardTitleIcon}><MoneyIcon /></div>
            <h2 className={styles.cardTitle}>Valor del Trámite</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.fieldsRow}>
              {/* Valor base (readonly) */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Valor Base</label>
                <div className={styles.fieldReadonly}>
                  <MoneyIcon />
                  <span>${base.toLocaleString()}</span>
                </div>
                <small className={styles.helperText}>Valor base del trámite (no editable)</small>
              </div>

              {/* Otros conceptos */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Valor Otros Conceptos</label>
                <div className={styles.fieldInputWrap}>
                  <span className={styles.fieldInputIcon}><PlusIcon /></span>
                  <input
                  type="number"
                  min="0"
                  value={valorOtrosConceptos}
                  onChange={e => setValorOtrosConceptos(parseFloat(e.target.value) || 0)}
                  placeholder="Ej: 50000"
                  className={styles.fieldInput}
                  disabled={submitting}
                />
                </div>
                <small className={styles.helperText}>Impuestos, certificados u otros costos adicionales</small>
              </div>
            </div>

            {/* Total */}
            <div className={styles.totalCard}>
              <div className={styles.totalLeft}>
                <MoneyIcon />
                <span className={styles.totalLabel}>Valor Total del Trámite</span>
              </div>
              <span className={styles.totalValue}>${total.toLocaleString()}</span>
            </div>

            {/* Buttons */}
            <div className={styles.btnGroup}>
              <button
                type="submit"
                disabled={submitting}
                className={styles.btnConfirm}
              >
                {submitting ? (
                  <>
                    <span className={styles.btnSpinner} /> Procesando...
                  </>
                ) : (
                  <>
                    <CheckIcon /> Completar y crear trámite
                  </>
                )}
              </button>
              <button
                type="button"
                className={styles.btnCancel}
                onClick={handleVolver}
                disabled={submitting}
              >
                <ArrowLeftIcon /> Cancelar
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}