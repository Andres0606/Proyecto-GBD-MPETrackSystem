'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../CSS/Cliente/MisTramites.module.css';
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
const FileTextIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);
const ListIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
    <line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);
const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const ArchiveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="21 8 21 21 3 21 3 8"/>
    <rect x="1" y="3" width="22" height="5"/>
    <line x1="10" y1="12" x2="14" y2="12"/>
  </svg>
);

interface Tramite {
  idTramite: number;
  idCita: number;
  cliente: string;
  telefono: string;
  correo: string;
  vehiculo: string;
  tipoTramite: string;
  valorTramite: number;
  valorOtrosConceptos: number;
  estadoTramite: string;
  fechaCreacion: string;
  fechaCita: string;
  asesor: string;
}

export default function MisTramitesPage() {
  const router = useRouter();
  const [tramites, setTramites] = useState<Tramite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('todos');

  const cedulaCliente = typeof window !== 'undefined' ? sessionStorage.getItem('userCedula') : null;

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn || !cedulaCliente) {
      router.push('/login');
      return;
    }
    cargarTramites();
  }, []);

  const cargarTramites = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/tramite/cliente/${cedulaCliente}`);
      const data = await response.json();
      if (response.ok && data.status === 'OK') {
        setTramites(data.tramites || []);
      } else {
        setError(data.mensaje || 'Error al cargar trámites');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Activo':     return styles.estadoActivo;
      case 'En_Proceso': return styles.estadoEnProceso;
      case 'Finalizado': return styles.estadoFinalizado;
      default:           return styles.estadoDefault;
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'Activo':     return 'Activo';
      case 'En_Proceso': return 'En Proceso';
      case 'Finalizado': return 'Finalizado';
      default:           return estado;
    }
  };

  const tramitesFiltrados = tramites.filter(t =>
    filter === 'todos' ? true : t.estadoTramite === filter
  );

  const stats = {
    total:       tramites.length,
    activos:     tramites.filter(t => t.estadoTramite === 'Activo').length,
    enProceso:   tramites.filter(t => t.estadoTramite === 'En_Proceso').length,
    finalizados: tramites.filter(t => t.estadoTramite === 'Finalizado').length,
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Cargando tus trámites...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.inner}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.logoMark}><CarIcon /></span>
            <span className={styles.logoText}>Trans<strong>Meta</strong></span>
          </div>
          <Link href="/dashboard" className={styles.backButton}>
            <ArrowLeftIcon />
            Volver al Dashboard
          </Link>
        </div>

        {/* ── Page title ── */}
        <div className={styles.pageTitleRow}>
          <div className={styles.pageIcon}><FileTextIcon /></div>
          <div>
            <h1 className={styles.pageTitle}>Mis Trámites</h1>
            <p className={styles.pageSub}>Consulta el estado de todos tus trámites</p>
          </div>
        </div>

        {/* ── Error ── */}
        {error && <div className={styles.errorAlert}>{error}</div>}

        {/* ── Stats ── */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><ListIcon /></div>
            <div className={styles.statInfo}>
              <h3>{stats.total}</h3>
              <p>Total trámites</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconVerde}`}><CheckCircleIcon /></div>
            <div className={styles.statInfo}>
              <h3>{stats.activos}</h3>
              <p>Activos</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconDorado}`}><ClockIcon /></div>
            <div className={styles.statInfo}>
              <h3>{stats.enProceso}</h3>
              <p>En proceso</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconGris}`}><ArchiveIcon /></div>
            <div className={styles.statInfo}>
              <h3>{stats.finalizados}</h3>
              <p>Finalizados</p>
            </div>
          </div>
        </div>

        {/* ── Filtros ── */}
        <div className={styles.filters}>
          {[
            { key: 'todos',      label: `Todos (${stats.total})` },
            { key: 'Activo',     label: `Activos (${stats.activos})` },
            { key: 'En_Proceso', label: `En Proceso (${stats.enProceso})` },
            { key: 'Finalizado', label: `Finalizados (${stats.finalizados})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`${styles.filterBtn} ${filter === key ? styles.filterActive : ''}`}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Lista ── */}
        {tramitesFiltrados.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📋</span>
            <h3>No tienes trámites</h3>
            <p>Cuando solicites una cita y sea completada, tus trámites aparecerán aquí</p>
            <Link href="/citas/solicitar" className={styles.solicitarButton}>
              Solicitar una cita
            </Link>
          </div>
        ) : (
          <div className={styles.tramitesGrid}>
            {tramitesFiltrados.map((tramite) => (
              <div key={tramite.idTramite} className={styles.tramiteCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.tramiteId}>#{tramite.idTramite}</span>
                  <span className={`${styles.estadoBadge} ${getEstadoColor(tramite.estadoTramite)}`}>
                    {getEstadoTexto(tramite.estadoTramite)}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Trámite</span>
                    <span className={styles.infoValue}>{tramite.tipoTramite}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Vehículo</span>
                    <span className={styles.infoValue}>{tramite.vehiculo || 'No aplica'}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Valor total</span>
                    <span className={styles.valorTotal}>
                      ${(tramite.valorTramite + (tramite.valorOtrosConceptos || 0)).toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Asesor</span>
                    <span className={styles.infoValue}>{tramite.asesor || 'Por asignar'}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Fecha cita</span>
                    <span className={styles.infoValue}>
                      {tramite.fechaCita
                        ? new Date(tramite.fechaCita).toLocaleDateString('es-CO', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })
                        : 'Pendiente'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}