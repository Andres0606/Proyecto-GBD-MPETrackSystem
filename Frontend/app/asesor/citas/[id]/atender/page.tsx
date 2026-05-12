'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../../../../CSS/Asesor/AtenderCita.module.css';
import { BACKEND_URL } from '@/lib/config';

/* ── Icons ── */
const CarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h12l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/>
    <circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>
  </svg>
);

const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z"/>
  </svg>
);

const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const TruckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="1" y="3" width="15" height="13" rx="1"/>
    <path d="M16 8h4l3 4v4h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
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

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="8"/>
    <line x1="12" y1="12" x2="12" y2="16"/>
  </svg>
);

export default function AtenderCitaPage() {
  const router = useRouter();
  const params = useParams();
  const idCita = params.id as string;

  const [cita, setCita] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');

  const cedulaAsesor =
    typeof window !== 'undefined' ? sessionStorage.getItem('userCedula') : null;

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const rol = sessionStorage.getItem('userRol');

    if (!isLoggedIn || !cedulaAsesor || rol !== '2') {
      router.push('/login');
      return;
    }

    cargarCita();
  }, []);

  const cargarCita = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/citas/pendientes/${cedulaAsesor}`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.citas) {
        const citaEncontrada = data.citas.find(
          (c: any) => c.idCita === parseInt(idCita)
        );
        setCita(citaEncontrada);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar la cita');
    } finally {
      setLoading(false);
    }
  };

// Generar horas disponibles según el día seleccionado
// Generar horas disponibles según el día seleccionado
const generarHorasDisponibles = () => {
  if (!fecha) return [];
  
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const fechaObj = new Date(anio, mes - 1, dia);
  const diaSemana = fechaObj.getDay();
  
  if (diaSemana === 0) return [];
  
  let horaInicio = 8;
  let horaFin = 17;
  
  if (diaSemana === 6) { // Sábado
    horaFin = 12;
  }
  
  const horas = [];
  // 👈 Cambiado: i <= horaFin para incluir la hora final
  for (let i = horaInicio; i <= horaFin; i++) {
    const horaStr = i.toString().padStart(2, '0');
    let hora12 = '';
    if (i === 12) {
      hora12 = '12:00 PM';
    } else if (i < 12) {
      hora12 = `${i}:00 AM`;
    } else {
      hora12 = `${i - 12}:00 PM`;
    }
    horas.push(
      <option key={i} value={`${horaStr}:00`}>
        {hora12}
      </option>
    );
  }
  return horas;
};
  const validarHorario = (fechaStr: string, horaStr: string): boolean => {
  if (!fechaStr || !horaStr) return false;
  
  // Crear fecha sin zona horaria
  const [anio, mes, dia] = fechaStr.split('-').map(Number);
  const fechaObj = new Date(anio, mes - 1, dia);
  const diaSemana = fechaObj.getDay();
  
  if (diaSemana === 0) {
    setError('No hay atención los domingos');
    return false;
  }
  
  const hora = parseInt(horaStr.split(':')[0]);
  
  if (diaSemana === 6) { // Sábado
    if (hora < 8 || hora >= 12) {
      setError('Los sábados la atención es de 8:00 AM a 12:00 PM');
      return false;
    }
  } else { // Lunes a Viernes
    if (hora < 8 || hora >= 17) {
      setError('El horario de atención es de 8:00 AM a 5:00 PM');
      return false;
    }
  }
  
  return true;
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError('');
    setSuccess('');

    if (!fecha) {
      setError('Seleccione una fecha para agendar la cita.');
      setSubmitting(false);
      return;
    }
    
    if (!hora) {
      setError('Seleccione una hora para agendar la cita.');
      setSubmitting(false);
      return;
    }
    
    if (!validarHorario(fecha, hora)) {
      setSubmitting(false);
      return;
    }
    
    const fechaProgramada = `${fecha}T${hora}`;

    try {
      const response = await fetch(`${BACKEND_URL}/api/citas/atender`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idCita: parseInt(idCita),
          idAsesor: parseInt(cedulaAsesor!),
          fechaProgramada,
        }),
      });

      const data = await response.json();

if (response.ok && data.status === 'OK') {
  setSuccess('Cita agendada exitosamente.');

  const telefonoLimpio = String(cita.telefono).replace(/\D/g, '');

  const telefonoWhatsapp = telefonoLimpio.startsWith('57')
    ? telefonoLimpio
    : `57${telefonoLimpio}`;

  const mensaje = `Hola ${cita.cliente}, tu cita para el trámite ${cita.tipoTramite} ha sido agendada.

