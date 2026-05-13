'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../CSS/dashboard-admin/Dashboard_admin.module.css';
import { BACKEND_URL } from '@/lib/config';
import Logo from '../components/Logo';

/* ── Icons ── */
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IdIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <circle cx="8" cy="12" r="2.5" />
    <line x1="13" y1="10" x2="19" y2="10" />
    <line x1="13" y1="14" x2="17" y2="14" />
  </svg>
);
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const UserPlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="22" y1="11" x2="16" y2="11" />
  </svg>
);
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const BarChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
    <line x1="2" y1="20" x2="22" y2="20" />
  </svg>
);
const ArrowIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

function formatCedula(cedula: string): string {
  if (!cedula) return '';
  return cedula.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Función para obtener el nombre completo
function getNombreCompleto(nombres: string, apellido: string, correo: string): string {
  if (nombres && apellido) {
    return `${nombres} ${apellido}`;
  }
  if (nombres) {
    return nombres;
  }
  if (correo) {
    const nombreParte = correo.split('@')[0];
    return nombreParte
      .split(/[._-]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
  return 'Administrador';
}

export default function DashboardAdminPage() {
  const router = useRouter();
  const [userData, setUserData] = useState({
    cedula: '',
    correo: '',
    rol: '',
    nombres: '',
    apellido: ''
  });
  const [stats, setStats] = useState({ asesores: 0, citas: 0, usuarios: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const cedula = sessionStorage.getItem('userCedula');
    const correo = sessionStorage.getItem('userCorreo');
    const rol = sessionStorage.getItem('userRol');
    const nombres = sessionStorage.getItem('userNombres');
    const apellido = sessionStorage.getItem('userApellido');

    if (!isLoggedIn || !cedula) {
      router.push('/login');
      return;
    }

    if (rol !== '3') {
      router.push('/dashboard');
      return;
    }

    setUserData({
      cedula: cedula || '',
      correo: correo || '',
      rol: 'Administrador',
      nombres: nombres || '',
      apellido: apellido || '',
    });

    // Fetch Admin Stats
    const fetchAdminStats = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/dashboard/admin-stats`);
        const data = await res.json();
        if (res.ok) {
          setStats(data);
        }
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userCedula');
    sessionStorage.removeItem('userCorreo');
    sessionStorage.removeItem('userRol');
    sessionStorage.removeItem('userNombres');
    sessionStorage.removeItem('userApellido');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Cargando panel de administrador...</p>
      </div>
    );
  }

  const nombreCompleto = getNombreCompleto(userData.nombres, userData.apellido, userData.correo);
  const iniciales = userData.nombres
    ? userData.nombres.charAt(0).toUpperCase()
    : (userData.apellido ? userData.apellido.charAt(0).toUpperCase() : userData.cedula.slice(0, 2));

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
            <span className={styles.logoMark}><Logo size={28} /></span>
            <span className={styles.logoText}>MPE <strong>SYSTEM</strong></span>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.adminBadge}>
              <ShieldIcon />
              Administrador
            </span>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <LogoutIcon />
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* ── Hero ── */}
        <div className={styles.heroCard}>
          <div className={styles.heroBanner} />

          <div className={styles.heroBody}>
            <div className={styles.avatarRow}>
              <div className={styles.avatar}>{iniciales}</div>
              <div className={styles.statusBadge}>
                <span className={styles.statusDot} />
                Sesión admin activa
              </div>
            </div>

            <h2 className={styles.heroName}>
              ¡Bienvenido, <span>{nombreCompleto}</span>!
            </h2>
            <p className={styles.heroSub}>Tienes acceso completo al panel de gestión de MPE SYSTEM</p>

            <div className={styles.infoRow}>
              <span className={styles.infoChip}>
                <IdIcon />
                <strong>Cédula:</strong>&nbsp;{formatCedula(userData.cedula)}
              </span>
              {userData.correo && (
                <span className={styles.infoChip}>
                  <MailIcon />
                  <strong>Correo:</strong>&nbsp;{userData.correo}
                </span>
              )}
              <span className={styles.infoChip}>
                <ShieldIcon />
                <strong>Rol:</strong>&nbsp;{userData.rol}
              </span>
            </div>

            <div className={styles.heroDivider} />

            <div className={styles.statsRow}>
              <div className={styles.statItem}>
                <div className={styles.statNumber}><span>{stats.asesores}</span></div>
                <div className={styles.statLabel}>Asesores registrados</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}><span>{stats.citas}</span></div>
                <div className={styles.statLabel}>Citas activas</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}><span>{stats.usuarios}</span></div>
                <div className={styles.statLabel}>Usuarios totales</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Módulos ── */}
        <p className={styles.sectionTitle}>Gestión del sistema</p>
        <div className={styles.grid}>

          <Link href="/reportes" className={styles.card}>
            <div className={styles.cardIcon} style={{ background: '#6366f1' }}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3>Inteligencia de Negocio</h3>
            <p>Reportes avanzados y métricas de rendimiento por sede.</p>
          </Link>

          <Link href="/auditoria" className={styles.card}>
            <div className={styles.cardIcon} style={{ background: '#1e293b' }}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3>Auditoría y Seguridad</h3>
            <p>Control de trazabilidad, logs de cambios y reportes de seguridad.</p>
          </Link>

          <div className={styles.card}>
            <div className={styles.cardIcon}><UsersIcon /></div>
            <h3>Consultar Asesores</h3>
            <p>Lista completa de todos los asesores registrados en el sistema</p>
            <Link href="/listar-asesores" className={styles.cardBtn}>
              Consultar Asesores <ArrowIcon />
            </Link>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}><UsersIcon /></div>
            <h3>Consultar Clientes</h3>
            <p>Gestiona y consulta la lista completa de clientes registrados</p>
            <Link href="/listar-clientes" className={styles.cardBtn}>
              Ver Clientes <ArrowIcon />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
