'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../CSS/Cliente/MisCitas.module.css';
import { BACKEND_URL } from '@/lib/config';

/* ── Icons ── */
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const CarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h12l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>
  </svg>
);

interface Cita {
  idCita: number;
  tipoTramite: string;
  placa: string | null;
  fechaCita: string | null;
  fechaSolicitud: string;
  asesor: string | null;
}

export default function MisCitasPage() {
  const router = useRouter();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cedulaCliente = typeof window !== 'undefined' ? sessionStorage.getItem('userCedula') : null;

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn || !cedulaCliente) {
      router.push('/login');
      return;
    }
    cargarCitas();
  }, []);

  const cargarCitas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/citas/cliente/${cedulaCliente}`);
      const data = await response.json();
      if (response.ok && data.status === 'OK') {
        setCitas(data.citas || []);
      } else {
        setError(data.mensaje || 'Error al cargar citas');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const fmtFecha = (f: string) => 
    new Date(f).toLocaleString('es-CO', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Cargando tu agenda...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        
        {/* Header */}
        <div className={styles.header}>
          <Link href="/dashboard" className={styles.backButton}>
            <ArrowLeftIcon /> Volver al Dashboard
          </Link>
          <div className={styles.titleRow}>
            <div className={styles.iconBox}><CalendarIcon /></div>
            <div>
              <h1>Mis Citas</h1>
              <p>Gestiona y consulta tus citas agendadas</p>
            </div>
          </div>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        {citas.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📅</div>
            <h3>No tienes citas registradas</h3>
            <p>Solicita una cita para iniciar tus trámites de tránsito</p>
            <Link href="/citas/solicitar" className={styles.solicitarBtn}>
              Solicitar Nueva Cita
            </Link>
          </div>
        ) : (
          <div className={styles.citasGrid}>
            {citas.map((cita) => (
              <div key={cita.idCita} className={`${styles.citaCard} ${!cita.fechaCita ? styles.citaPendiente : ''}`}>
                <div className={styles.cardStatus}>
                  {cita.fechaCita ? 'AGENDADA' : 'PENDIENTE DE ASIGNACIÓN'}
                </div>
                
                <div className={styles.cardHeader}>
                  <span className={styles.citaId}>Cita #{cita.idCita}</span>
                  <h3>{cita.tipoTramite}</h3>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.infoItem}>
                    <ClockIcon />
                    <div>
                      <small>Fecha y Hora</small>
                      <p>{cita.fechaCita ? fmtFecha(cita.fechaCita) : 'Pendiente por definir'}</p>
                    </div>
                  </div>

                  <div className={styles.infoItem}>
                    <UserIcon />
                    <div>
                      <small>Asesor Asignado</small>
                      <p>{cita.asesor || 'Asesor por asignar'}</p>
                    </div>
                  </div>

                  {cita.placa && (
                    <div className={styles.infoItem}>
                      <CarIcon />
                      <div>
                        <small>Vehículo</small>
                        <p>{cita.placa}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  <small>Solicitada el {new Date(cita.fechaSolicitud).toLocaleDateString()}</small>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
