'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../../CSS/Asesor/Consultas.module.css';
import { BACKEND_URL } from '@/lib/config';

/* ── Icons ── */
const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);

const ReplyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    <polyline points="17 9 21 5 17 1"/>
  </svg>
);

const CarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h12l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>
  </svg>
);

const MessageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);

const HelpCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

interface Consulta {
  idConsulta: number;
  asunto: string;
  mensaje: string;
  fechaCreacion: string;
  respuesta: string | null;
  fechaRespuesta: string | null;
  estado: string;
  cliente: string;
  cedulaCliente: number;
  telefonoCliente: string;
  correoCliente: string;
}

export default function AsesorConsultasPage() {
  const router = useRouter();
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('todas');
  const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(null);
  const [respondiendo, setRespondiendo] = useState(false);
  const [respuestaText, setRespuestaText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const cedulaAsesor = typeof window !== 'undefined' ? sessionStorage.getItem('userCedula') : null;

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const rol = sessionStorage.getItem('userRol');
    
    if (!isLoggedIn || !cedulaAsesor || rol !== '2') {
      router.push('/login');
      return;
    }
    
    cargarConsultas();
  }, []);

  const cargarConsultas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/consultas/asesor/todas`);
      const data = await response.json();
      if (response.ok && data.status === 'OK') {
        setConsultas(data.consultas || []);
      } else {
        setError(data.mensaje || 'Error al cargar consultas');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleResponder = async () => {
    if (!respuestaText.trim()) {
      setError('Ingrese una respuesta');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      const response = await fetch(`${BACKEND_URL}/api/consultas/responder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idConsulta: selectedConsulta?.idConsulta,
          respuesta: respuestaText
        }),
      });

      const data = await response.json();
      if (response.ok && data.status === 'OK') {
        setSuccess('Respuesta enviada exitosamente');
        setRespondiendo(false);
        setSelectedConsulta(null);
        setRespuestaText('');
        cargarConsultas();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.mensaje || 'Error al enviar respuesta');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  const consultasFiltradas = filter === 'todas' 
    ? consultas 
    : consultas.filter(c => c.estado === filter);

  const estadisticas = {
    total: consultas.length,
    pendientes: consultas.filter(c => c.estado === 'PENDIENTE').length,
    respondidas: consultas.filter(c => c.estado === 'RESPONDIDA').length,
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
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
            <span className={styles.logoText}>MPE <strong>SYSTEM</strong></span>
          </div>
          <Link href="/dashboard-asesor" className={styles.backButton}>
            <ArrowLeftIcon />
            Volver al Dashboard
          </Link>
        </div>

        {/* ── Title Row ── */}
        <div className={styles.titleRow}>
          <div className={styles.iconBox}><MessageIcon /></div>
          <div>
            <h1>Consultas de Clientes</h1>
            <p>Gestiona y responde las inquietudes de los ciudadanos</p>
          </div>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}
        {success && <div className={styles.successAlert}>{success}</div>}

        {/* ── Estadísticas ── */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><HelpCircleIcon /></div>
            <div className={styles.statInfo}>
              <h3>{estadisticas.total}</h3>
              <p>Total</p>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.statPendiente}`}>
            <div className={styles.statIcon}><ClockIcon /></div>
            <div className={styles.statInfo}>
              <h3>{estadisticas.pendientes}</h3>
              <p>Pendientes</p>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.statRespondida}`}>
            <div className={styles.statIcon}><CheckCircleIcon /></div>
            <div className={styles.statInfo}>
              <h3>{estadisticas.respondidas}</h3>
              <p>Respondidas</p>
            </div>
          </div>
        </div>

        {/* ── Filtros ── */}
        <div className={styles.filters}>
          <button 
            className={`${styles.filterBtn} ${filter === 'todas' ? styles.filterActive : ''}`}
            onClick={() => setFilter('todas')}
          >
            Todas ({estadisticas.total})
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'PENDIENTE' ? styles.filterActive : ''}`}
            onClick={() => setFilter('PENDIENTE')}
          >
            Pendientes ({estadisticas.pendientes})
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'RESPONDIDA' ? styles.filterActive : ''}`}
            onClick={() => setFilter('RESPONDIDA')}
          >
            Respondidas ({estadisticas.respondidas})
          </button>
        </div>

        {/* ── Lista de consultas ── */}
        {consultasFiltradas.length === 0 ? (
          <div className={styles.emptyState}>
            <MessageIcon />
            <h3>No hay consultas registradas</h3>
            <p>No se encontraron consultas con el filtro seleccionado.</p>
          </div>
        ) : (
          <div className={styles.consultasList}>
            {consultasFiltradas.map((consulta) => (
              <div key={consulta.idConsulta} className={styles.consultaCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.headerInfo}>
                    <span className={`${styles.estadoBadge} ${
                      consulta.estado === 'RESPONDIDA' ? styles.estadoRespondida : styles.estadoPendiente
                    }`}>
                      {consulta.estado}
                    </span>
                    <span className={styles.fecha}>
                      {new Date(consulta.fechaCreacion).toLocaleDateString()}
                    </span>
                  </div>
                  <h3>{consulta.asunto}</h3>
                  <div className={styles.clienteInfo}>
                    <p>{consulta.cliente}</p>
                    <div className={styles.infoDivider} />
                    <p><PhoneIcon /> {consulta.telefonoCliente}</p>
                    <div className={styles.infoDivider} />
                    <p><MailIcon /> {consulta.correoCliente}</p>
                  </div>
                </div>
                
                <div className={styles.cardBody}>
                  <div className={styles.mensajeCliente}>
                    <small>Consulta del ciudadano</small>
                    <p>{consulta.mensaje}</p>
                  </div>
                  
                  {consulta.respuesta && (
                    <div className={styles.respuestaAdmin}>
                      <small>Tu respuesta</small>
                      <p>{consulta.respuesta}</p>
                      {consulta.fechaRespuesta && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <span className={styles.fecha}>
                            Respondido el {new Date(consulta.fechaRespuesta).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {consulta.estado === 'PENDIENTE' && (
                  <div className={styles.cardFooter}>
                    <button 
                      onClick={() => {
                        setSelectedConsulta(consulta);
                        setRespondiendo(true);
                      }}
                      className={styles.responderBtn}
                    >
                      <ReplyIcon /> Responder Consulta
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Modal para responder ── */}
        {respondiendo && selectedConsulta && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2>Responder Consulta</h2>
                <button onClick={() => setRespondiendo(false)} className={styles.closeBtn}>×</button>
              </div>
              <div className={styles.modalBody}>
                <strong>Consulta de {selectedConsulta.cliente}:</strong>
                <p>{selectedConsulta.mensaje}</p>
                
                <div className={styles.formGroup}>
                  <label>Tu respuesta</label>
                  <textarea
                    value={respuestaText}
                    onChange={(e) => setRespuestaText(e.target.value)}
                    rows={5}
                    placeholder="Escribe aquí tu respuesta detallada..."
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setRespondiendo(false)} className={styles.cancelBtn}>
                  Cancelar
                </button>
                <button type="button" onClick={handleResponder} disabled={submitting} className={styles.sendBtn}>
                  {submitting ? 'Enviando...' : 'Enviar Respuesta'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
