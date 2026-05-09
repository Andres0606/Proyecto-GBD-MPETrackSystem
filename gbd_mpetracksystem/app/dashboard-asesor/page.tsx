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
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const IdIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <circle cx="8" cy="12" r="2.5"/>
    <line x1="13" y1="10" x2="19" y2="10"/>
    <line x1="13" y1="14" x2="17" y2="14"/>
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
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

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const DocumentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const ArrowIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

/* ── Funciones auxiliares ── */
function getInitials(nombres: string, apellido: string): string {
  if (!nombres && !apellido) return 'A';
  const primeraLetra = nombres ? nombres.charAt(0).toUpperCase() : '';
  const segundaLetra = apellido ? apellido.charAt(0).toUpperCase() : '';
  return primeraLetra + segundaLetra || 'A';
}

function getNombreCompleto(nombres: string, apellido: string): string {
  if (!nombres && !apellido) return 'Asesor';
  return `${nombres || ''} ${apellido || ''}`.trim();
}

export default function DashboardAsesorPage() {
  const router = useRouter();
  const [userData, setUserData] = useState({ 
    cedula: '', 
    nombres: '', 
    apellido: '', 
    correo: '',
    rol: 2 
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    citasHoy: 0,
    citasPendientes: 0,
    tramitesActivos: 0,
    clientesAtendidos: 0
  });

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

    // Verificar que sea asesor (rol 2)
    const rolNum = rol ? parseInt(rol) : 0;
    if (rolNum !== 2) {
      // Si no es asesor, redirigir según su rol
      if (rolNum === 1) {
        router.push('/dashboard');
      } else if (rolNum === 3) {
        router.push('/dashboard-admin');
      } else {
        router.push('/login');
      }
      return;
    }

    setUserData({ 
      cedula: cedula || '', 
      nombres: nombres || '', 
      apellido: apellido || '', 
      correo: correo || '',
      rol: rolNum
    });
    
    cargarEstadisticas(cedula || '');
    setLoading(false);
  }, [router]);

