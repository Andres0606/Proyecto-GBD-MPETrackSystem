'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../../CSS/Asesor/Citas.module.css';
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
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"/>
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
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const VehicleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h12l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/>
    <circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>
  </svg>
);
const MoneyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const ArrowIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);
const EmptyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
  </svg>
);
const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const LocationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

interface CitaPendiente {
  idCita: number;
  cliente: string;
  telefono: string;
  correo: string;
  vehiculo: string;
  tipoTramite: string;
  valorBase: number;
  fechaSolicitud: string;
  esSuEspecialidad: number;
  sede?: string;
}

interface CitaAgendada {
  idCita: number;
  cliente: string;
  telefono: string;
  vehiculo: string;
  tipoTramite: string;
  fechaProgramada: string;
  sede?: string;
}

export default function AsesorCitasPage() {
  const router = useRouter();
  // Removed: 
  const [citasPendientes, setCitasPendientes] = useState<CitaPendiente[]>([]);
  const [citasAgendadas, setCitasAgendadas] = useState<CitaAgendada[]>([]);
  const [tab, setTab] = useState<'pendientes' | 'agendadas'>('pendientes');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [citaParaCancelar, setCitaParaCancelar] = useState<CitaAgendada | null>(null);
  const [cancelando, setCancelando] = useState(false);
  const [citaParaInasistencia, setCitaParaInasistencia] = useState<CitaAgendada | null>(null);
  const [marcandoInasistencia, setMarcandoInasistencia] = useState(false);

  useEffect(() => {
  const tabUrl = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('tab');

  if (tabUrl === 'agendadas') {
    setTab('agendadas');
  }
}, []);

  const cedulaAsesor =
    typeof window !== 'undefined' ? sessionStorage.getItem('userCedula') : null;

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const rol = sessionStorage.getItem('userRol');

    if (!isLoggedIn || !cedulaAsesor) { router.push('/login'); return; }
    if (rol !== '2') { router.push('/dashboard'); return; }

    cargarCitas();
  }, []);

  const cargarCitas = async () => {
    try {
      setLoading(true);

      const [resPend, resAg] = await Promise.all([
        fetch(`${BACKEND_URL}/api/citas/pendientes/${cedulaAsesor}`),
        fetch(`${BACKEND_URL}/api/citas/agendadas/${cedulaAsesor}`),
      ]);

      const dataPend = await resPend.json();
      const dataAg = await resAg.json();

      if (dataPend.status === 'OK') setCitasPendientes(dataPend.citas || []);
      if (dataAg.status === 'OK') setCitasAgendadas(dataAg.citas || []);
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

const cancelarCitaAgendada = (cita: CitaAgendada) => {
  setError('');
  setCitaParaCancelar(cita);
};

const confirmarCancelacionCita = async () => {
  if (!citaParaCancelar || cancelando) return;

  try {
    setCancelando(true);

    const response = await fetch(`${BACKEND_URL}/api/citas/cancelar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        idCita: citaParaCancelar.idCita,
        userCedula: cedulaAsesor // Para la auditoría
      }),
    });

    const data = await response.json();

    if (response.ok && data.status === 'OK') {
      setCitaParaCancelar(null);
      await cargarCitas();
    } else {
      setError(data.mensaje || 'Error al cancelar la cita');
    }
  } catch {
    setError('Error de conexión con el servidor');
  } finally {
    setCancelando(false);
  }
};

const marcarInasistenciaCita = (cita: CitaAgendada) => {
  setError('');
  setCitaParaInasistencia(cita);
};

const confirmarInasistenciaCita = async () => {
  if (!citaParaInasistencia || marcandoInasistencia) return;

  try {
    setMarcandoInasistencia(true);

    const response = await fetch(`${BACKEND_URL}/api/citas/inasistencia`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        idCita: citaParaInasistencia.idCita,
        userCedula: cedulaAsesor // Para la auditoría
      }),
    });

    const data = await response.json();

    if (response.ok && data.status === 'OK') {
      setCitaParaInasistencia(null);
      await cargarCitas();
    } else {
      setError(data.mensaje || 'Error al marcar inasistencia');
    }
  } catch {
    setError('Error de conexión con el servidor');
  } finally {
    setMarcandoInasistencia(false);
  }
};

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Cargando citas...</p>
      </div>
    );
  }

  const especialidad = citasPendientes.filter(c => c.esSuEspecialidad === 1).length;

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
            <span className={styles.logoText}>MPE <strong>SYSTEM</strong></span>
            <span className={styles.badgeAsesor}>Asesor</span>
          </div>
          <div className={styles.headerRight}>
            <Link href="/dashboard-asesor" className={styles.backBtn}>
              <ArrowLeftIcon />
              Volver al Dashboard
            </Link>
          </div>
        </div>

        {/* ── Page title ── */}
        <div className={styles.pageTitleRow}>
          <div className={styles.pageIcon}><CalendarIcon /></div>
          <div>
            <h1 className={styles.pageTitle}>Gestión de Citas</h1>
            <p className={styles.pageSub}>Administra y atiende las citas de tus clientes</p>
          </div>
        </div>

        {/* ── Error ── */}
        {error && <div className={styles.errorAlert}>{error}</div>}

        {/* ── Stats ── */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><ClockIcon /></div>
            <div className={styles.statInfo}>
              <h3>{citasPendientes.length}</h3>
              <p>Citas pendientes</p>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.statVerde}`}>
            <div className={`${styles.statIcon} ${styles.statIconVerde}`}><UsersIcon /></div>
            <div className={styles.statInfo}>
              <h3 className={styles.numVerde}>{especialidad}</h3>
              <p>De tu especialidad</p>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.statDorado}`}>
            <div className={`${styles.statIcon} ${styles.statIconDorado}`}><CalendarIcon /></div>
            <div className={styles.statInfo}>
              <h3 className={styles.numDorado}>{citasAgendadas.length}</h3>
              <p>Agendadas</p>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.statVerde}`}>
            <div className={`${styles.statIcon} ${styles.statIconVerde}`}><CheckCircleIcon /></div>
            <div className={styles.statInfo}>
              <h3 className={styles.numVerde}>0</h3>
              <p>Completadas hoy</p>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className={styles.tabsWrap}>
          <button
            className={`${styles.tabBtn} ${tab === 'pendientes' ? styles.tabOn : ''}`}
            onClick={() => setTab('pendientes')}
          >
            <ClockIcon />
            Pendientes
            <span className={`${styles.tabBadge} ${tab === 'pendientes' ? styles.tabBadgeOn : ''}`}>
              {citasPendientes.length}
            </span>
          </button>
          <button
            className={`${styles.tabBtn} ${tab === 'agendadas' ? styles.tabOn : ''}`}
            onClick={() => setTab('agendadas')}
          >
            <CalendarIcon />
            Mis Citas Agendadas
            <span className={`${styles.tabBadge} ${tab === 'agendadas' ? styles.tabBadgeOnVerde : ''}`}>
              {citasAgendadas.length}
            </span>
          </button>
        </div>

        {/* ── Pendientes ── */}
        {tab === 'pendientes' && (
          <>
            <p className={styles.sectionLabel}>Citas disponibles para atender</p>
            {citasPendientes.length === 0 ? (
              <div className={styles.emptyState}>
                <EmptyIcon />
                <p>No hay citas pendientes por el momento</p>
              </div>
            ) : (
              <div className={styles.citasGrid}>
                {citasPendientes.map(cita => (
                  <div
                    key={cita.idCita}
                    className={`${styles.citaCard} ${cita.esSuEspecialidad === 1 ? styles.cardEspecialidad : ''}`}
                  >
                    <div className={styles.cardHead}>
                      <span className={styles.tipoBadge}>{cita.tipoTramite}</span>
                      {cita.esSuEspecialidad === 1 && (
                        <span className={styles.espBadge}>Mi especialidad</span>
                      )}
                    </div>

                    <div className={styles.cardBody}>
                      <div className={styles.infoRow}>
                        <UserIcon /><strong>Cliente:</strong> {cita.cliente}
                      </div>
                      <div className={styles.infoRow}>
                        <PhoneIcon /><strong>Teléfono:</strong> {cita.telefono}
                      </div>
                      <div className={styles.infoRow}>
                        <MailIcon /><strong>Correo:</strong> {cita.correo}
                      </div>
                      <div className={styles.infoRow}>
                        <VehicleIcon /><strong>Vehículo:</strong> {cita.vehiculo || 'No aplica'}
                      </div>
                      <div className={styles.infoRow}>
                        <LocationIcon /><strong>Sede:</strong> {cita.sede || 'No asignada'}
                      </div>
                      <div className={styles.infoRow}>
                        <MoneyIcon /><strong>Valor base:</strong> ${cita.valorBase?.toLocaleString()}
                      </div>
                      <div className={styles.infoRow}>
                        <ClockIcon /><strong>Solicitada:</strong>{' '}
                        {new Date(cita.fechaSolicitud).toLocaleString('es-CO', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </div>
                    </div>

                    <div className={styles.cardFooter}>
                      <button
                        className={styles.btnAtender}
                        onClick={() => router.push(`/asesor/citas/${cita.idCita}/atender`)}
                      >
                        <CheckIcon /> Atender cita <ArrowIcon />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Agendadas ── */}
        {tab === 'agendadas' && (
          <>
            <p className={styles.sectionLabel}>Citas que has agendado</p>
            {citasAgendadas.length === 0 ? (
              <div className={styles.emptyState}>
                <EmptyIcon />
                <p>No tienes citas agendadas todavía</p>
              </div>
            ) : (
              <div className={styles.citasGrid}>
                {citasAgendadas.map(cita => (
                  <div key={cita.idCita} className={`${styles.citaCard} ${styles.cardAgendada}`}>
                    <div className={styles.cardHead}>
                      <span className={`${styles.tipoBadge} ${styles.tipoBadgeVerde}`}>{cita.tipoTramite}</span>
                      <span className={styles.agBadge}>Agendada</span>
                    </div>

                    <div className={styles.cardBody}>
                      <div className={styles.infoRow}>
                        <UserIcon /><strong>Cliente:</strong> {cita.cliente}
                      </div>
                      <div className={styles.infoRow}>
                        <PhoneIcon /><strong>Teléfono:</strong> {cita.telefono}
                      </div>
                      <div className={styles.infoRow}>
                        <VehicleIcon /><strong>Vehículo:</strong> {cita.vehiculo || 'No aplica'}
                      </div>
                      <div className={styles.infoRow}>
                        <LocationIcon /><strong>Sede:</strong> {cita.sede || 'No asignada'}
                      </div>
                      <div className={`${styles.infoRow} ${styles.infoRowVerde}`}>
                        <CalendarIcon /><strong>Programada:</strong>{' '}
                        {new Date(cita.fechaProgramada).toLocaleString('es-CO', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </div>
                    </div>

                  <div className={styles.cardFooter}>
                  <div className={styles.cardActions}>
                    <button
                      className={styles.btnCompletar}
                      onClick={() => router.push(`/asesor/citas/${cita.idCita}/completar`)}
                    >
                      <CheckIcon /> Completar trámite
                    </button>

                    <button
                    className={styles.btnCancelarCita}
                    onClick={() => cancelarCitaAgendada(cita)}
                  >
                    Cancelar cita
                  </button>
                  
                  <button
                    className={styles.btnInasistencia}
                    onClick={() => marcarInasistenciaCita(cita)}
                  >
                    <AlertIcon /> No Asistió
                  </button>
                  </div>
                </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </div>

      {citaParaCancelar && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <h3>Cancelar cita agendada</h3>
              <p>
                Confirma si deseas cancelar esta cita. La solicitud volverá a quedar disponible.
              </p>
            </div>

            <div className={styles.modalInfo}>
              <div>
                <span>Cliente</span>
                <strong>{citaParaCancelar.cliente}</strong>
              </div>

              <div>
                <span>Vehículo</span>
                <strong>{citaParaCancelar.vehiculo || 'No aplica'}</strong>
              </div>

              <div>
                <span>Trámite</span>
                <strong>{citaParaCancelar.tipoTramite}</strong>
              </div>

              <div>
                <span>Programada</span>
                <strong>
                  {new Date(citaParaCancelar.fechaProgramada).toLocaleString('es-CO', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </strong>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalBtnVolver}
                onClick={() => setCitaParaCancelar(null)}
                disabled={cancelando}
              >
                Volver
              </button>

              <button
                type="button"
                className={styles.modalBtnCancelar}
                onClick={confirmarCancelacionCita}
                disabled={cancelando}
              >
                {cancelando ? 'Cancelando...' : 'Cancelar cita'}
              </button>
            </div>
          </div>
        </div>
      )}

      {citaParaInasistencia && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <h3>Marcar como Inasistencia</h3>
              <p>
                El cliente recibirá un "strike". Si acumula 3, su cuenta será bloqueada. ¿Confirmas que el cliente no se presentó a su cita?
              </p>
            </div>

            <div className={styles.modalInfo}>
              <div>
                <span>Cliente</span>
                <strong>{citaParaInasistencia.cliente}</strong>
              </div>
              <div>
                <span>Trámite</span>
                <strong>{citaParaInasistencia.tipoTramite}</strong>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalBtnVolver}
                onClick={() => setCitaParaInasistencia(null)}
                disabled={marcandoInasistencia}
              >
                Volver
              </button>

              <button
                type="button"
                className={styles.modalBtnCancelar}
                style={{ background: 'rgba(230, 81, 0, 0.1)', color: '#c04000' }}
                onClick={confirmarInasistenciaCita}
                disabled={marcandoInasistencia}
              >
                {marcandoInasistencia ? 'Marcando...' : 'Sí, no asistió'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
