'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../CSS/dashboard/DashboardAsesor.module.css'
import { BACKEND_URL } from '@/lib/config';

/* ── Icons ── */
const CarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h12l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/>
    <circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>
  </svg>
);
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IdIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2.5"/><line x1="13" y1="10" x2="19" y2="10"/><line x1="13" y1="14" x2="17" y2="14"/>
  </svg>
);
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const DocumentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const ArrowIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12z"/>
  </svg>
);

/* ── Helpers ── */
function getInitials(n: string, a: string) {
  return (n?.charAt(0) || '') + (a?.charAt(0) || '') || 'A';
}

export default function DashboardAsesorPage() {
  const router = useRouter();
  const [userData, setUserData] = useState({ cedula: '', nombres: '', apellido: '', correo: '' });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ citasHoy: 0, citasPendientes: 0, tramitesActivos: 0, clientesAtendidos: 0 });

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const rol = sessionStorage.getItem('userRol');
    if (!isLoggedIn || rol !== '2') {
      router.push('/login');
      return;
    }
    setUserData({
      cedula: sessionStorage.getItem('userCedula') || '',
      nombres: sessionStorage.getItem('userNombres') || '',
      apellido: sessionStorage.getItem('userApellido') || '',
      correo: sessionStorage.getItem('userCorreo') || ''
    });
    cargarEstadisticas(sessionStorage.getItem('userCedula') || '');
    setLoading(false);
  }, [router]);

  const cargarEstadisticas = async (cedula: string) => {
    try {
      const [rP, rA, rT] = await Promise.all([
        fetch(`${BACKEND_URL}/api/citas/pendientes/${cedula}`),
        fetch(`${BACKEND_URL}/api/citas/agendadas/${cedula}`),
        fetch(`${BACKEND_URL}/api/tramite/asesor/${cedula}`)
      ]);
      const dP = await rP.json();
      const dA = await rA.json();
      const dT = await rT.json();

      const hoy = new Date().toISOString().slice(0, 10);
      const citasHoy = (dA.agendadas || []).filter((c: any) => c.fecha_programada?.includes(hoy)).length;
      const tramActivos = (dT.tramites || []).filter((t: any) => ['activo', 'en proceso'].includes(t.estado?.toLowerCase())).length;
      const clientesAt = new Set((dT.tramites || []).filter((t: any) => t.estado?.toLowerCase() === 'finalizado').map((t: any) => t.cedulaCliente)).size;

      setStats({
        citasHoy,
        citasPendientes: (dP.pendientes || []).length,
        tramitesActivos: tramActivos,
        clientesAtendidos: clientesAt
      });
    } catch (e) { console.error(e); }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    router.push('/login');
  };

  if (loading) return <div className={styles.loadingContainer}><div className={styles.spinner} /><p>Cargando panel...</p></div>;

  return (
    <div className={styles.container}>
      <div className={styles.grid_bg} aria-hidden />
      <div className={styles.particles} aria-hidden>
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className={styles.particle} />)}
      </div>

      <div className={styles.inner}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.logoMark}><CarIcon /></span>
            <span className={styles.logoText}>MPE <strong>SYSTEM</strong></span>
            <span className={styles.badgeAsesor}>Asesor</span>
          </div>
          <div className={styles.headerRight}>
            <button onClick={handleLogout} className={styles.logoutBtn}><LogoutIcon /> Cerrar sesión</button>
          </div>
        </div>

        {/* Hero */}
        <div className={styles.heroCard}>
          <div className={styles.heroBanner} />
          <div className={styles.heroBody}>
            <div className={styles.avatarRow}>
              <div className={styles.avatar}>{getInitials(userData.nombres, userData.apellido)}</div>
              <div className={styles.statusBadge}><span className={styles.statusDot} /> Asesor Activo</div>
            </div>
            <h2 className={styles.heroName}>¡Bienvenido, <span>{userData.nombres} {userData.apellido}</span>!</h2>
            <p className={styles.heroSub}>Gestión integral de trámites vehiculares y citas</p>
            <div className={styles.infoRow}>
              <span className={styles.infoChip}><IdIcon /> <strong>Cédula:</strong> {userData.cedula}</span>
              <span className={styles.infoChip}><MailIcon /> <strong>Correo:</strong> {userData.correo}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><CalendarIcon /></div>
            <div className={styles.statInfo}><h3>{stats.citasHoy}</h3><p>Citas hoy</p></div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><UsersIcon /></div>
            <div className={styles.statInfo}><h3>{stats.citasPendientes}</h3><p>Pendientes</p></div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><DocumentIcon /></div>
            <div className={styles.statInfo}><h3>{stats.tramitesActivos}</h3><p>Trámites</p></div>
          </div>
          <div className={stats.clientesAtendidos > 0 ? styles.statCard : styles.statCard}>
            <div className={styles.statIcon}><CheckIcon /></div>
            <div className={styles.statInfo}><h3>{stats.clientesAtendidos}</h3><p>Finalizados</p></div>
          </div>
        </div>

        {/* Módulos en orden 3 arriba, 2 abajo */}
        <p className={styles.sectionTitle}>Módulos de gestión</p>
        <div className={styles.gridCustom}>
          
          {/* Fila 1: Gestión de Citas, Trámites, Consultas */}
          <Link href="/asesor/citas" className={`${styles.card} ${styles.cardSpan2}`}>
            <div className={styles.cardIcon}><CalendarIcon /></div>
            <h3>Gestión de Citas</h3>
            <p>Visualiza y gestiona las citas asignadas hoy</p>
            <span className={styles.cardLink}>Administrar <ArrowIcon /></span>
          </Link>

          <Link href="/asesor/tramites" className={`${styles.card} ${styles.cardSpan2}`}>
            <div className={styles.cardIcon}><DocumentIcon /></div>
            <h3>Trámites</h3>
            <p>Revisa y actualiza el estado de los procesos</p>
            <span className={styles.cardLink}>Ver trámites <ArrowIcon /></span>
          </Link>

          <Link href="/asesor/consultas" className={`${styles.card} ${styles.cardSpan2}`}>
            <div className={styles.cardIcon}><ChatIcon /></div>
            <h3>Consultas</h3>
            <p>Responde dudas y consultas de tus clientes</p>
            <span className={styles.cardLink}>Gestionar <ArrowIcon /></span>
          </Link>

          {/* Fila 2: Clientes, Mi Perfil */}
          <Link href="/asesor/clientes" className={`${styles.card} ${styles.cardSpan3}`}>
            <div className={styles.cardIcon}><UsersIcon /></div>
            <h3>Clientes</h3>
            <p>Consulta la base de datos de tus clientes asignados</p>
            <span className={styles.cardLink}>Ver clientes <ArrowIcon /></span>
          </Link>

          <Link href="/perfil" className={`${styles.card} ${styles.cardSpan3}`}>
            <div className={styles.cardIcon}><ShieldIcon /></div>
            <h3>Mi Perfil</h3>
            <p>Actualiza tu información y configuración personal</p>
            <span className={styles.cardLink}>Editar perfil <ArrowIcon /></span>
          </Link>

        </div>
      </div>
    </div>
  );
}
