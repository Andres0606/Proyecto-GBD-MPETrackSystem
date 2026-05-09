'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../../../../CSS/Asesor/EditarVehiculo.module.css';
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
const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const PaletteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="8" cy="10" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="12" cy="7" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="16" cy="10" r="1.5" fill="currentColor" stroke="none"/>
    <path d="M12 22c0-2 2-3 2-5a2 2 0 0 0-4 0c0 2 2 3 2 5z"/>
  </svg>
);
const WrenchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);
const TagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const WarningIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const SuccessIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const FIELD_META: Record<string, { label: string; icon: React.ReactNode }> = {
  color:        { label: 'Color',               icon: <PaletteIcon /> },
  tipoServicio: { label: 'Tipo de Servicio',     icon: <ShieldIcon /> },
  numMotor:     { label: 'Número de Motor',      icon: <WrenchIcon /> },
  numChasis:    { label: 'Número de Chasis',     icon: <WrenchIcon /> },
  placa:        { label: 'Placa',                icon: <TagIcon /> },
  clase:        { label: 'Clase / Carrocería',   icon: <CarIcon /> },
  propietario:  { label: 'Propietario (Cédula)', icon: <UserIcon /> },
};

export default function EditarVehiculoPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const idTramite = params.id as string;
  const camposParam = searchParams.get('campos') || '';
  const placaOriginal = searchParams.get('placa') || '';

  const [campos, setCampos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const enviandoRef = useRef(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
const [updatePendiente, setUpdatePendiente] = useState<Record<string, string> | null>(null);

  const [nuevoColor, setNuevoColor] = useState('');
  const [nuevoTipoServicio, setNuevoTipoServicio] = useState('');
  const [nuevoNumMotor, setNuevoNumMotor] = useState('');
  const [nuevoNumChasis, setNuevoNumChasis] = useState('');
  const [nuevaPlaca, setNuevaPlaca] = useState('');
  const [nuevaClase, setNuevaClase] = useState('');
  const [nuevoPropietario, setNuevoPropietario] = useState('');
  const [regrabacionMotorRealizada, setRegrabacionMotorRealizada] = useState(false);
  const [regrabacionChasisRealizada, setRegrabacionChasisRealizada] = useState(false);

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const rol = sessionStorage.getItem('userRol');
    if (!isLoggedIn || rol !== '2') { router.push('/login'); return; }
    setCampos(camposParam.split(',').filter(c => c.trim() !== ''));
    setLoading(false);
  }, []);

const esRegrabarMotor = campos.includes('numMotor') && campos.length === 1;
const esRegrabarChasis = campos.includes('numChasis') && campos.length === 1;
const esRegrabacion = esRegrabarMotor || esRegrabarChasis;


  const desbloquearEnvio = () => {
  enviandoRef.current = false;
  setSubmitting(false);
};

const finalizarTramite = async () => {
  const response = await fetch(`${BACKEND_URL}/api/tramite/estado`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idTramite: parseInt(idTramite),
      estado: 'Finalizado',
    }),
  });

  const data = await response.json();

  if (!response.ok || data.status !== 'OK') {
    throw new Error(data.mensaje || 'No se pudo finalizar el trámite');
  }
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (enviandoRef.current) return;

  setError('');
  setSuccess('');

if (esRegrabarMotor) {
  if (!regrabacionMotorRealizada) {
    setError('Debe confirmar que la regrabación del número de motor fue realizada.');
    return;
  }

  setUpdatePendiente({ accionRealizada: 'REGRABAR_MOTOR' });
  setMostrarConfirmacion(true);
  return;
}

if (esRegrabarChasis) {
  if (!regrabacionChasisRealizada) {
    setError('Debe confirmar que la regrabación del número de chasis fue realizada.');
    return;
  }

  setUpdatePendiente({ accionRealizada: 'REGRABAR_CHASIS' });
  setMostrarConfirmacion(true);
  return;
}

  const updateData: Record<string, string> = {};

  if (campos.includes('color') && nuevoColor) updateData.color = nuevoColor;
  if (campos.includes('tipoServicio') && nuevoTipoServicio) updateData.tipoServicio = nuevoTipoServicio;
  if (campos.includes('numMotor') && nuevoNumMotor) updateData.numMotor = nuevoNumMotor;
  if (campos.includes('numChasis') && nuevoNumChasis) updateData.numChasis = nuevoNumChasis;
  if (campos.includes('placa') && nuevaPlaca) updateData.placa = nuevaPlaca;
  if (campos.includes('clase') && nuevaClase) updateData.clase = nuevaClase;
  if (campos.includes('propietario') && nuevoPropietario) updateData.propietario = nuevoPropietario;

  if (Object.keys(updateData).length === 0) {
    setError('Debe ingresar al menos un valor para actualizar');
    return;
  }

  setUpdatePendiente(updateData);
  setMostrarConfirmacion(true);
};