Fecha: ${fecha}
Hora: ${hora}
Vehículo: ${cita.vehiculo}

Por favor confirma tu asistencia.`;

  const whatsappUrl = `https://wa.me/${telefonoWhatsapp}?text=${encodeURIComponent(mensaje)}`;

  window.open(whatsappUrl, '_blank');

setTimeout(() => router.push('/asesor/citas?tab=agendadas'), 2200);
} else {
  setError(data.mensaje || 'Error al agendar la cita');
}
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Estados de carga ── */
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Cargando información de la cita...</p>
      </div>
    );
  }

  if (!cita) {
    return (
      <div className={styles.notFound}>
        <p>No se encontró la cita #{idCita}</p>
        <Link href="/asesor/citas" className={styles.backLink}>
          <BackIcon /> Volver a citas
        </Link>
      </div>
    );
  }

  /* ── Page ── */
  return (
    <div className={styles.container}>
      <div className={styles.gridBg} aria-hidden />

      <div className={styles.inner}>

        {/* ── HEADER ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.logoMark}><CarIcon /></span>
            <span className={styles.logoText}>Trans<strong>Meta</strong></span>
            <span className={styles.badgeSection}>Atender Cita</span>
          </div>
          <Link href="/asesor/citas" className={styles.backButton}>
            <BackIcon />
            Volver a Citas
          </Link>
        </div>

        {/* ── ALERTS ── */}
        {error && (
          <div className={styles.errorAlert}>
            <AlertCircleIcon /> {error}
          </div>
        )}
        {success && (
          <div className={styles.successAlert}>
            {success}
          </div>
        )}

        {/* ── INFO DE LA CITA ── */}
        <div className={styles.citaCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderIco}><InfoIcon /></div>
            <div>
              <p className={styles.cardTitle}>Información de la solicitud</p>
              <p className={styles.cardSubtitle}>Cita #{idCita} · Pendiente de agendamiento</p>
            </div>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Cliente</span>
              <span className={`${styles.infoValue} ${styles.infoValueIco}`}>
                <UserIcon /> {cita.cliente}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Teléfono</span>
              <span className={`${styles.infoValue} ${styles.infoValueIco}`}>
                <PhoneIcon /> {cita.telefono}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Tipo de trámite</span>
              <span className={`${styles.infoValue} ${styles.infoValueIco}`}>
                <FileIcon /> {cita.tipoTramite}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Vehículo</span>
              <span className={`${styles.infoValue} ${styles.infoValueIco}`}>
                <TruckIcon /> {cita.vehiculo}
              </span>
            </div>
          </div>
        </div>

        {/* ── FORM ── */}
        <div className={styles.formCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderIco} style={{ background: 'rgba(46,125,50,0.09)', color: '#2E7D32' }}>
              <CalendarIcon />
            </div>
            <div>
              <p className={styles.cardTitle}>Programar fecha de atención</p>
              <p className={styles.cardSubtitle}>
                Horario: Lunes a Viernes 8:00 AM - 5:00 PM | Sábados 8:00 AM - 12:00 PM
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="fecha">
                Fecha
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIco}><CalendarIcon /></span>
                <input
                  id="fecha"
                  type="date"
                  className={styles.input}
                  value={fecha}
                  onChange={(e) => {
                    setFecha(e.target.value);
                    setHora('');
                    setError('');
                  }}
                  required
                  min={new Date().toISOString().slice(0, 10)}
                />
              </div>
            </div>

            {fecha && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="hora">
                  Hora
                </label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIco}><CalendarIcon /></span>
                  <select
                    id="hora"
                    className={styles.input}
                    value={hora}
                    onChange={(e) => {
                      setHora(e.target.value);
                      setError('');
                    }}
                    required
                  >
                    <option value="">Seleccionar hora</option>
                    {generarHorasDisponibles()}
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className={styles.btnSpinner} />
                  Agendando...
                </>
              ) : (
                <>
                  <SendIcon />
                  Confirmar Cita
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}