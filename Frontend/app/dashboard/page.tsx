'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../CSS/dashboard/Dashboard.module.css';
import Link from 'next/link';  
import { BACKEND_URL } from '@/lib/config';
import Logo from '../components/Logo';

/* ── Icons ── */
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
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
const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const ArrowIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const VehicleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h12l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/>
    <circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>
  </svg>
);

/* ── Obtiene iniciales del nombre y apellido ── */
function getInitials(nombres: string, apellido: string): string {
  if (!nombres && !apellido) return 'U';
  const primeraLetra = nombres ? nombres.charAt(0).toUpperCase() : '';
  const segundaLetra = apellido ? apellido.charAt(0).toUpperCase() : '';
  return primeraLetra + segundaLetra || 'U';
}

/* ── Formatea la cédula con puntos ── */
function formatCedula(cedula: string): string {
  return cedula.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/* ── Obtiene el nombre completo ── */
function getNombreCompleto(nombres: string, apellido: string): string {
  if (!nombres && !apellido) return 'Usuario';
  return `${nombres || ''} ${apellido || ''}`.trim();
}

/* ── Obtiene el rol como texto ── */
function getRolNombre(rol: number): string {
  switch(rol) {
    case 1: return 'Cliente';
    case 2: return 'Asesor';
    case 3: return 'Administrador';
    default: return 'Usuario';
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState({ 
    cedula: '', 
    nombres: '', 
    apellido: '', 
    correo: '',
    rol: 1 
  });
  const [stats, setStats] = useState({ citas: 0, vehiculos: 0, tramites: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const cedula = sessionStorage.getItem('userCedula');
    const nombres = sessionStorage.getItem('userNombres');
    const apellido = sessionStorage.getItem('userApellido');
    const correo = sessionStorage.getItem('userCorreo');
    const rol = sessionStorage.getItem('userRol');

    if (!isLoggedIn || !cedula) {
      router.push('/login');
      return;
    }

    setUserData({ 
      cedula: cedula || '', 
      nombres: nombres || '', 
      apellido: apellido || '', 
      correo: correo || '',
      rol: rol ? parseInt(rol) : 1
    });

    // Fetch real stats from Backend
    const fetchStats = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/dashboard/stats/${cedula}`);
        const data = await res.json();
        if (res.ok) {
          setStats(data);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userCedula');
    sessionStorage.removeItem('userNombres');
    sessionStorage.removeItem('userApellido');
    sessionStorage.removeItem('userCorreo');
    sessionStorage.removeItem('userRol');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  const nombreCompleto = getNombreCompleto(userData.nombres, userData.apellido);
  const iniciales = getInitials(userData.nombres, userData.apellido);
  const rolNombre = getRolNombre(userData.rol);

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
        <div
        className={styles.headerLeft}
        onClick={() => router.push('/')}
      >
        <span className={styles.logoMark}><Logo size={28} /></span>
        <span className={styles.logoText}>MPE <strong>SYSTEM</strong></span>
      </div>
          <div className={styles.headerRight}>
            <span className={styles.headerBadge}>Panel de usuario</span>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <LogoutIcon />
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* ── Hero / Perfil ── */}
        <div className={styles.heroCard}>
          {/* Banner superior */}
          <div className={styles.heroBanner} />

          <div className={styles.heroBody}>
            {/* Avatar + badge de estado */}
            <div className={styles.avatarRow}>
              <div className={styles.avatar}>
                {iniciales}
              </div>
              <div className={styles.statusBadge}>
                <span className={styles.statusDot} />
                Cuenta activa
              </div>
            </div>

            {/* Nombre completo */}
            <h2 className={styles.heroName}>
              ¡Bienvenido, <span>{nombreCompleto}</span>!
            </h2>
            <p className={styles.heroSub}>Has iniciado sesión correctamente en MPE SYSTEM</p>

            {/* Chips de datos */}
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
                <strong>Rol:</strong>&nbsp;{rolNombre}
              </span>
            </div>

            {/* Resumen de actividad real */}
            <div className={styles.statsRow}>
              <div className={styles.statItem}>
                <span className={styles.statVal}>{stats.citas}</span>
                <span className={styles.statLab}>Citas agendadas</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statVal}>{stats.vehiculos}</span>
                <span className={styles.statLab}>Vehículos vinculados</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statVal}>{stats.tramites}</span>
                <span className={styles.statLab}>Trámites activos</span>
              </div>
            </div>
            </div>
            </div>



        {/* ── Módulos ── */}
<p className={styles.sectionTitle}>Módulos disponibles</p>

<div className={styles.grid}>

  {/* 1. Solicitar Cita */}
  <div className={styles.card}>
    <div className={styles.cardIcon}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    </div>
    <h3>Solicitar Cita</h3>
    <p>Agenda una cita para realizar tu trámite</p>
    <Link href="/citas/solicitar">
      <button className={styles.cardBtn}>
        Solicitar cita <ArrowIcon />
      </button>
    </Link>
  </div>

  {/* 2. Mis Citas */}
  <div className={styles.card}>
    <div className={styles.cardIcon}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    </div>
    <h3>Mis Citas</h3>
    <p>Consulta tus citas agendadas y pendientes</p>
    <Link href="/mis-citas">
      <button className={styles.cardBtn}>
        Ver mi agenda <ArrowIcon />
      </button>
    </Link>
  </div>

  {/* 3. Mis Trámites */}
  <div className={styles.card}>
    <div className={styles.cardIcon}>
      <FileIcon />
    </div>
    <h3>Mis Trámites</h3>
    <p>Gestiona y consulta el estado de tus trámites activos</p>
    <Link href="/mis-tramites">
      <button className={styles.cardBtn}>
        Ver trámites <ArrowIcon />
      </button>
    </Link>
  </div>

  {/* 4. Mis Vehículos */}
  <div className={styles.card}>
    <div className={styles.cardIcon}>
      <VehicleIcon />
    </div>
    <h3>Mis Vehículos</h3>
    <p>Registra y consulta los vehículos asociados a tu cuenta</p>
    <Link href="/vehiculos">
      <button className={styles.cardBtn}>
        Ver vehículos <ArrowIcon />
      </button>
    </Link>
  </div>

  {/* 5. Consultas */}
  <div className={styles.card}>
    <div className={styles.cardIcon}>
      <MailIcon />
    </div>
    <h3>Consultas</h3>
    <p>Envía y consulta tus mensajes con soporte</p>
    <Link href="/consultas">
      <button className={styles.cardBtn}>
        Mis Consultas <ArrowIcon />
      </button>
    </Link>
  </div>

  {/* 6. Perfil */}
  <div className={styles.card}>
    <div className={styles.cardIcon}>
      <UserIcon />
    </div>
    <h3>Perfil</h3>
    <p>Actualiza tu información personal y preferencias de cuenta</p>
    <Link href="/perfil">
      <button className={styles.cardBtn}>
        Editar perfil <ArrowIcon />
      </button>
    </Link>
  </div>

</div>
      </div>
    </div>
  );
}