const confirmarGuardado = async () => {
  if (!updatePendiente || enviandoRef.current) return;

  setMostrarConfirmacion(false);
  enviandoRef.current = true;
  setSubmitting(true);
  setError('');
  setSuccess('');

  let cambiosGuardados = false;

  try {
if (esRegrabacion) {
  await finalizarTramite();

  cambiosGuardados = true;

  setSuccess(
    esRegrabarMotor
      ? 'Regrabación de motor confirmada. Trámite finalizado correctamente.'
      : 'Regrabación de chasis confirmada. Trámite finalizado correctamente.'
  );

  setUpdatePendiente(null);

  setTimeout(() => {
    router.push(`/asesor/tramites/${idTramite}`);
  }, 1800);

  return;
}

    const response = await fetch(`${BACKEND_URL}/api/vehiculos/${placaOriginal}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePendiente),
    });

    const data = await response.json();

    if (response.ok && data.status === 'OK') {
      cambiosGuardados = true;

      await finalizarTramite();

      setSuccess('Cambios guardados exitosamente. Trámite finalizado correctamente.');
      setUpdatePendiente(null);

      setTimeout(() => {
        router.push(`/asesor/tramites/${idTramite}`);
      }, 1800);
    } else {
      setError(data.mensaje || 'Error al actualizar');
    }
  } catch {
    setError('Error de conexión o no se pudo finalizar el trámite');
  } finally {
    if (!cambiosGuardados) {
      desbloquearEnvio();
    }
  }
};

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Cargando formulario...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid_bg} aria-hidden />
      <div className={styles.particles} aria-hidden>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles.particle} />
        ))}
      </div>

      <div className={styles.inner}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.logoMark}><CarIcon /></span>
            <span className={styles.logoText}>Trans<strong>Meta</strong></span>
            <span className={styles.badgeAsesor}>Asesor</span>
          </div>
          <Link href={`/asesor/tramites/${idTramite}`} className={styles.backBtn}>
            <ArrowLeftIcon /> Volver al Trámite
          </Link>
        </div>

        {/* ── Page title ── */}
        <div className={styles.pageTitleRow}>
          <div className={styles.pageIcon}><EditIcon /></div>
          <div>
            <h1 className={styles.pageTitle}>Editar Vehículo</h1>
            <p className={styles.pageSub}>
              Placa: <strong className={styles.placaHighlight}>{placaOriginal}</strong>
              &nbsp;·&nbsp;{campos.length} campo{campos.length !== 1 ? 's' : ''} a editar
            </p>
          </div>
        </div>

        {/* ── Alerts ── */}
        {error && (
          <div className={styles.errorAlert}>
            <AlertIcon /> {error}
          </div>
        )}
        {success && (
          <div className={styles.successAlert}>
            <SuccessIcon /> {success}
          </div>
        )}

        {/* ── Form card ── */}
        <div className={styles.formCard}>
          <div className={styles.cardTitleRow}>
            <div className={styles.cardTitleIcon}><EditIcon /></div>
            <h2 className={styles.cardTitle}>Campos a modificar</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.fieldsGrid}>

              {/* Color */}
              {campos.includes('color') && (
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    <span className={styles.fieldLabelIcon}><PaletteIcon /></span>
                    Nuevo Color
                  </label>
                  <div className={styles.fieldInputWrap}>
                    <input
                      type="text"
                      value={nuevoColor}
                      onChange={e => setNuevoColor(e.target.value)}
                      placeholder="Ej: Rojo, Azul, Negro"
                      className={styles.fieldInput}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Tipo de servicio */}
              {campos.includes('tipoServicio') && (
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    <span className={styles.fieldLabelIcon}><ShieldIcon /></span>
                    Nuevo Tipo de Servicio
                  </label>
                  <div className={styles.fieldSelectWrap}>
                    <select
                      value={nuevoTipoServicio}
                      onChange={e => setNuevoTipoServicio(e.target.value)}
                      className={styles.fieldSelect}
                      required
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Particular">Particular</option>
                      <option value="Público">Público</option>
                      <option value="Diplomático">Diplomático</option>
                      <option value="Oficial">Oficial</option>
                      <option value="Especial">Especial</option>
                    </select>
                    <span className={styles.selectChevron}><ChevronIcon /></span>
                  </div>
                </div>
              )}

              {/* Regrabar motor */}
{esRegrabarMotor && (

  <div className={styles.fieldGroup}>

    <label className={styles.fieldLabel}>

      <span className={styles.fieldLabelIcon}><WrenchIcon /></span>

      Regrabación de Motor

    </label>

    <div className={styles.actionBox}>

      {/* Encabezado del box */}

      <div className={styles.actionBoxHeader}>

        <div className={styles.actionBoxHeaderIcon}><WrenchIcon /></div>

        <p className={styles.actionBoxHeaderText}>Acción física requerida</p>

      </div>

      {/* Cuerpo */}

      <div className={styles.actionBoxBody}>

        <p className={styles.actionBoxDesc}>

          Este trámite no modifica el número de motor registrado. Confirma que

          la regrabación física del número existente fue realizada correctamente

          antes de finalizar.

        </p>

        {/* Checkbox custom */}

        <div

          role="checkbox"

          aria-checked={regrabacionMotorRealizada}

          tabIndex={0}

          className={`${styles.checkRow} ${regrabacionMotorRealizada ? styles.checkRowActive : ''}`}

          onClick={() => setRegrabacionMotorRealizada(prev => !prev)}

          onKeyDown={e => e.key === ' ' && setRegrabacionMotorRealizada(prev => !prev)}

        >

          <div className={`${styles.checkBox} ${regrabacionMotorRealizada ? styles.checkBoxActive : ''}`}>

            <CheckIcon />

          </div>

          <span className={`${styles.checkLabel} ${regrabacionMotorRealizada ? styles.checkLabelActive : ''}`}>

            {regrabacionMotorRealizada

              ? 'Regrabación realizada correctamente'

              : 'Marcar como realizada'}

          </span>

          <span className={`${styles.checkStatusBadge} ${regrabacionMotorRealizada ? styles.checkStatusDone : styles.checkStatusPending}`}>

            {regrabacionMotorRealizada ? 'Confirmado' : 'Pendiente'}

          </span>

        </div>

      </div>

    </div>

  </div>

)}
              

              {/* Número de chasis */}
              {/* Regrabar chasis */}
{esRegrabarChasis && (
  <div className={styles.fieldGroup}>
    <label className={styles.fieldLabel}>
      <span className={styles.fieldLabelIcon}><WrenchIcon /></span>
      Regrabación de Chasis
    </label>

    <div className={styles.actionBox}>
      <div className={styles.actionBoxHeader}>
        <div className={styles.actionBoxHeaderIcon}><WrenchIcon /></div>
        <p className={styles.actionBoxHeaderText}>Acción física requerida</p>
      </div>

      <div className={styles.actionBoxBody}>
        <p className={styles.actionBoxDesc}>
          Este trámite no modifica el número de chasis registrado. Confirma que
          la regrabación física del número existente fue realizada correctamente
          antes de finalizar.
        </p>

        <div
          role="checkbox"
          aria-checked={regrabacionChasisRealizada}
          tabIndex={0}
          className={`${styles.checkRow} ${regrabacionChasisRealizada ? styles.checkRowActive : ''}`}
          onClick={() => setRegrabacionChasisRealizada(prev => !prev)}
          onKeyDown={e => e.key === ' ' && setRegrabacionChasisRealizada(prev => !prev)}
        >
          <div className={`${styles.checkBox} ${regrabacionChasisRealizada ? styles.checkBoxActive : ''}`}>
            <CheckIcon />
          </div>

          <span className={`${styles.checkLabel} ${regrabacionChasisRealizada ? styles.checkLabelActive : ''}`}>
            {regrabacionChasisRealizada
              ? 'Regrabación realizada correctamente'
              : 'Marcar como realizada'}
          </span>

          <span className={`${styles.checkStatusBadge} ${regrabacionChasisRealizada ? styles.checkStatusDone : styles.checkStatusPending}`}>
            {regrabacionChasisRealizada ? 'Confirmado' : 'Pendiente'}
          </span>
        </div>
      </div>
    </div>
  </div>
)}

              {/* Placa */}
              {campos.includes('placa') && (
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    <span className={styles.fieldLabelIcon}><TagIcon /></span>
                    Nueva Placa
                  </label>
                  <div className={styles.fieldInputWrap}>
                    <input
                      type="text"
                      value={nuevaPlaca}
                      onChange={e => setNuevaPlaca(e.target.value.toUpperCase())}
                      placeholder="Ej: ABC123"
                      className={styles.fieldInput}
                      required
                    />
                  </div>
                  <div className={styles.warningNote}>
                    <WarningIcon />
                    Al cambiar la placa se actualizarán todas las citas asociadas
                  </div>
                </div>
              )}

              {/* Clase */}
              {campos.includes('clase') && (
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    <span className={styles.fieldLabelIcon}><CarIcon /></span>
                    Nueva Clase / Carrocería
                  </label>
                  <div className={styles.fieldSelectWrap}>
                    <select
                      value={nuevaClase}
                      onChange={e => setNuevaClase(e.target.value)}
                      className={styles.fieldSelect}
                      required
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Automóvil">Automóvil</option>
                      <option value="Camioneta">Camioneta</option>
                      <option value="Motocicleta">Motocicleta</option>
                      <option value="Camión">Camión</option>
                    </select>
                    <span className={styles.selectChevron}><ChevronIcon /></span>
                  </div>
                </div>
              )}

              {/* Propietario */}
              {campos.includes('propietario') && (
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    <span className={styles.fieldLabelIcon}><UserIcon /></span>
                    Nuevo Propietario (Cédula)
                  </label>
                  <div className={styles.fieldInputWrap}>
                    <input
                      type="number"
                      value={nuevoPropietario}
                      onChange={e => setNuevoPropietario(e.target.value)}
                      placeholder="Cédula del nuevo propietario"
                      className={styles.fieldInput}
                      required
                    />
                  </div>
                  <div className={styles.warningNote}>
                    <WarningIcon />
                    Este cambio actualizará el dueño del vehículo
                  </div>
                </div>
              )}

            </div>{/* /fieldsGrid */}

            {/* ── Buttons ── */}
            <div className={styles.btnGroup}>
              <button type="submit" disabled={submitting} className={styles.btnSave}>
              {submitting ? (
              <><span className={styles.btnSpinner} /> Guardando y finalizando...</>
            ) : esRegrabacion ? (
              <><CheckIcon /> Confirmar regrabación</>
            ) : (
              <><CheckIcon /> Guardar cambios</>
            )}
            </button>
              <button
              type="button"
              disabled={submitting}
              className={`${styles.btnCancel} ${submitting ? styles.btnCancelDisabled : ''}`}
              onClick={() => {
                if (!submitting) {
                  router.push(`/asesor/tramites/${idTramite}`);
                }
              }}
            >
              <ArrowLeftIcon /> Cancelar
            </button>
            </div>
          </form>
        </div>
        {mostrarConfirmacion && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalBox}>
      <div className={styles.modalIcon}>
        <WarningIcon />
      </div>

      <h3>
  {esRegrabarMotor
    ? 'Confirmar regrabación de motor'
    : esRegrabarChasis
      ? 'Confirmar regrabación de chasis'
      : 'Confirmar cambios'}
</h3>

<p>
  {esRegrabarMotor
    ? 'Estás a punto de confirmar que la regrabación del número de motor fue realizada y finalizar este trámite. Después no podrás volver a modificarlo desde este trámite.'
    : esRegrabarChasis
      ? 'Estás a punto de confirmar que la regrabación del número de chasis fue realizada y finalizar este trámite. Después no podrás volver a modificarlo desde este trámite.'
      : 'Estás a punto de guardar los cambios del vehículo y finalizar este trámite. Después de confirmar, no podrás volver a modificarlo desde este trámite.'}
</p>

      <div className={styles.modalActions}>
        <button
          type="button"
          className={styles.btnModalCancelar}
          onClick={() => {
            setMostrarConfirmacion(false);
            setUpdatePendiente(null);
          }}
        >
          Cancelar
        </button>

        <button
        type="button"
        className={styles.btnModalConfirmar}
        onClick={confirmarGuardado}
      >
        {esRegrabacion ? 'Sí, confirmar y finalizar' : 'Sí, guardar y finalizar'}
      </button>     
      </div>
    </div>
  </div>
)}        
      </div>
    </div>
  );
}