const cargarEstadisticas = async (cedula: string) => {
  try {
    const API_URL = `${BACKEND_URL}`;

    const leerJsonSeguro = async (response: Response) => {
      if (!response.ok) return {};
      return await response.json();
    };

    const extraerLista = (data: any, posiblesCampos: string[]) => {
      if (Array.isArray(data)) return data;

      for (const campo of posiblesCampos) {
        if (Array.isArray(data?.[campo])) {
          return data[campo];
        }
      }

      return [];
    };

    const normalizar = (valor: any) =>
      String(valor || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    const obtenerCampo = (obj: any, campos: string[]) => {
      for (const campo of campos) {
        if (obj?.[campo] !== undefined && obj?.[campo] !== null) {
          return obj[campo];
        }
      }
      return null;
    };

    const esHoy = (valorFecha: any) => {
      if (!valorFecha) return false;

      const fechaTexto = String(valorFecha);
      const hoy = new Date().toISOString().slice(0, 10);

      return fechaTexto.includes(hoy);
    };

    const [resPendientes, resAgendadas, resTramites] = await Promise.all([
      fetch(`${API_URL}/api/citas/pendientes/${cedula}`),
      fetch(`${API_URL}/api/citas/agendadas/${cedula}`),
      fetch(`${API_URL}/api/tramite/asesor/${cedula}`)
    ]);

    const dataPendientes = await leerJsonSeguro(resPendientes);
    const dataAgendadas = await leerJsonSeguro(resAgendadas);
    const dataTramites = await leerJsonSeguro(resTramites);

    console.log('DATA PENDIENTES:', dataPendientes);
    console.log('DATA AGENDADAS:', dataAgendadas);
    console.log('DATA TRAMITES:', dataTramites);

    const citasPendientesLista = extraerLista(dataPendientes, [
      'citas',
      'pendientes',
      'items',
      'data'
    ]);

    const citasAgendadasLista = extraerLista(dataAgendadas, [
      'citas',
      'agendadas',
      'items',
      'data'
    ]);

    const tramitesLista = extraerLista(dataTramites, [
      'tramites',
      'items',
      'data'
    ]);

    const citasHoy = citasAgendadasLista.filter((cita: any) => {
      const fecha = obtenerCampo(cita, [
        'fechaProgramada',
        'fecha_programada',
        'FECHA_PROGRAMADA',
        'fecha',
        'FECHA',
        'fechaCita',
        'FECHA_CITA'
      ]);

      return esHoy(fecha);
    }).length;

    const tramitesActivos = tramitesLista.filter((tramite: any) => {
      const estado = normalizar(
        obtenerCampo(tramite, [
          'estado',
          'ESTADO',
          'estadoTramite',
          'ESTADO_TRAMITE'
        ])
      );

      return estado === 'activo' || estado === 'en_proceso' || estado === 'en proceso';
    }).length;

    const clientesFinalizados = new Set(
      tramitesLista
        .filter((tramite: any) => {
          const estado = normalizar(
            obtenerCampo(tramite, [
              'estado',
              'ESTADO',
              'estadoTramite',
              'ESTADO_TRAMITE'
            ])
          );

          return estado === 'finalizado';
        })
        .map((tramite: any) =>
          obtenerCampo(tramite, [
            'idCliente',
            'IDCLIENTE',
            'idcliente',
            'cedulaCliente',
            'CEDULA_CLIENTE',
            'clienteCedula'
          ])
        )
        .filter(Boolean)
    );

    setStats({
      citasHoy: citasHoy,
      citasPendientes: citasPendientesLista.length,
      tramitesActivos: tramitesActivos,
      clientesAtendidos: clientesFinalizados.size
    });

  } catch (error) {
    console.error('Error cargando estadísticas:', error);

    setStats({
      citasHoy: 0,
      citasPendientes: 0,
      tramitesActivos: 0,
      clientesAtendidos: 0
    });
  }
};

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

  return (
    <div className={styles.container}>
      <div className={styles.grid_bg} aria-hidden />
      <div className={styles.particles} aria-hidden>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles.particle} />
        ))}
      </div>

      <div className={styles.inner}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.logoMark}><CarIcon /></span>
            <span className={styles.logoText}>Trans<strong>Meta</strong></span>
            <span className={styles.badgeAsesor}>Asesor</span>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.headerBadge}>Panel de Asesor</span>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <LogoutIcon />
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Hero / Perfil */}
        <div className={styles.heroCard}>
          <div className={styles.heroBanner} />
          <div className={styles.heroBody}>
            <div className={styles.avatarRow}>
              <div className={styles.avatar}>{iniciales}</div>
              <div className={styles.statusBadge}>
                <span className={styles.statusDot} />
                Asesor Activo
              </div>
            </div>
            <h2 className={styles.heroName}>
              ¡Bienvenido, <span>{nombreCompleto}</span>!
            </h2>
            <p className={styles.heroSub}>Panel de gestión de trámites y citas</p>

            <div className={styles.infoRow}>
              <span className={styles.infoChip}>
                <IdIcon />
                <strong>Cédula:</strong>&nbsp;{userData.cedula}
              </span>
              {userData.correo && (
                <span className={styles.infoChip}>
                  <MailIcon />
                  <strong>Correo:</strong>&nbsp;{userData.correo}
                </span>
              )}
              <span className={styles.infoChip}>
                <ShieldIcon />
                <strong>Rol:</strong>&nbsp;Asesor de Trámites
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><CalendarIcon /></div>
            <div className={styles.statInfo}>
              <h3>{stats.citasHoy}</h3>
              <p>Citas hoy</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><UsersIcon /></div>
            <div className={styles.statInfo}>
              <h3>{stats.citasPendientes}</h3>
              <p>Citas pendientes</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><DocumentIcon /></div>
            <div className={styles.statInfo}>
              <h3>{stats.tramitesActivos}</h3>
              <p>Trámites activos</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><CheckIcon /></div>
            <div className={styles.statInfo}>
              <h3>{stats.clientesAtendidos}</h3>
              <p>Clientes atendidos</p>
            </div>
          </div>
        </div>

      {/* Módulos */}
<p className={styles.sectionTitle}>Módulos de gestión</p>
<div className={styles.grid}>
  <Link href="/asesor/citas" className={styles.card}>
    <div className={styles.cardIcon}><CalendarIcon /></div>
    <h3>Gestión de Citas</h3>
    <p>Visualiza y gestiona las citas asignadas</p>
    <span className={styles.cardLink}>Administrar citas <ArrowIcon /></span>
  </Link>

  <Link href="/asesor/tramites" className={styles.card}>
    <div className={styles.cardIcon}><DocumentIcon /></div>
    <h3>Trámites</h3>
    <p>Revisa y actualiza el estado de los trámites</p>
    <span className={styles.cardLink}>Ver trámites <ArrowIcon /></span>
  </Link>

  <Link href="/asesor/clientes" className={styles.card}>
    <div className={styles.cardIcon}><UsersIcon /></div>
    <h3>Clientes</h3>
    <p>Consulta información de tus clientes</p>
    <span className={styles.cardLink}>Ver clientes <ArrowIcon /></span>
  </Link>

  <Link href="/perfil" className={styles.card}>
    <div className={styles.cardIcon}><ShieldIcon /></div>
    <h3>Mi Perfil</h3>
    <p>Actualiza tu información personal</p>
    <span className={styles.cardLink}>Editar perfil <ArrowIcon /></span>
  </Link>

  {/* Consultas */}
  <Link href="/asesor/consultas" className={styles.card}>
  <div className={styles.cardIcon}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  </div>
  <h3>Consultas</h3>
  <p>Revisa y responde las consultas de los clientes</p>
  <span className={styles.cardLink}>Gestionar consultas <ArrowIcon /></span>
</Link>
</div>
      </div>
    </div>
  );
}