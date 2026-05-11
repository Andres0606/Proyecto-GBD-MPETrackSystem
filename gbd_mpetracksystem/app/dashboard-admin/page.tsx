'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../CSS/dashboard-admin/Dashboard_admin.module.css';
import { BACKEND_URL } from '@/lib/config';

/* ── Icons ── */
const CarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h12l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/>
    <circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>
  </svg>
);
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IdIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <circle cx="8" cy="12" r="2.5"/>
    <line x1="13" y1="10" x2="19" y2="10"/>
    <line x1="13" y1="14" x2="17" y2="14"/>
  </svg>
);
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const UserPlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <line x1="19" y1="8" x2="19" y2="14"/>
    <line x1="22" y1="11" x2="16" y2="11"/>
  </svg>
);
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const BarChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6"  y1="20" x2="6"  y2="14"/>
    <line x1="2"  y1="20" x2="22" y2="20"/>
  </svg>
);
const ArrowIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
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
            <span className={styles.logoMark}><CarIcon /></span>
            <span className={styles.logoText}>Trans<strong>Meta</strong></span>
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
            <p className={styles.heroSub}>Tienes acceso completo al panel de gestión de TransMeta</p>

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

          <div className={styles.card}>
            <div className={styles.cardIcon}><UserPlusIcon /></div>
            <h3>Crear Asesor</h3>
            <p>Registra nuevos asesores en el sistema con sus datos y permisos</p>
            <Link href="/crear-asesor" className={styles.cardBtn}>
              Crear Asesor <ArrowIcon />
            </Link>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}><UsersIcon /></div>
            <h3>Ver Asesores</h3>
            <p>Lista completa de todos los asesores registrados en el sistema</p>
            <Link href="/listar-asesores" className={styles.cardBtn}>
              Ver Asesores <ArrowIcon />
            </Link>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}><BarChartIcon /></div>
            <h3>Reportes</h3>
            <p>Genera y consulta reportes de actividad y gestión del sistema</p>
            <button className={styles.cardBtn}>
              Ver Reportes <ArrowIcon />
            </button>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}><UsersIcon /></div>
            <h3>Ver Clientes</h3>
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