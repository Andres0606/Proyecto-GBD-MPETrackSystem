'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../../../../CSS/Asesor/RegistrarVehiculo.module.css';
import { BACKEND_URL } from '@/lib/config';

/* ── Icons ── */
const ArrowLeftIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
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

const CarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v10a2 2 0 0 1-2 2h-2"/>
    <circle cx="7" cy="17" r="2"/>
    <circle cx="17" cy="17" r="2"/>
  </svg>
);

export default function RegistrarVehiculoPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const idTramite = params.id as string;
  const idCliente = searchParams.get('idCliente') || '';

  const [submitting, setSubmitting] = useState(false);
  const enviandoRef = useRef(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [vehiculo, setVehiculo] = useState({
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

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const rol = sessionStorage.getItem('userRol');

    if (!isLoggedIn || rol !== '2') {
      router.push('/login');
      return;
    }

    if (!idCliente) {
      setError('Falta información del cliente');
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setVehiculo({ ...vehiculo, [e.target.name]: e.target.value });
  };

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
      estado: 'Finalizado'
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

  enviandoRef.current = true;
  setSubmitting(true);
  setError('');
  setSuccess('');

    const vehiculoData = {
      placa: vehiculo.placa.toUpperCase(),
      idCliente: parseInt(idCliente),
      marca: vehiculo.marca,
      linea: vehiculo.linea,
      modelo: parseInt(vehiculo.modelo),
      clase: vehiculo.clase,
      tipoServicio: vehiculo.tipoServicio,
      numMotor: vehiculo.numMotor,
      numChasis: vehiculo.numChasis,
      color: vehiculo.color,
      numeroVin: vehiculo.numeroVin,
      combustible: vehiculo.combustible,
    };

let vehiculoRegistrado = false;

try {
  const response = await fetch(`${BACKEND_URL}/api/vehiculos/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vehiculoData),
  });

  const data = await response.json();

  if (response.ok && data.status === 'OK') {
    vehiculoRegistrado = true;

    try {
      await finalizarTramite();

      setSuccess(
        `Vehículo ${vehiculo.placa.toUpperCase()} registrado exitosamente. Trámite finalizado correctamente.`
      );
    } catch (error) {
      setSuccess(
        `Vehículo ${vehiculo.placa.toUpperCase()} registrado exitosamente, pero no se pudo finalizar automáticamente el trámite.`
      );
    }

    setTimeout(() => {
      router.push(`/asesor/tramites/${idTramite}`);
    }, 2000);
  } else {
    setError(data.mensaje || 'Error al registrar vehículo');
  }
} catch (err) {
  setError('Error de conexión con el servidor');
} finally {
  if (!vehiculoRegistrado) {
    desbloquearEnvio();
  }
}
};

return (
    <div className={styles.container}>
      <div className={styles.inner}>

        {/* Header */}
        <div className={styles.header}>
          <Link href={`/asesor/tramites/${idTramite}`} className={styles.backButton}>
            <ArrowLeftIcon /> Volver al Trámite
          </Link>
          <h1>Registrar Vehículo — <span>Matrícula</span></h1>
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

        {/* Card principal */}
        <div className={styles.formCard}>

          {/* Info del trámite */}
          <div className={styles.infoBox}>
            <h3>Información del Trámite</h3>
            <p><strong>ID Trámite:</strong> #{idTramite}</p>
            <p><strong>ID Cliente:</strong> {idCliente}</p>
          </div>

          <p className={styles.sectionTitle}> Datos del Vehículo</p>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>

              <div className={styles.formGroup}>
                <label>Placa *</label>
                <input
                  type="text"
                  name="placa"
                  value={vehiculo.placa}
                  onChange={handleChange}
                  placeholder="Ej: ABC123"
                  required
                  maxLength={10}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Marca *</label>
                <input
                  type="text"
                  name="marca"
                  value={vehiculo.marca}
                  onChange={handleChange}
                  placeholder="Ej: Chevrolet, Renault, Mazda"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Línea *</label>
                <input
                  type="text"
                  name="linea"
                  value={vehiculo.linea}
                  onChange={handleChange}
                  placeholder="Ej: Spark, Logan, 3"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Modelo *</label>
                <input
                  type="number"
                  name="modelo"
                  value={vehiculo.modelo}
                  onChange={handleChange}
                  placeholder="Ej: 2020"
                  required
                  min="1900"
                  max="2026"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Color *</label>
                <input
                  type="text"
                  name="color"
                  value={vehiculo.color}
                  onChange={handleChange}
                  placeholder="Ej: Rojo, Azul, Negro"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Clase *</label>
                <select name="clase" value={vehiculo.clase} onChange={handleChange} required>
                  <option value="">Seleccionar</option>
                  <option value="Automóvil">Automóvil</option>
                  <option value="Camioneta">Camioneta</option>
                  <option value="Motocicleta">Motocicleta</option>
                  <option value="Camión">Camión</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Tipo de Servicio *</label>
                <select name="tipoServicio" value={vehiculo.tipoServicio} onChange={handleChange} required>
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
              <select
                name="combustible"
                value={vehiculo.combustible}
                onChange={handleChange}
              >
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
                  type="text"
                  name="numMotor"
                  value={vehiculo.numMotor}
                  onChange={handleChange}
                  placeholder="Número de motor"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Número de Chasis</label>
                <input
                  type="text"
                  name="numChasis"
                  value={vehiculo.numChasis}
                  onChange={handleChange}
                  placeholder="Número de chasis"
                />
              </div>

              <div className={styles.formGroup}>
              <label>Número de VIN</label>
              <input
                type="text"
                name="numeroVin"
                value={vehiculo.numeroVin}
                onChange={handleChange}
                placeholder="Número de identificación vehicular"
              />
            </div>

              

            </div>

            {/* Botones */}
            <div className={styles.buttonGroup}>
              <Link href={`/asesor/tramites/${idTramite}`} className={styles.cancelButton}>
                Cancelar
              </Link>
              <button type="submit" disabled={submitting} className={styles.saveButton}>
                {submitting ? 'Registrando...' : 'Registrar Vehículo'}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}