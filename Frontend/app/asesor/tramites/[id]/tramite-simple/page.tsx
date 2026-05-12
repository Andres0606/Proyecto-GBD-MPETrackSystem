'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import styles from '../../../../CSS/Asesor/TramiteSimple.module.css';
import { BACKEND_URL } from '@/lib/config';

/* ── Icons ── */
const ClipboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
    <rect x="9" y="3" width="6" height="4" rx="1"/>
  </svg>
);
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
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const WrenchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);
const WarningIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

export default function TramiteSimplePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const idTramite = params.id as string;
  const tipo = searchParams.get('tipo') || '';
  const placa = searchParams.get('placa') || '';

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const enviandoRef = useRef(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [nuevoCombustible, setNuevoCombustible] = useState('');
  const [transformacionRealizada, setTransformacionRealizada] = useState(false);
  const [duplicadoRealizado, setDuplicadoRealizado] = useState(false);
  const [tipoTransformacion, setTipoTransformacion] = useState('');

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const rol = sessionStorage.getItem('userRol');
    if (!isLoggedIn || rol !== '2') { router.push('/login'); return; }
  }, []);

  const getTitulo = () => {
    switch (tipo) {
      case 'Cambio de Carrocería':    return 'Cambio de Carrocería';
      case 'Duplicado de Placas':     return 'Duplicado de Placas';
      case 'Transformación':          return 'Transformación del Vehículo';
      case 'Duplicado de Licencia':
      case 'Duplicado Licencia':
        return 'Duplicado de Licencia de Conducción';      
      case 'Otros':                   return 'Otros Trámites';
      default:                        return 'Realizar Trámite';
    }
  };

  const getDescripcion = () => {
    switch (tipo) {
      case 'Cambio de Carrocería':  return 'Registrar el cambio de tipo de carrocería del vehículo.';
      case 'Duplicado de Placas':   return 'Generar un duplicado de las placas por pérdida, robo o deterioro.';
      case 'Transformación':        return 'Registrar modificaciones importantes en el vehículo.';
      case 'Duplicado de Licencia':
      case 'Duplicado Licencia':
        return 'Generar un duplicado de la licencia de conducción.';
      case 'Otros':                 return 'Realizar un trámite no especificado en las categorías anteriores.';
      default:                      return 'Realizar trámite.';
    }
  };

  const esConversionCombustible = tipoTransformacion === 'CONVERSION_COMBUSTIBLE';
