'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../../CSS/Asesor/Consultas.module.css';
import { BACKEND_URL } from '@/lib/config';

/* ── Icons ── */
const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const ReplyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    <polyline points="17 9 21 5 17 1"/>
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
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/consultas/asesor/todas`);
      const data = await response.json();
      if (data.status === 'OK') {
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

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/consultas/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idConsulta: selectedConsulta?.idConsulta,
          respuesta: respuestaText,
          idAsesor: parseInt(cedulaAsesor!)
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
      setError('Error de conexión con el servidor');
    } finally {
      setSubmitting(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch(estado) {
      case 'PENDIENTE': return styles.estadoPendiente;
      case 'RESPONDIDA': return styles.estadoRespondida;
      case 'CERRADA': return styles.estadoCerrada;
      default: return '';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch(estado) {
      case 'PENDIENTE': return 'Pendiente';
      case 'RESPONDIDA': return 'Respondida';
      case 'CERRADA': return 'Cerrada';
      default: return estado;
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
        <p>Cargando consultas...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/dashboard-asesor" className={styles.backButton}>
          <ArrowLeftIcon /> Volver al Dashboard
        </Link>
        <h1>Consultas de Clientes</h1>
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}
      {success && <div className={styles.successAlert}>{success}</div>}

      {/* Estadísticas */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>{estadisticas.total}</h3>
          <p>Total Consultas</p>
        </div>
        <div className={`${styles.statCard} ${styles.statPendiente}`}>
          <h3>{estadisticas.pendientes}</h3>
          <p>Pendientes</p>
        </div>
        <div className={`${styles.statCard} ${styles.statRespondida}`}>
          <h3>{estadisticas.respondidas}</h3>
          <p>Respondidas</p>
        </div>
      </div>

      {/* Filtros */}
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

      {/* Lista de consultas */}
      {consultasFiltradas.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No hay consultas {filter === 'todas' ? '' : filter.toLowerCase()}</p>
        </div>
      ) : (
        <div className={styles.consultasList}>
          {consultasFiltradas.map((consulta) => (
            <div key={consulta.idConsulta} className={styles.consultaCard}>
              <div className={styles.cardHeader}>
                <div className={styles.headerInfo}>
                  <span className={`${styles.estadoBadge} ${getEstadoColor(consulta.estado)}`}>
                    {getEstadoTexto(consulta.estado)}
                  </span>
                  <span className={styles.fecha}>
                    {new Date(consulta.fechaCreacion).toLocaleString('es-CO')}
                  </span>
                </div>
                <h3>{consulta.asunto}</h3>
                <div className={styles.clienteInfo}>
                  <p><strong>Cliente:</strong> {consulta.cliente}</p>
                  <p><strong>Teléfono:</strong> {consulta.telefonoCliente}</p>
                  <p><strong>Correo:</strong> {consulta.correoCliente}</p>
                </div>
              </div>
              
              <div className={styles.cardBody}>
                <div className={styles.mensajeCliente}>
                  <strong>Consulta del cliente:</strong>
                  <p>{consulta.mensaje}</p>
                </div>
                
                {consulta.respuesta && (
                  <div className={styles.respuestaAdmin}>
                    <strong>Respuesta (Soporte):</strong>
                    <p>{consulta.respuesta}</p>
                    {consulta.fechaRespuesta && (
                      <small>
                        Respondido el {new Date(consulta.fechaRespuesta).toLocaleString('es-CO')}
                      </small>
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
                    <ReplyIcon /> Responder
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal para responder */}
      {respondiendo && selectedConsulta && (
        <div className={styles.modalOverlay} onClick={() => setRespondiendo(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Responder Consulta</h2>
              <button onClick={() => setRespondiendo(false)} className={styles.closeBtn}>×</button>
            </div>
            <div className={styles.modalBody}>
              <p><strong>Cliente:</strong> {selectedConsulta.cliente}</p>
              <p><strong>Asunto:</strong> {selectedConsulta.asunto}</p>
              <p><strong>Consulta:</strong> {selectedConsulta.mensaje}</p>
              
              <div className={styles.formGroup}>
                <label>Respuesta *</label>
                <textarea
                  value={respuestaText}
                  onChange={(e) => setRespuestaText(e.target.value)}
                  rows={5}
                  placeholder="Escriba su respuesta aquí..."
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
  );
}