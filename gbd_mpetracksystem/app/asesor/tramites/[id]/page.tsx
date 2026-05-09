'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../../../CSS/Asesor/TramiteDetalle.module.css';
import { BACKEND_URL } from '@/lib/config';

/* ── Icons ── */
const ArrowLeftIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);
const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const AlertCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

interface TramiteDetalle {
  idTramite: number;
  idCita: number;
  idCliente?: number;
  cliente: string;
  telefono: string;
  correo: string;
  vehiculo: string;
  tipoTramite: string;
  valorTramite: number;
  valorOtrosConceptos: number;
  estadoTramite: string;
  fechaCreacion: string;
  fechaCita: string;
  // 👇 Nuevos campos para traspaso
  esDuenioRegistrado?: string;
  cedulaDuenioActual?: number;
  nombreDuenioActual?: string;
  apellidoDuenioActual?: string;
}

export default function TramiteDetallePage() {
  const router = useRouter();
  const params = useParams();
  const idTramite = params.id as string;

  const [tramite, setTramite] = useState<TramiteDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updating, setUpdating] = useState(false);
  const [estado, setEstado] = useState('');
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [estadoPendiente, setEstadoPendiente] = useState('');

  const cedulaAsesor =
    typeof window !== 'undefined' ? sessionStorage.getItem('userCedula') : null;

  const [puedeEditar, setPuedeEditar] = useState(false);
  const [camposAEditar, setCamposAEditar] = useState<string[]>([]);

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const rol = sessionStorage.getItem('userRol');
    if (!isLoggedIn || !cedulaAsesor || rol !== '2') {
      router.push('/login');
      return;
    }
    cargarDetalle();
  }, []);

  const cargarDetalle = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/tramite/asesor/${cedulaAsesor}`
      );
      const data = await response.json();
      if (data.status === 'OK' && data.tramites) {
        const encontrado = data.tramites.find(
          (t: any) => t.idTramite === parseInt(idTramite)
        );
        setTramite(encontrado);
        setEstado(encontrado?.estadoTramite || 'Activo');
        determinarCamposEdicion(encontrado?.tipoTramite);
      }
    } catch (error) {
      setError('Error al cargar el trámite');
    } finally {
      setLoading(false);
    }
  };

  const determinarCamposEdicion = (tipoTramite: string) => {
    const mapa: Record<string, string[]> = {
      'Matrícula/Registro': ['vehiculo'],
      'Cancelación Matrícula': ['cancelar'],
      'Rematrícula': ['reactivar'],
      'Inscripción Prenda': ['inscribirPrenda'],
      'Levantar Prenda': ['levantarPrenda'],
      'Cambio de Color': ['color'],
      'Cambio de Servicio': ['tipoServicio'],
      'Regrabar Motor': ['numMotor'],
      'Regrabar Chasis': ['numChasis'],
      'Cambio de Placas': ['placa'],
      'Traspaso': ['propietario'],
      'Cambio de Carrocería': ['clase'],
      'Duplicado de Placas': ['realizar'],
      'Duplicado Licencia': ['realizar'],
      'Traslado Matrícula': ['realizar'],
      'Radicado Matrícula': ['realizar'],
      'Transformación': ['realizar'],
      'Otros': ['realizar'],
    };
    if (mapa[tipoTramite]) {
      setCamposAEditar(mapa[tipoTramite]);
      setPuedeEditar(true);
    } else {
      setPuedeEditar(false);
    }
  };

  const ordenEstados: Record<string, number> = {
    Activo: 1,
    En_Proceso: 2,
    Finalizado: 3,
  };

  const actualizarEstadoConfirmado = async (nuevoEstado: string) => {
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/tramite/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idTramite: parseInt(idTramite), estado: nuevoEstado }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'OK') {
        setEstado(nuevoEstado);
        setTramite((prev) => prev ? { ...prev, estadoTramite: nuevoEstado } : null);

        setSuccess(
          nuevoEstado === 'Finalizado'
            ? 'Trámite finalizado correctamente.'
            : 'Trámite actualizado a En Proceso correctamente.'
        );

        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.mensaje || 'Error al actualizar estado');
      }
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setUpdating(false);
    }
  };

  const handleActualizarEstado = (nuevoEstado: string) => {
    setError('');
    setSuccess('');

    if (estado === nuevoEstado) return;

    if (ordenEstados[nuevoEstado] < ordenEstados[estado]) {
      setError('No puedes devolver el trámite a un estado anterior.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (estado === 'Finalizado') {
      setError('Este trámite ya está finalizado y no se puede modificar.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setEstadoPendiente(nuevoEstado);
    setMostrarConfirmacion(true);
  };

  const confirmarCambioEstado = async () => {
    const nuevoEstado = estadoPendiente;
    setMostrarConfirmacion(false);
    setEstadoPendiente('');
    await actualizarEstadoConfirmado(nuevoEstado);
  };

  const getEditarHref = () => {
    if (!tramite) return '#';
    switch (tramite.tipoTramite) {
case 'Traspaso':
      // 👇 Usar los datos del dueño actual que vienen de la cita
      const cedulaDuenioActual = tramite.cedulaDuenioActual || tramite.idCliente;
      const nombreDuenio = tramite.nombreDuenioActual || '';
      const apellidoDuenio = tramite.apellidoDuenioActual || '';
      const esRegistrado = tramite.esDuenioRegistrado || 'S';
      
      return `/asesor/tramites/${tramite.idTramite}/traspaso?placa=${tramite.vehiculo}&cedulaActual=${cedulaDuenioActual}&esDuenioRegistrado=${esRegistrado}&nombreDuenioActual=${nombreDuenio}&apellidoDuenioActual=${apellidoDuenio}&idCliente=${tramite.idCliente}`;
      case 'Matrícula/Registro':
        return `/asesor/tramites/${tramite.idTramite}/registrar-vehiculo?idCliente=${tramite.idCliente}&idTramite=${tramite.idTramite}`;
      case 'Cancelación Matrícula':
        return `/asesor/tramites/${tramite.idTramite}/cancelar-matricula?placa=${tramite.vehiculo}&idCliente=${tramite.idCliente}`;
      case 'Rematrícula':
        return `/asesor/tramites/${tramite.idTramite}/rematricular?placa=${tramite.vehiculo}&idCliente=${tramite.idCliente}`;
      case 'Inscripción Prenda':
      case 'Levantar Prenda':
        return `/asesor/tramites/${tramite.idTramite}/gestionar-prenda?placa=${tramite.vehiculo}&tipo=${tramite.tipoTramite === 'Inscripción Prenda' ? 'inscribir' : 'levantar'}`;
      case 'Duplicado de Placas':
      case 'Duplicado Licencia':
      case 'Traslado Matrícula':
      case 'Radicado Matrícula':
      case 'Transformación':
          return `/asesor/tramites/${tramite.idTramite}/tramite-simple?tipo=${encodeURIComponent(tramite.tipoTramite)}&placa=${encodeURIComponent(tramite.vehiculo || '')}`;
      case 'Otros':
        return `/asesor/tramites/${tramite.idTramite}/tramite-simple?tipo=${tramite.tipoTramite}`;
      default:
        return `/asesor/tramites/${tramite.idTramite}/editar-vehiculo?campos=${camposAEditar.join(',')}&placa=${tramite.vehiculo}`;
    }
  };

  const getEditarLabel = () => {
    if (!tramite) return 'Realizar acción';
    const labels: Record<string, string> = {
      'Traspaso': 'Realizar Traspaso',
      'Matrícula/Registro': 'Registrar Vehículo',
      'Cancelación Matrícula': 'Cancelar Matrícula',
      'Rematrícula': 'Realizar Rematrícula',
      'Inscripción Prenda': 'Inscribir Prenda',
      'Levantar Prenda': 'Levantar Prenda',
    };
    return labels[tramite.tipoTramite] ?? 'Realizar Trámite';
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Cargando trámite...</p>
      </div>
    );
  }

  if (!tramite) {
    return (
      <div className={styles.container}>
        <div className={styles.inner}>
          <div className={styles.errorAlert}>
            <AlertCircleIcon /> Trámite no encontrado
          </div>
          <Link href="/asesor/tramites" className={styles.backLink}>
            <ArrowLeftIcon /> Volver a trámites
          </Link>
        </div>
      </div>
    );
  }

  const valorTotal = tramite.valorTramite + (tramite.valorOtrosConceptos || 0);

  const getEstadoClass = (e: string) => {
    if (e === 'Activo') return styles.estadoActivo;
    if (e === 'En_Proceso') return styles.estadoEnProceso;
    if (e === 'Finalizado') return styles.estadoFinalizado;
    return '';
  };

  const fmtFecha = (f: string) =>
    new Date(f).toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  return (
    <div className={styles.container}>
      <div className={styles.inner}>

        {/* Header */}
        <div className={styles.header}>
          <Link href="/asesor/tramites" className={styles.backButton}>
            <ArrowLeftIcon /> Volver a Trámites
          </Link>
          <h1>
            Trámite&nbsp;<span>#{tramite.idTramite}</span>
          </h1>
        </div>

        {/* Alertas */}
        {error && (
          <div className={styles.errorAlert}>
            <AlertCircleIcon /> {error}
          </div>
        )}
        {success && (
          <div className={styles.successAlert}>
            <CheckCircleIcon /> {success}
          </div>
        )}

        {/* Información del trámite */}
        <div className={styles.detalleCard}>
          <h2>Información del Trámite</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>ID Trámite</span>
              <span className={styles.infoValue}>#{tramite.idTramite}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>ID Cita</span>
              <span className={styles.infoValue}>#{tramite.idCita}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Estado</span>
              <span className={`${styles.estadoBadge} ${getEstadoClass(estado)}`}>
                {estado.replace('_', ' ')}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Fecha Creación</span>
              <span className={styles.infoValue}>{fmtFecha(tramite.fechaCreacion)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Fecha Cita</span>
              <span className={styles.infoValue}>{fmtFecha(tramite.fechaCita)}</span>
            </div>
          </div>
        </div>

        {/* Información del cliente */}
        <div className={styles.detalleCard}>
          <h2>Información del Cliente</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Nombre</span>
              <span className={styles.infoValue}>{tramite.cliente}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Teléfono</span>
              <span className={styles.infoValue}>{tramite.telefono}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Correo</span>
              <span className={styles.infoValue}>{tramite.correo}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Vehículo</span>
              <span className={styles.infoValue}>{tramite.vehiculo || 'No aplica'}</span>
            </div>
          </div>
        </div>

        {/* 👇 Información adicional para Traspaso */}
        {tramite.tipoTramite === 'Traspaso' && tramite.esDuenioRegistrado === 'N' && (
          <div className={styles.detalleCard}>
            <h2>Información del Dueño Actual</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Cédula</span>
                <span className={styles.infoValue}>{tramite.cedulaDuenioActual || 'No registrada'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Nombre Completo</span>
                <span className={styles.infoValue}>
                  {tramite.nombreDuenioActual || ''} {tramite.apellidoDuenioActual || ''}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Estado</span>
                <span className={styles.infoValue}>No registrado en el sistema</span>
              </div>
            </div>
          </div>
        )}

        {/* Información del trámite solicitado */}
        <div className={styles.detalleCard}>
          <h2>Detalle Económico</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Tipo Trámite</span>
              <span className={styles.infoValue}>{tramite.tipoTramite}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Valor Base</span>
              <span className={styles.infoValue}>${tramite.valorTramite.toLocaleString('es-CO')}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Otros Conceptos</span>
              <span className={styles.infoValue}>${(tramite.valorOtrosConceptos || 0).toLocaleString('es-CO')}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Valor Total</span>
              <span className={styles.valorTotal}>${valorTotal.toLocaleString('es-CO')}</span>
            </div>
          </div>
        </div>

        {/* Acción del trámite */}
        {puedeEditar && estado !== 'Finalizado' && (
          <div className={styles.detalleCard}>
            <h2><EditIcon /> Gestionar Trámite</h2>
            <p className={styles.editarButtonDesc}>
              Este trámite de tipo <strong>{tramite.tipoTramite}</strong> requiere acción sobre: {camposAEditar.join(', ')}.
            </p>
            <Link href={getEditarHref()} className={styles.editarButton}>
              {getEditarLabel()} <ArrowRightIcon />
            </Link>
          </div>
        )}

        {puedeEditar && estado === 'Finalizado' && (
          <div className={styles.detalleCard}>
            <h2><CheckCircleIcon /> Trámite finalizado</h2>
            <p className={styles.editarButtonDesc}>
              Este trámite ya fue finalizado. No se pueden realizar más acciones sobre este registro.
            </p>
          </div>
        )}

        {/* Actualizar estado */}
        <div className={styles.detalleCard}>
          <h2>Actualizar Estado</h2>
          <div className={styles.estadoSelector}>
            {(['Activo', 'En_Proceso', 'Finalizado'] as const).map((e) => (
              <button
                key={e}
                className={`${styles.estadoBtn} ${estado === e ? getEstadoClass(e) : ''}`}
                onClick={() => handleActualizarEstado(e)}
                disabled={
                  updating ||
                  estado === e ||
                  ordenEstados[e] < ordenEstados[estado] ||
                  estado === 'Finalizado'
                }
              >
                {e === 'En_Proceso' ? 'En Proceso' : e}
              </button>
            ))}
          </div>
          <p className={styles.estadoHelper}>
            Actualiza el estado según el progreso del trámite
          </p>
        </div>

        <Link href="/asesor/tramites" className={styles.backLink}>
          <ArrowLeftIcon /> Volver a trámites
        </Link>

        {mostrarConfirmacion && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalBox}>
              <div className={styles.modalIcon}>
                <AlertCircleIcon />
              </div>
              <h3>
                {estadoPendiente === 'Finalizado'
                  ? 'Finalizar trámite'
                  : 'Pasar trámite a En Proceso'}
              </h3>
              <p>
                {estadoPendiente === 'Finalizado'
                  ? 'Estás a punto de marcar este trámite como finalizado. Después de hacerlo no podrás volver a cambiar su estado.'
                  : 'Estás a punto de pasar este trámite a En Proceso. Después no podrás devolverlo a Activo.'}
              </p>
              <div className={styles.modalActions}>
                <button
                  className={styles.btnCancelar}
                  onClick={() => {
                    setMostrarConfirmacion(false);
                    setEstadoPendiente('');
                  }}
                >
                  Cancelar
                </button>
                <button
                  className={styles.btnConfirmar}
                  onClick={confirmarCambioEstado}
                >
                  {estadoPendiente === 'Finalizado' ? 'Sí, finalizar' : 'Sí, pasar a En Proceso'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}