const esDuplicadoPlacas = tipo === 'Duplicado de Placas';
const esDuplicadoLicencia = tipo === 'Duplicado de Licencia' || tipo === 'Duplicado Licencia';
const esDuplicado = esDuplicadoPlacas || esDuplicadoLicencia;

  const desbloquearEnvio = () => { enviandoRef.current = false; setSubmitting(false); };

  const finalizarTramite = async () => {
    const response = await fetch(`${BACKEND_URL}/api/tramite/estado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idTramite: parseInt(idTramite), estado: 'Finalizado' }),
    });
    const data = await response.json();
    if (!response.ok || data.status !== 'OK')
      throw new Error(data.mensaje || 'No se pudo finalizar el trámite');
  };

  const actualizarCombustible = async () => {
    const response = await fetch(`${BACKEND_URL}/api/vehiculos/${placa}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ combustible: nuevoCombustible }),
    });
    const data = await response.json();
    if (!response.ok || data.status !== 'OK')
      throw new Error(data.mensaje || 'No se pudo actualizar el combustible');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enviandoRef.current) return;
    setError(''); setSuccess('');

    if (tipo === 'Transformación') {
      if (!tipoTransformacion) { setError('Seleccione el tipo de transformación.'); return; }
      if (esConversionCombustible && !nuevoCombustible) { setError('Seleccione el nuevo tipo de combustible.'); return; }
      if (esConversionCombustible && !placa) { setError('No se recibió la placa del vehículo. Vuelva al detalle del trámite e intente de nuevo.'); return; }
      if (!esConversionCombustible && !transformacionRealizada) { setError('Debe confirmar que la transformación fue realizada.'); return; }
    }

    if (esDuplicado) {
  if (!duplicadoRealizado) {
    setError(
      esDuplicadoPlacas
        ? 'Debe confirmar que el duplicado de placas fue realizado.'
        : 'Debe confirmar que el duplicado de licencia fue realizado.'
    );
    return;
  }
}
    setMostrarConfirmacion(true);
  };

  const confirmarTramite = async () => {
    if (enviandoRef.current) return;
    setMostrarConfirmacion(false);
    enviandoRef.current = true;
    setSubmitting(true);
    setError(''); setSuccess('');
    let tramiteRealizado = false;
    try {
      if (tipo === 'Transformación' && esConversionCombustible) await actualizarCombustible();
      await finalizarTramite();
      tramiteRealizado = true;
      setSuccess(
      tipo === 'Transformación'
        ? esConversionCombustible
          ? `Conversión de combustible registrada. Nuevo: ${nuevoCombustible}. Trámite finalizado.`
          : 'Transformación confirmada. Trámite finalizado correctamente.'
        : esDuplicadoPlacas
          ? 'Duplicado de placas confirmado. Trámite finalizado correctamente.'
          : esDuplicadoLicencia
            ? 'Duplicado de licencia confirmado. Trámite finalizado correctamente.'
            : 'Trámite realizado exitosamente.'
    );
      setTimeout(() => router.push(`/asesor/tramites/${idTramite}`), 1800);
    } catch {
      setError('Error de conexión o no se pudo finalizar el trámite.');
    } finally {
      if (!tramiteRealizado) desbloquearEnvio();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.inner}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.logoMark}><CarIcon /></span>
            <span className={styles.logoText}>Trans<strong>Meta</strong></span>
            <span className={styles.badgeAsesor}>Asesor</span>
          </div>
          <button
            type="button"
            disabled={submitting}
            className={`${styles.backButton} ${submitting ? styles.cancelButtonDisabled : ''}`}
            onClick={() => { if (!submitting) router.push(`/asesor/tramites/${idTramite}`); }}
          >
            <ArrowLeftIcon /> Volver al Trámite
          </button>
        </div>

        {/* ── Page title ── */}
        <div className={styles.pageTitleRow}>
          <div className={styles.pageIcon}><ClipboardIcon /></div>
          <div>
            <h1 className={styles.pageTitle}>{getTitulo()}</h1>
            <p className={styles.pageSub}>Trámite #{idTramite}{placa ? ` · Placa ${placa}` : ''}</p>
          </div>
        </div>

        {/* ── Alerts ── */}
        {error   && <div className={styles.errorAlert}>{error}</div>}
        {success && <div className={styles.successAlert}>{success}</div>}

        {/* ── Form Card ── */}
        <div className={styles.formCard}>

          {/* Info box */}
          <div className={styles.infoBox}>
            <div className={styles.infoBoxHeader}>
              <div className={styles.infoBoxIcon}><InfoIcon /></div>
              <h3 className={styles.infoBoxTitle}>Información del Trámite</h3>
            </div>
            <div className={styles.infoBoxRow}>
              <span className={styles.infoBoxLabel}>ID:</span>
              <span>{idTramite}</span>
            </div>
            <div className={styles.infoBoxRow}>
              <span className={styles.infoBoxLabel}>Tipo:</span>
              <span>{tipo}</span>
            </div>
            {placa && (
              <div className={styles.infoBoxRow}>
                <span className={styles.infoBoxLabel}>Placa:</span>
                <span>{placa}</span>
              </div>
            )}
            <p className={styles.infoBoxDesc}>{getDescripcion()}</p>
          </div>

          <form onSubmit={handleSubmit}>

            {/* ── Transformación ── */}
            {tipo === 'Transformación' && (
              <>
                <div className={styles.formGroup}>
                  <label>Tipo de Transformación *</label>
                  <select
                    value={tipoTransformacion}
                    onChange={e => {
                      setTipoTransformacion(e.target.value);
                      setNuevoCombustible('');
                      setTransformacionRealizada(false);
                      setError('');
                    }}
                    required
                  >
                    <option value="">Seleccionar</option>
                    <option value="CONVERSION_COMBUSTIBLE">Conversión de combustible</option>
                    <option value="CAMBIO_EJES">Cambio número de ejes</option>
                    <option value="AMPLIACION_CARGA">Ampliación de capacidad de carga</option>
                    <option value="REDUCCION_CARGA">Reducción de capacidad de carga</option>
                    <option value="EQUIPOS_ESPECIALES">Instalación de equipos especiales</option>
                  </select>
                </div>

                {esConversionCombustible && (
                  <div className={styles.formGroup}>
                    <label>Nuevo tipo de combustible *</label>
                    <select value={nuevoCombustible} onChange={e => setNuevoCombustible(e.target.value)} required>
                      <option value="">Seleccionar</option>
                      <option value="Gasolina">Gasolina</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Gas">Gas</option>
                      <option value="Mixto">Mixto</option>
                      <option value="Electrico">Eléctrico</option>
                      <option value="Hidrogeno">Hidrógeno</option>
                      <option value="Etanol">Etanol</option>
                      <option value="Biodiesel">Biodiesel</option>
                    </select>
                  </div>
                )}

                {tipoTransformacion && !esConversionCombustible && (
                  <div className={styles.actionBox}>
                    <div className={styles.actionBoxHeader}>
                      <div className={styles.actionBoxHeaderIcon}><WrenchIcon /></div>
                      <p className={styles.actionBoxHeaderText}>Confirmación requerida</p>
                    </div>
                    <div className={styles.actionBoxBody}>
                      <p className={styles.actionBoxDesc}>
                        Confirma que la transformación solicitada fue realizada correctamente
                        antes de finalizar el trámite.
                      </p>
                      <div
                        role="checkbox"
                        aria-checked={transformacionRealizada}
                        tabIndex={0}
                        className={`${styles.checkRow} ${transformacionRealizada ? styles.checkRowActive : ''}`}
                        onClick={() => setTransformacionRealizada(prev => !prev)}
                        onKeyDown={e => e.key === ' ' && setTransformacionRealizada(prev => !prev)}
                      >
                        <div className={`${styles.checkBox} ${transformacionRealizada ? styles.checkBoxActive : ''}`}>
                          <CheckIcon />
                        </div>
                        <span className={`${styles.checkLabel} ${transformacionRealizada ? styles.checkLabelActive : ''}`}>
                          {transformacionRealizada ? 'Transformación realizada correctamente' : 'Marcar como realizada'}
                        </span>
                        <span className={`${styles.checkStatusBadge} ${transformacionRealizada ? styles.checkStatusDone : styles.checkStatusPending}`}>
                          {transformacionRealizada ? 'Confirmado' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── Cambio de Carrocería ── */}
            {tipo === 'Cambio de Carrocería' && (
              <div className={styles.formGroup}>
                <label>Nueva Carrocería *</label>
                <select required>
                  <option value="">Seleccionar</option>
                  <option value="Sedán">Sedán</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="SUV">SUV</option>
                  <option value="Pickup">Pickup</option>
                  <option value="Furgón">Furgón</option>
                  <option value="Bus">Bus</option>
                  <option value="Camión">Camión</option>
                </select>
              </div>
            )}

            {/* ── Duplicado de Placas ── */}
{esDuplicadoPlacas && (
  <div className={styles.actionBox}>
    <div className={styles.actionBoxHeader}>
      <div className={styles.actionBoxHeaderIcon}><ClipboardIcon /></div>
      <p className={styles.actionBoxHeaderText}>Confirmación requerida</p>
    </div>

    <div className={styles.actionBoxBody}>
      <p className={styles.actionBoxDesc}>
        Confirma que el duplicado de placas fue realizado correctamente antes de finalizar el trámite.
      </p>

      <div
        role="checkbox"
        aria-checked={duplicadoRealizado}
        tabIndex={0}
        className={`${styles.checkRow} ${duplicadoRealizado ? styles.checkRowActive : ''}`}
        onClick={() => setDuplicadoRealizado(prev => !prev)}
        onKeyDown={e => e.key === ' ' && setDuplicadoRealizado(prev => !prev)}
      >
        <div className={`${styles.checkBox} ${duplicadoRealizado ? styles.checkBoxActive : ''}`}>
          <CheckIcon />
        </div>

        <span className={`${styles.checkLabel} ${duplicadoRealizado ? styles.checkLabelActive : ''}`}>
          {duplicadoRealizado ? 'Duplicado de placas realizado correctamente' : 'Marcar como realizado'}
        </span>

        <span className={`${styles.checkStatusBadge} ${duplicadoRealizado ? styles.checkStatusDone : styles.checkStatusPending}`}>
          {duplicadoRealizado ? 'Confirmado' : 'Pendiente'}
        </span>
      </div>
    </div>
  </div>
)}

            {/* ── Duplicado de Licencia ── */}
{esDuplicadoLicencia && (
  <div className={styles.actionBox}>
    <div className={styles.actionBoxHeader}>
      <div className={styles.actionBoxHeaderIcon}><ClipboardIcon /></div>
      <p className={styles.actionBoxHeaderText}>Confirmación requerida</p>
    </div>

    <div className={styles.actionBoxBody}>
      <p className={styles.actionBoxDesc}>
        Confirma que el duplicado de licencia fue realizado correctamente antes de finalizar el trámite.
      </p>

      <div
        role="checkbox"
        aria-checked={duplicadoRealizado}
        tabIndex={0}
        className={`${styles.checkRow} ${duplicadoRealizado ? styles.checkRowActive : ''}`}
        onClick={() => setDuplicadoRealizado(prev => !prev)}
        onKeyDown={e => e.key === ' ' && setDuplicadoRealizado(prev => !prev)}
      >
        <div className={`${styles.checkBox} ${duplicadoRealizado ? styles.checkBoxActive : ''}`}>
          <CheckIcon />
        </div>

        <span className={`${styles.checkLabel} ${duplicadoRealizado ? styles.checkLabelActive : ''}`}>
          {duplicadoRealizado ? 'Duplicado de licencia realizado correctamente' : 'Marcar como realizado'}
        </span>

        <span className={`${styles.checkStatusBadge} ${duplicadoRealizado ? styles.checkStatusDone : styles.checkStatusPending}`}>
          {duplicadoRealizado ? 'Confirmado' : 'Pendiente'}
        </span>
      </div>
    </div>
  </div>
)}
            {/* ── Otros ── */}
            {tipo === 'Otros' && (
              <div className={styles.formGroup}>
                <label>Descripción del Trámite *</label>
                <textarea rows={4} placeholder="Describa el trámite a realizar..." required />
              </div>
            )}

            {/* Botones */}
            <div className={styles.buttonGroup}>
              <button
                type="button"
                disabled={submitting}
                className={`${styles.cancelButton} ${submitting ? styles.cancelButtonDisabled : ''}`}
                onClick={() => { if (!submitting) router.push(`/asesor/tramites/${idTramite}`); }}
              >
                Cancelar
              </button>
              <button type="submit" disabled={submitting} className={styles.realizarButton}>
{submitting
  ? 'Procesando...'
  : esDuplicado
    ? 'Confirmar duplicado'
    : 'Realizar Trámite'}
                  </button>
            </div>
          </form>
        </div>

      </div>

      {/* ── Modal ── */}
      {mostrarConfirmacion && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <div className={styles.modalIconWrap}><WarningIcon /></div>
            <h3>Confirmar trámite</h3>
            <p>
            {tipo === 'Transformación'
              ? esConversionCombustible
                ? `Se actualizará el combustible del vehículo ${placa} a ${nuevoCombustible} y el trámite quedará finalizado.`
                : 'Se confirmará la transformación realizada y el trámite quedará finalizado.'
              : esDuplicadoPlacas
                ? 'Se confirmará el duplicado de placas realizado y el trámite quedará finalizado.'
                : esDuplicadoLicencia
                  ? 'Se confirmará el duplicado de licencia realizado y el trámite quedará finalizado.'
                  : 'Este trámite quedará finalizado y no podrá volver a modificarse desde este registro.'}
          </p>
            <div className={styles.modalActions}>
              <button type="button" className={styles.btnModalCancelar} onClick={() => setMostrarConfirmacion(false)}>
                Cancelar
              </button>
              <button type="button" className={styles.btnModalConfirmar} onClick={confirmarTramite}>
                Sí, finalizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}