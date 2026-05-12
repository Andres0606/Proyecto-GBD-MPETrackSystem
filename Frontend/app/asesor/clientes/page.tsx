'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../../CSS/Asesor/clientes.module.css';
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
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
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
const ClipboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
    <rect x="9" y="3" width="6" height="4" rx="1"/>
  </svg>
);

const EmptyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <line x1="15" y1="11" x2="21" y2="11"/>
  </svg>
);
const WspIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.851L.057 23.882c-.073.277.178.528.455.455l6.031-1.475A11.946 11.946 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.946 0-3.77-.502-5.35-1.383l-.384-.222-3.981.973.994-3.884-.243-.398A9.964 9.964 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
  </svg>
);

interface Cliente {
  cedula: string;
  nombres: string;
  apellido: string;
  telefono: string;
  correo: string;
  totalTramites: number;
}

function getInitials(nombres: string, apellido: string): string {
  const n = nombres?.trim().charAt(0).toUpperCase() || '';
  const a = apellido?.trim().charAt(0).toUpperCase() || '';
  return `${n}${a}`;
}

export default function AsesorClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const cedulaAsesor =
    typeof window !== 'undefined' ? sessionStorage.getItem('userCedula') : null;

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const rol = sessionStorage.getItem('userRol');
    if (!isLoggedIn || rol !== '2') { router.push('/login'); return; }
    cargarClientes();
  }, []);

const cargarClientes = async () => {
  try {
    setLoading(true);
    setError('');

    const cedula = sessionStorage.getItem('userCedula');

    if (!cedula) {
      router.push('/login');
      return;
    }

    const response = await fetch(
      `${BACKEND_URL}/api/clientes/asesor/${cedula}`
    );

    const data = await response.json();

    if (response.ok && (data.status === 'OK' || data.items || data.clientes)) {
      const lista = data.clientes || data.items || [];

      const clientesNormalizados: Cliente[] = lista.map((c: any) => ({
        cedula: String(c.cedula ?? c.CEDULA ?? c.NUMERODOCUMENTO ?? c.idCliente ?? c.IDCLIENTE ?? ''),
        nombres: c.nombres ?? c.NOMBRES ?? c.nombre ?? c.NOMBRE ?? '',
        apellido: c.apellido ?? c.APELLIDO ?? '',
        telefono: String(c.telefono ?? c.TELEFONO ?? ''),
        correo: c.correo ?? c.CORREO ?? '',
        totalTramites: Number(
          c.totalTramites ??
          c.totaltramites ??
          c.TOTALTRAMITES ??
          c.total_tramites ??
          c.CANTIDAD_TRAMITES ??
          c.cantidadTramites ??
          0
        ),
      }));

      setClientes(clientesNormalizados);
    } else {
      setError(data.mensaje || 'Error al cargar los clientes');
    }
  } catch {
    setError('Error de conexión con el servidor');
  } finally {
    setLoading(false);
  }
};


  /* Filtro local en tiempo real */
  const clientesFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return clientes;
    return clientes.filter(c =>
      `${c.nombres} ${c.apellido}`.toLowerCase().includes(q) ||
      c.cedula.includes(q) ||
      c.telefono?.includes(q) ||
      c.correo?.toLowerCase().includes(q)
    );
  }, [busqueda, clientes]);


  /* ── Loading ── */
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Cargando clientes...</p>
      </div>
    );
  }

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
          <div className={styles.headerRight}>
            <Link href="/dashboard-asesor" className={styles.backBtn}>
              <ArrowLeftIcon /> Volver al Dashboard
            </Link>
          </div>
        </div>

        {/* ── Page title ── */}
        <div className={styles.pageTitleRow}>
          <div className={styles.pageIcon}><UsersIcon /></div>
          <div>
            <h1 className={styles.pageTitle}>Mis Clientes</h1>
            <p className={styles.pageSub}>Clientes atendidos a través de tus trámites</p>
          </div>
        </div>

        {/* ── Error ── */}
        {error && <div className={styles.errorAlert}>{error}</div>}

       

        {/* ── Search ── */}
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}><SearchIcon /></span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar por nombre, cédula, teléfono o correo…"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          {busqueda && (
            <button className={styles.searchClear} onClick={() => setBusqueda('')} aria-label="Limpiar">
              <XIcon />
            </button>
          )}
        </div>

        {/* Results label */}
        {busqueda && (
          <p className={styles.resultsLabel}>
            {clientesFiltrados.length} resultado{clientesFiltrados.length !== 1 ? 's' : ''} para &quot;{busqueda}&quot;
          </p>
        )}

        {/* ── Clientes ── */}
        {clientesFiltrados.length === 0 ? (
          <div className={styles.emptyState}>
            <EmptyIcon />
            <h3>{busqueda ? 'Sin resultados' : 'Aún no tienes clientes'}</h3>
            <p>
              {busqueda
                ? 'Intenta con otro nombre, cédula, teléfono o correo.'
                : 'Los clientes aparecerán aquí una vez que atiendas trámites.'}
            </p>
          </div>
        ) : (
          <div className={styles.clientesGrid}>
            {clientesFiltrados.map(cliente => (
              <div key={cliente.cedula} className={styles.clienteCard}>

                {/* Header — avatar + nombre + badge */}
                <div className={styles.cardHeader}>
                  <div className={styles.avatar}>
                    {getInitials(cliente.nombres, cliente.apellido)}
                  </div>
                  <h3 className={styles.cardName}>
                    {cliente.nombres} {cliente.apellido}
                  </h3>
                  <span className={styles.tramitesBadge}>
                    <ClipboardIcon />
                    {cliente.totalTramites ?? 0} trámite{(cliente.totalTramites ?? 0) !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Body — datos */}
                <div className={styles.cardBody}>
                  <div className={styles.infoRow}>
                    <PhoneIcon />
                    <span className={styles.infoLabel}>Teléfono:</span>
                    <span className={styles.infoValue}>{cliente.telefono || 'No registrado'}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <MailIcon />
                    <span className={styles.infoLabel}>Correo:</span>
                    <span className={styles.infoValue}>{cliente.correo || 'No registrado'}</span>
                  </div>
                </div>

                {/* Footer — acciones */}
                <div className={styles.cardFooter}>
                    {cliente.telefono && cliente.telefono !== 'No registrado' ? (
                        <a
                        href={`https://wa.me/57${cliente.telefono.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.btnWsp}
                        >
                        <WspIcon /> Contactar por WhatsApp
                        </a>
                    ) : (
                        <button className={styles.btnWsp} disabled>
                        <WspIcon /> Sin WhatsApp
                        </button>
                    )}
                    </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}