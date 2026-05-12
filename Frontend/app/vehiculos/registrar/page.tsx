'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../CSS/vehiculos/RegistrarVehiculo.module.css';
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

export default function RegistrarVehiculoPage() {
  const router = useRouter();
const enviandoRef = useRef(false);
const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [prendado, setPrendado] = useState(false);

  const [formData, setFormData] = useState({
    placa: '',
    marca: '',
    linea: '',
    modelo: '',
    clase: '',
    tipoServicio: '',
    numMotor: '',
    numChasis: '',
    color: '',
    numeroVin: '',
    combustible: ''
  });

  const idCliente = typeof window !== 'undefined' ? sessionStorage.getItem('userCedula') : null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const desbloquearEnvio = () => {
  enviandoRef.current = false;
  setSubmitting(false);
};

const handleVolver = () => {
  if (enviandoRef.current || submitting) return;
  router.push('/vehiculos');
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (enviandoRef.current) return;

  enviandoRef.current = true;
  setSubmitting(true);
  setError('');
  setSuccess('');

  if (!formData.placa.trim()) {
    setError('La placa es requerida');
    desbloquearEnvio();
    return;
  }

  const vehiculoData = {
    placa: formData.placa.toUpperCase(),
    idCliente: parseInt(idCliente!),
    marca: formData.marca,
    linea: formData.linea,
    modelo: formData.modelo ? parseInt(formData.modelo) : null,
    clase: formData.clase,
    tipoServicio: formData.tipoServicio,
    numMotor: formData.numMotor,
    numChasis: formData.numChasis,
    color: formData.color,
    numeroVin: formData.numeroVin,
    combustible: formData.combustible,
    prendado: prendado ? 'S' : 'N'
  };

  try {
    const response = await fetch(`${BACKEND_URL}/api/vehiculos/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vehiculoData),
    });

    const data = await response.json();

    if (response.ok && data.status === 'OK') {
      setSuccess('¡Vehículo registrado exitosamente!');
      setTimeout(() => router.push('/vehiculos'), 2000);
    } else {
      setError(data.mensaje || 'Error al registrar vehículo');
      desbloquearEnvio();
    }
  } catch (err) {
    console.error('Error:', err);
    setError('Error de conexión con el servidor');
    desbloquearEnvio();
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
          </div>
          <button
            type="button"
            className={styles.backButton}
            onClick={handleVolver}
            disabled={submitting}
          >
            <ArrowLeftIcon /> Volver a mis vehículos
          </button>
        </div>

        {/* ── Page title ── */}
        <div className={styles.pageTitleRow}>
          <div className={styles.pageIcon}><CarIcon /></div>
          <div>
            <h1 className={styles.pageTitle}>Registrar Vehículo</h1>
            <p className={styles.pageSub}>Completa los datos del vehículo para asociarlo a tu cuenta</p>
          </div>
        </div>

        {/* ── Alerts ── */}
        {error   && <div className={styles.errorAlert}>{error}</div>}
        {success && <div className={styles.successAlert}>{success}</div>}

        {/* ── Form Card ── */}
        <div className={styles.formCard}>
          <form onSubmit={handleSubmit} className={styles.form}>

            {/* Sección: Identificación */}
            <div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Placa *</label>
                  <input
                    type="text" name="placa" value={formData.placa}
                    onChange={handleChange} placeholder="ABC123"
                    required maxLength={10}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Marca</label>
                  <input
                    type="text" name="marca" value={formData.marca}
                    onChange={handleChange} placeholder="Chevrolet, Renault, Mazda"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Línea</label>
                  <input
                    type="text" name="linea" value={formData.linea}
                    onChange={handleChange} placeholder="Spark, Logan, 3"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Modelo</label>
                  <input
                    type="number" name="modelo" value={formData.modelo}
                    onChange={handleChange} placeholder="2020"
                    min="1900" max="2026"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Color</label>
                  <input
                    type="text" name="color" value={formData.color}
                    onChange={handleChange} placeholder="Rojo, Azul, Negro"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Clase</label>
                  <select name="clase" value={formData.clase} onChange={handleChange}>
                    <option value="">Seleccionar</option>
                    <option value="Automóvil">Automóvil</option>
                    <option value="Camioneta">Camioneta</option>
                    <option value="Motocicleta">Motocicleta</option>
                    <option value="Camión">Camión</option>
                  </select>
                </div>
                
              </div>
            </div>

            {/* Sección: Características */}
            <div>
              <div className={styles.formGrid}>
                
                <div className={styles.formGroup}>
                  <label>Tipo de Servicio</label>
                  <select name="tipoServicio" value={formData.tipoServicio} onChange={handleChange}>
                    <option value="">Seleccionar</option>
                    <option value="Particular">Particular</option>
                    <option value="Público">Público</option>
                    <option value="Diplomático">Diplomático</option>
                    <option value="Oficial">Oficial</option>
                    <option value="Especial">Especial</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Tipo de Combustible</label>
                  <select name="combustible" value={formData.combustible} onChange={handleChange}>
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
                <div className={styles.formGroup}>
                  <label>Número de Motor</label>
                  <input
                    type="text" name="numMotor" value={formData.numMotor}
                    onChange={handleChange} placeholder="Número de motor"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Número de Chasis</label>
                  <input
                    type="text" name="numChasis" value={formData.numChasis}
                    onChange={handleChange} placeholder="Número de chasis"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Número de VIN</label>
                  <input
                    type="text" name="numeroVin" value={formData.numeroVin}
                    onChange={handleChange} placeholder="Número de identificación vehicular"
                  />
                </div>


                {/* Toggle prendado */}
                <div className={styles.formGroupFull}>
                  <label>¿Vehículo prendado?</label>
                  <div className={styles.toggleGroup}>
                    <button
                      type="button"
                      className={`${styles.toggleBtn} ${!prendado ? styles.toggleActive : ''}`}
                      onClick={() => setPrendado(false)}
                      disabled={submitting}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      className={`${styles.toggleBtn} ${prendado ? styles.toggleActive : ''}`}
                      onClick={() => setPrendado(true)}
                      disabled={submitting}
                    >
                      Sí
                    </button>
                  </div>
                  <small className={styles.helpText}>
                    Indica si el vehículo tiene una prenda vigente (crédito activo)
                  </small>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className={styles.buttonGroup}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleVolver}
              disabled={submitting}
            >
              Cancelar
            </button>
              <button type="submit" disabled={submitting} className={styles.submitButton}>
                {submitting ? 'Registrando...' : 'Registrar Vehículo'}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}