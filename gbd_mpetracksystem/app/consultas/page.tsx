'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../CSS/Consultas/Consultas.module.css';
import { BACKEND_URL } from '@/lib/config';

/* ── Icons ── */
const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const MessageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const AlertCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [nuevaConsulta, setNuevaConsulta] = useState({
    asunto: '',
    mensaje: ''
  });

  const idCliente = typeof window !== 'undefined' ? sessionStorage.getItem('userCedula') : null;

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn || !idCliente) {
      router.push('/login');
      return;
    }
    cargarConsultas();
  }, []);

  const cargarConsultas = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/consultas/cliente/${idCliente}`);
      const data = await response.json();
      if (data.status === 'OK') {
        setConsultas(data.consultas || []);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar consultas');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNuevaConsulta(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    if (!nuevaConsulta.asunto.trim()) {
      setError('El asunto es requerido');
      setSubmitting(false);
      return;
    }
    if (!nuevaConsulta.mensaje.trim()) {
      setError('El mensaje es requerido');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/consultas/solicitar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cedula: idCliente,
          asunto: nuevaConsulta.asunto,
          mensaje: nuevaConsulta.mensaje
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'OK') {
        setSuccess('Consulta enviada exitosamente');
        setNuevaConsulta({ asunto: '', mensaje: '' });
        setShowModal(false);
        cargarConsultas();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.mensaje || 'Error al enviar consulta');
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
        <Link href="/dashboard" className={styles.backButton}>
          <ArrowLeftIcon /> Volver al Dashboard
        </Link>
        <h1>Mis Consultas</h1>
        <button onClick={() => setShowModal(true)} className={styles.nuevaConsultaBtn}>
          <SendIcon /> Nueva Consulta
        </button>
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}
      {success && <div className={styles.successAlert}>{success}</div>}

      {consultas.length === 0 ? (
        <div className={styles.emptyState}>
          <MessageIcon />
          <h3>No tienes consultas</h3>
          <p>Haz clic en "Nueva Consulta" para enviar un mensaje a soporte</p>
          <button onClick={() => setShowModal(true)} className={styles.emptyButton}>
            Nueva Consulta
          </button>
        </div>
      ) : (
        <div className={styles.consultasList}>
          {consultas.map((consulta) => (
            <div key={consulta.idConsulta} className={styles.consultaCard}>
              <div className={styles.cardHeader}>
                <div className={styles.headerInfo}>
                  <span className={`${styles.estadoBadge} ${getEstadoColor(consulta.estado)}`}>
                    {getEstadoTexto(consulta.estado)}
                  </span>
                  <span className={styles.fecha}>
                    {new Date(consulta.fechaCreacion).toLocaleString('es-CO', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <h3>{consulta.asunto}</h3>
              </div>
              
              <div className={styles.cardBody}>
                <div className={styles.mensajeCliente}>
                  <strong>Tú:</strong>
                  <p>{consulta.mensaje}</p>
                </div>
                
                {consulta.respuesta && (
                  <div className={styles.respuestaAdmin}>
                    <strong>📌 Soporte:</strong>
                    <p>{consulta.respuesta}</p>
                    {consulta.fechaRespuesta && (
                      <small>
                        Respondido el {new Date(consulta.fechaRespuesta).toLocaleString('es-CO')}
                      </small>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nueva Consulta */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Nueva Consulta</h2>
              <button onClick={() => setShowModal(false)} className={styles.closeBtn}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Asunto *</label>
                <input
                  type="text"
                  name="asunto"
                  value={nuevaConsulta.asunto}
                  onChange={handleChange}
                  placeholder="Ej: Problema con mi vehículo"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Mensaje *</label>
                <textarea
                  name="mensaje"
                  value={nuevaConsulta.mensaje}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describa su consulta en detalle..."
                  required
                />
              </div>
              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setShowModal(false)} className={styles.cancelBtn}>
                  Cancelar
                </button>
                <button type="submit" disabled={submitting} className={styles.sendBtn}>
                  {submitting ? 'Enviando...' : 'Enviar Consulta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}