'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../CSS/Consultas/Consultas.module.css';
import { BACKEND_URL } from '@/lib/config';

/* ── Icons ── */
const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const MessageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const CarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h12l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>
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
}

export default function ConsultasPage() {
  const router = useRouter();
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const cedulaCliente = typeof window !== 'undefined' ? sessionStorage.getItem('userCedula') : null;

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn || !cedulaCliente) {
      router.push('/login');
      return;
    }
    cargarConsultas();
  }, []);

  const cargarConsultas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/consultas/cliente/${cedulaCliente}`);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asunto.trim() || !mensaje.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const response = await fetch(`${BACKEND_URL}/api/consultas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nDocumento: cedulaCliente,
          asunto,
          mensaje
        }),
      });

      const data = await response.json();
      if (response.ok && data.status === 'OK') {
        setSuccess('Consulta enviada correctamente');
        setAsunto('');
        setMensaje('');
        setIsModalOpen(false);
        cargarConsultas();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.mensaje || 'Error al enviar consulta');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setSubmitting(false);
    }
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
            <span className={styles.logoText}>Trans<strong>Meta</strong></span>
          </div>
          <Link href="/dashboard" className={styles.backButton}>
            <ArrowLeftIcon />
            Volver al Dashboard
          </Link>
        </div>

        {/* ── Title Row ── */}
        <div className={styles.titleRow}>
          <div className={styles.titleInfo}>
            <div className={styles.iconBox}><MessageIcon /></div>
            <div>
              <h1>Mis Consultas</h1>
              <p>Envía tus dudas y recibe atención personalizada</p>
            </div>
          </div>
          <button 
            className={styles.nuevaConsultaBtn}
            onClick={() => setIsModalOpen(true)}
          >
            <PlusIcon /> Nueva Consulta
          </button>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}
        {success && <div className={styles.successAlert}>{success}</div>}

        {consultas.length === 0 ? (
          <div className={styles.emptyState}>
            <MessageIcon />
            <h3>No tienes consultas registradas</h3>
            <p>Si tienes alguna duda sobre tus trámites, envíanos un mensaje.</p>
            <button className={styles.nuevaConsultaBtn} onClick={() => setIsModalOpen(true)}>
              Enviar mi primera consulta
            </button>
          </div>
        ) : (
          <div className={styles.consultasList}>
            {consultas.map((consulta) => (
              <div key={consulta.idConsulta} className={styles.consultaCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.headerTitleArea}>
                    <h3>{consulta.asunto}</h3>
                    <span className={styles.fecha}>
                      Enviada el {new Date(consulta.fechaCreacion).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`${styles.estadoBadge} ${
                    consulta.respuesta ? styles.estadoRespondida : styles.estadoPendiente
                  }`}>
                    {consulta.respuesta ? 'RESPONDIDA' : 'PENDIENTE'}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.mensajeCliente}>
                    <small>Tu mensaje</small>
                    <p>{consulta.mensaje}</p>
                  </div>

                  {consulta.respuesta && (
                    <div className={styles.respuestaAdmin}>
                      <small>Respuesta del Asesor</small>
                      <p>{consulta.respuesta}</p>
                      {consulta.fechaRespuesta && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <span className={styles.fecha}>
                            Recibida el {new Date(consulta.fechaRespuesta).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Modal Nueva Consulta ── */}
        {isModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2>Nueva Consulta</h2>
                <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>×</button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label>Asunto</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Duda sobre mi licencia" 
                    value={asunto}
                    onChange={(e) => setAsunto(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Mensaje</label>
                  <textarea 
                    rows={4} 
                    placeholder="Escribe aquí tu consulta detalladamente..."
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    required
                  />
                </div>
                
                <div className={styles.modalFooter}>
                  <button 
                    type="button" 
                    className={styles.cancelBtn} 
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className={styles.sendBtn}
                    disabled={submitting}
                  >
                    {submitting ? 'Enviando...' : 'Enviar Consulta'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}