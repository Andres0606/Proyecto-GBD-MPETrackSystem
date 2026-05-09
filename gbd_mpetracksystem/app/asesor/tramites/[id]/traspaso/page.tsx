'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import RegistrarClienteForm from '../../../../components/RegistrarClienteForm';
import RegistrarVehiculoForm from '../../../../components/RegistrarVehiculoForm';
import styles from '../../../../CSS/Asesor/Traspaso.module.css';
import { BACKEND_URL } from '@/lib/config';

/* ── Icons ── */
const CarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h12l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/>
    <circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>
  </svg>
);
const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const ArrowsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="17 1 21 5 17 9"/>
    <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <polyline points="7 23 3 19 7 15"/>
    <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);
const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default function TraspasoPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const idTramite = params.id as string;
  const placaParam = searchParams.get('placa') || '';
  const cedulaActual = searchParams.get('cedulaActual') || '';
  const esDuenioRegistrado = searchParams.get('esDuenioRegistrado') || 'S';
  const nombreDuenioActual = searchParams.get('nombreDuenioActual') || '';
  const apellidoDuenioActual = searchParams.get('apellidoDuenioActual') || '';
  const cedulaClienteSolicitante = searchParams.get('idCliente') || '';

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [mostrarFormularioVehiculo, setMostrarFormularioVehiculo] = useState(false);
  const [mostrarFormularioRegistro, setMostrarFormularioRegistro] = useState(false);
  const [nuevoPropietario, setNuevoPropietario] = useState({
    cedula: '', nombre: '', apellido: '', telefono: '', correo: ''
  });
  const [clienteEncontrado, setClienteEncontrado] = useState(false);
  const [cargandoBusqueda, setCargandoBusqueda] = useState(false);

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const rol = sessionStorage.getItem('userRol');
    if (!isLoggedIn || rol !== '2') { router.push('/login'); return; }
    if (esDuenioRegistrado === 'N') setMostrarFormularioVehiculo(true);
  }, []);

  const buscarCliente = async () => {
    if (!busquedaCliente) { setError('Ingrese una cédula para buscar'); return; }
    setCargandoBusqueda(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/perfil/${busquedaCliente}`);
      const data = await response.json();
      if (response.ok && data.status === 'OK') {
        setNuevoPropietario({
          cedula: data.cedula, nombre: data.nombres || '',
          apellido: data.apellido || '', telefono: data.telefono || 'No registrado',
          correo: data.correo || 'No registrado'
        });
        setClienteEncontrado(true);
        setMostrarFormularioRegistro(false);
        setError('');
      } else {
        setMostrarFormularioRegistro(true);
        setClienteEncontrado(false);
        setError('');
      }
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setCargandoBusqueda(false);
    }
  };

  const handleRegistroExitoso = (cliente: { cedula: number; nombres: string; apellido: string; telefono: string; correo: string }) => {
    setNuevoPropietario({
      cedula: cliente.cedula.toString(), nombre: cliente.nombres,
      apellido: cliente.apellido, telefono: cliente.telefono, correo: cliente.correo
    });
    setClienteEncontrado(true);
    setMostrarFormularioRegistro(false);
    setSuccess('Cliente registrado exitosamente');
    setTimeout(() => setSuccess(''), 2000);
  };

  const realizarTraspaso = async () => {
    setSubmitting(true); setError(''); setSuccess('');
    try {
      const response = await fetch(`${BACKEND_URL}/api/vehiculos/traspaso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placa: placaParam,
          cedulaAnterior: parseInt(cedulaActual),
          cedulaNueva: parseInt(nuevoPropietario.cedula),
          idTramite: parseInt(idTramite),
          esDuenioRegistrado
        }),
      });
      const data = await response.json();
      if (response.ok && data.status === 'OK') {
        setSuccess(`Traspaso exitoso. Vehículo transferido a ${nuevoPropietario.nombre} ${nuevoPropietario.apellido}`);
        setTimeout(() => router.push(`/asesor/tramites/${idTramite}`), 2000);
      } else {
        setError(data.mensaje || 'Error al realizar traspaso');
      }
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setSubmitting(false);
    }
  };

  const getTextoPropietarioActual = () =>
    esDuenioRegistrado === 'S'
      ? `Cédula ${cedulaActual} · Cliente registrado`
      : `${nombreDuenioActual} ${apellidoDuenioActual} · Cédula ${cedulaActual} · No registrado en el sistema`;

  /* ── Loading ── */
  if (cargandoBusqueda) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Buscando cliente...</p>
      </div>
    );
  }

  /* ══════════════════════════════════════
     CASO 1: Dueño no registrado → registrar vehículo
  ══════════════════════════════════════ */
  if (mostrarFormularioVehiculo) {
    return (
      <div className={styles.container}>
        <div className={styles.inner}>

          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <span className={styles.logoMark}><CarIcon /></span>
              <span className={styles.logoText}>Trans<strong>Meta</strong></span>
              <span className={styles.badgeAsesor}>Asesor</span>
            </div>
            <Link href={`/asesor/tramites/${idTramite}`} className={styles.backButton}>
              <ArrowLeftIcon /> Volver al Trámite
            </Link>
          </div>

          {/* Page title */}
          <div className={styles.pageTitleRow}>
            <div className={styles.pageIcon}><CarIcon /></div>
            <div>
              <h1 className={styles.pageTitle}>Registrar Vehículo</h1>
              <p className={styles.pageSub}>Trámite #{idTramite} · Propietario no registrado en el sistema</p>
            </div>
          </div>

          {error   && <div className={styles.errorAlert}>{error}</div>}
          {success && <div className={styles.successAlert}>{success}</div>}

          <div className={styles.formCard}>
            {/* Info box */}
            <div className={styles.infoBox}>
              <div className={styles.infoBoxHeader}>
                <div className={styles.infoBoxIcon}><InfoIcon /></div>
                <h3 className={styles.infoBoxTitle}>Información del Trámite</h3>
              </div>
              <div className={styles.infoBoxRow}>
                <span className={styles.infoBoxLabel}>ID Trámite:</span>
                <span>{idTramite}</span>
              </div>
              <div className={styles.infoBoxRow}>
                <span className={styles.infoBoxLabel}>Propietario Actual:</span>
                <span>{getTextoPropietarioActual()}</span>
              </div>
              <div className={styles.infoBoxRow}>
                <span className={styles.infoBoxLabel}>Nuevo Propietario:</span>
                <span>Cédula {cedulaClienteSolicitante}</span>
              </div>
            </div>

            <RegistrarVehiculoForm
              idCliente={parseInt(cedulaClienteSolicitante)}
              onSuccess={async (placa) => {
                setSubmitting(true);
                try {
                  const historialResponse = await fetch(`${BACKEND_URL}/api/vehiculos/historial`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      placa, cedulaAnterior: parseInt(cedulaActual),
                      cedulaNueva: parseInt(cedulaClienteSolicitante),
                      idTramite: parseInt(idTramite)
                    }),
                  });
                  const historialData = await historialResponse.json();
                  if (historialResponse.ok && historialData.status === 'OK') {
                    setSuccess(`Vehículo ${placa} registrado exitosamente`);
                    setTimeout(() => router.push(`/asesor/tramites/${idTramite}`), 2000);
                  } else {
                    setError(historialData.mensaje || 'Error al registrar historial');
                  }
                } catch {
                  setError('Error de conexión con el servidor');
                } finally {
                  setSubmitting(false);
                }
              }}
              onCancel={() => router.push(`/asesor/tramites/${idTramite}`)}
              buttonText="Registrar Vehículo"
            />
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════
     CASO 2: Dueño registrado → buscar nuevo propietario
  ══════════════════════════════════════ */
  return (
    <div className={styles.container}>
      <div className={styles.inner}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.logoMark}><CarIcon /></span>
            <span className={styles.logoText}>Trans<strong>Meta</strong></span>
            <span className={styles.badgeAsesor}>Asesor</span>
          </div>
          <Link href={`/asesor/tramites/${idTramite}`} className={styles.backButton}>
            <ArrowLeftIcon /> Volver al Trámite
          </Link>
        </div>

        {/* Page title */}
        <div className={styles.pageTitleRow}>
          <div className={styles.pageIcon}><ArrowsIcon /></div>
          <div>
            <h1 className={styles.pageTitle}>Realizar Traspaso</h1>
            <p className={styles.pageSub}>
              Trámite #{idTramite}{placaParam ? ` · Vehículo ${placaParam}` : ''}
            </p>
          </div>
        </div>

        {error   && <div className={styles.errorAlert}>{error}</div>}
        {success && <div className={styles.successAlert}>{success}</div>}

        <div className={styles.formCard}>

          {/* Info box */}
          <div className={styles.infoBox}>
            <div className={styles.infoBoxHeader}>
              <div className={styles.infoBoxIcon}><InfoIcon /></div>
              <h3 className={styles.infoBoxTitle}>Información del Trámite</h3>
            </div>
            <div className={styles.infoBoxRow}>
              <span className={styles.infoBoxLabel}>ID Trámite:</span>
              <span>{idTramite}</span>
            </div>
            {placaParam && (
              <div className={styles.infoBoxRow}>
                <span className={styles.infoBoxLabel}>Vehículo:</span>
                <span>{placaParam}</span>
              </div>
            )}
            <div className={styles.infoBoxRow}>
              <span className={styles.infoBoxLabel}>Propietario Actual:</span>
              <span>{getTextoPropietarioActual()}</span>
            </div>
          </div>

          {/* Búsqueda */}
          <div className={styles.searchSection}>
            <p className={styles.sectionTitle}>Nuevo Propietario</p>
            <div className={styles.formGroup}>
              <label>Cédula del nuevo propietario</label>
              <div className={styles.searchBox}>
                <input
                  type="number"
                  value={busquedaCliente}
                  onChange={e => setBusquedaCliente(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && buscarCliente()}
                  placeholder="Ingrese la cédula"
                />
                <button type="button" onClick={buscarCliente} className={styles.searchButton}>
                  <SearchIcon /> Buscar
                </button>
              </div>
            </div>
          </div>

          {/* Formulario registro (cliente no encontrado) */}
          {mostrarFormularioRegistro && (
            <div className={styles.registroSection}>
              <h3> Cliente no encontrado — Registrar nuevo propietario</h3>
              <RegistrarClienteForm
                cedulaInicial={busquedaCliente}
                onSuccess={handleRegistroExitoso}
                onCancel={() => { setMostrarFormularioRegistro(false); setBusquedaCliente(''); }}
                buttonText="Registrar Nuevo Propietario"
              />
            </div>
          )}

          {/* Cliente encontrado */}
          {clienteEncontrado && (
            <>
              <div className={styles.clienteInfo}>
                <h3><CheckIcon /> Nuevo Propietario Encontrado</h3>
                <div className={styles.infoGrid}>
                  <div>
                    <strong>Nombre</strong>
                    <span>{nuevoPropietario.nombre} {nuevoPropietario.apellido}</span>
                  </div>
                  <div>
                    <strong>Cédula</strong>
                    <span>{nuevoPropietario.cedula}</span>
                  </div>
                  <div>
                    <strong>Teléfono</strong>
                    <span>{nuevoPropietario.telefono}</span>
                  </div>
                  <div>
                    <strong>Correo</strong>
                    <span>{nuevoPropietario.correo}</span>
                  </div>
                </div>
              </div>

              <div className={styles.buttonGroup}>
                <Link href={`/asesor/tramites/${idTramite}`} className={styles.cancelButton}>
                  Cancelar
                </Link>
                <button
                  onClick={realizarTraspaso}
                  disabled={submitting}
                  className={styles.saveButton}
                >
                  {submitting ? 'Procesando...' : 'Confirmar Traspaso'}
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}