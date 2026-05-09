'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../../CSS/Asesor/Tramites.module.css';
import { BACKEND_URL } from '@/lib/config';

/* ── Icons ── */
const CarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h12l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/>
    <circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>
  </svg>
);

const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const DocumentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

/* ── Tipos ── */
interface Tramite {
  idTramite: number;
  idCita: number;
  idCliente?: number;
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
}

export default function AsesorTramitesPage() {
  const router = useRouter();
  const [tramites, setTramites] = useState<Tramite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('todos');

  const cedulaAsesor =
    typeof window !== 'undefined' ? sessionStorage.getItem('userCedula') : null;

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const rol = sessionStorage.getItem('userRol');

    if (!isLoggedIn || !cedulaAsesor || rol !== '2') {
      router.push('/login');
      return;
    }

    cargarTramites();
  }, []);

  const cargarTramites = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BACKEND_URL}/api/tramite/asesor/${cedulaAsesor}`
      );
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

  const getEstadoClass = (estado: string) => {
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

  const tramitesFiltrados = tramites.filter((t) => {
    if (filter === 'todos') return true;
    return t.estadoTramite === filter;
  });

  const stats = {
    total:      tramites.length,
    activos:    tramites.filter((t) => t.estadoTramite === 'Activo').length,
    enProceso:  tramites.filter((t) => t.estadoTramite === 'En_Proceso').length,
    finalizados:tramites.filter((t) => t.estadoTramite === 'Finalizado').length,
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Cargando trámites...</p>
      </div>
    );
  }

  /* ── Page ── */
  return (
    <div className={styles.container}>
      {/* Grid bg decorativo */}
      <div className={styles.gridBg} aria-hidden />

      <div className={styles.inner}>

        {/* ── HEADER ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.logoMark}><CarIcon /></span>
            <span className={styles.logoText}>Trans<strong>Meta</strong></span>
            <span className={styles.badgeSection}>Gestión de Trámites</span>
          </div>
          <div className={styles.headerRight}>
            <Link href="/dashboard-asesor" className={styles.backButton}>
              <BackIcon />
              Volver al Dashboard
            </Link>
          </div>
        </div>

        {/* ── ERROR ── */}
        {error && <div className={styles.errorAlert}>{error}</div>}

        {/* ── STATS ── */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><DocumentIcon /></div>
            <div className={styles.statInfo}>
              <h3>{stats.total}</h3>
              <p>Total Trámites</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(46,125,50,0.09)', color: '#2E7D32' }}>
              <ClockIcon />
            </div>
            <div className={styles.statInfo}>
              <h3 style={{ background: 'linear-gradient(135deg,#2E7D32,#66BB6A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {stats.activos}
              </h3>
              <p>Activos</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><RefreshIcon /></div>
            <div className={styles.statInfo}>
              <h3>{stats.enProceso}</h3>
              <p>En Proceso</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(120,120,130,0.09)', color: '#5a6578' }}>
              <CheckIcon />
            </div>
            <div className={styles.statInfo}>
              <h3 style={{ background: 'linear-gradient(135deg,#5a6578,#8a96a6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {stats.finalizados}
              </h3>
              <p>Finalizados</p>
            </div>
          </div>
        </div>

        {/* ── FILTROS ── */}
        <div>
          <p className={styles.sectionLabel}>Filtrar por estado</p>
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
        </div>

        {/* ── TABLA ── */}
        {tramitesFiltrados.length === 0 ? (
          <div className={styles.tramitesTable}>
            <div className={styles.emptyState}>
              <p>No hay trámites {filter === 'todos' ? 'registrados' : `con estado "${getEstadoTexto(filter)}"`}</p>
            </div>
          </div>
        ) : (
          <div className={styles.tramitesTable}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Trámite</th>
                  <th>Vehículo</th>
                  <th>Valor Total</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {tramitesFiltrados.map((tramite) => (
                  <tr key={tramite.idTramite}>
                    <td style={{ fontWeight: 700, color: '#7a92ae', fontSize: '0.78rem' }}>
                      #{tramite.idTramite}
                    </td>
                    <td>
                      <div className={styles.clienteInfo}>
                        <strong>{tramite.cliente}</strong>
                        <small>{tramite.telefono}</small>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{tramite.tipoTramite}</td>
                    <td style={{ color: '#3a5068' }}>{tramite.vehiculo}</td>
                    <td className={styles.valorTotal}>
                      ${(tramite.valorTramite + tramite.valorOtrosConceptos).toLocaleString('es-CO')}
                    </td>
                    <td>
                      <span className={`${styles.estadoBadge} ${getEstadoClass(tramite.estadoTramite)}`}>
                        {getEstadoTexto(tramite.estadoTramite)}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: '#7a92ae' }}>
                      {new Date(tramite.fechaCreacion).toLocaleDateString('es-CO', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td>
                      <Link
                        href={`/asesor/tramites/${tramite.idTramite}`}
                        className={styles.viewButton}
                      >
                        Ver detalles
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}