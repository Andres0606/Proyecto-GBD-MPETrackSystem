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

interface ReferenceItem {
  id: number;
  nombre: string;
}

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

  // Listas de referencia
  const [colores, setColores] = useState<ReferenceItem[]>([]);
  const [combustibles, setCombustibles] = useState<ReferenceItem[]>([]);
  const [tiposServicio, setTiposServicio] = useState<ReferenceItem[]>([]);

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

    cargarListas();
  }, []);

  const cargarListas = async () => {
    try {
      const [resCol, resComb, resServ] = await Promise.all([
        fetch(`${BACKEND_URL}/api/vehiculos/colores`),
        fetch(`${BACKEND_URL}/api/vehiculos/combustibles`),
        fetch(`${BACKEND_URL}/api/vehiculos/tipos-servicio`),
      ]);

      const dataCol = await resCol.json();
      const dataComb = await resComb.json();
      const dataServ = await resServ.json();

      if (dataCol.status === 'OK') setColores(dataCol.data);
      if (dataComb.status === 'OK') setCombustibles(dataComb.data);
      if (dataServ.status === 'OK') setTiposServicio(dataServ.data);
    } catch (err) {
      console.error('Error cargando listas:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setVehiculo({ ...vehiculo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enviandoRef.current) return;
    enviandoRef.current = true;
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/vehiculos/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...vehiculo,
          placa: vehiculo.placa.toUpperCase(),
          idCliente: parseInt(idCliente),
          idTramite: parseInt(idTramite),
          modelo: parseInt(vehiculo.modelo),
          color: parseInt(vehiculo.color),
          combustible: parseInt(vehiculo.combustible),
          tipoServicio: parseInt(vehiculo.tipoServicio)
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'OK') {
        // Finalizar trámite
        await fetch(`${BACKEND_URL}/api/tramite/estado`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idTramite: parseInt(idTramite), estado: 'Finalizado' }),
        });

        setSuccess(`Vehículo registrado y trámite finalizado correctamente.`);
        setTimeout(() => router.push(`/asesor/tramites/${idTramite}`), 2000);
      } else {
        setError(data.mensaje || 'Error al registrar vehículo');
        enviandoRef.current = false;
        setSubmitting(false);
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      enviandoRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <Link href={`/asesor/tramites/${idTramite}`} className={styles.backButton}>
            <ArrowLeftIcon /> Volver al Trámite
          </Link>
          <h1>Registrar Vehículo — <span>Matrícula</span></h1>
        </div>

        {error && <div className={styles.errorAlert}><AlertCircleIcon /> {error}</div>}
        {success && <div className={styles.successAlert}><CheckCircleIcon /> {success}</div>}

        <div className={styles.formCard}>
          <div className={styles.infoBox}>
            <h3>Información del Trámite</h3>
            <p><strong>ID Trámite:</strong> #{idTramite}</p>
            <p><strong>Cédula Cliente:</strong> {idCliente}</p>
          </div>

          <p className={styles.sectionTitle}>Datos Técnicos del Vehículo</p>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Placa *</label>
                <input type="text" name="placa" value={vehiculo.placa} onChange={handleChange} placeholder="ABC123" required maxLength={10} />
              </div>
              <div className={styles.formGroup}>
                <label>Marca *</label>
                <input type="text" name="marca" value={vehiculo.marca} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label>Línea *</label>
                <input type="text" name="linea" value={vehiculo.linea} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label>Modelo (Año) *</label>
                <input type="number" name="modelo" value={vehiculo.modelo} onChange={handleChange} required min="1900" max="2026" />
              </div>

              <div className={styles.formGroup}>
                <label>Color *</label>
                <select name="color" value={vehiculo.color} onChange={handleChange} required>
                  <option value="">Seleccionar Color</option>
                  {colores.map((c: any, i) => (
                    <option key={c.id || c.ID || i} value={c.id || c.ID}>
                      {c.nombre || c.NOMBRE}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Tipo de Servicio *</label>
                <select name="tipoServicio" value={vehiculo.tipoServicio} onChange={handleChange} required>
                  <option value="">Seleccionar Servicio</option>
                  {tiposServicio.map((s: any, i) => (
                    <option key={s.id || s.ID || i} value={s.id || s.ID}>
                      {s.nombre || s.NOMBRE}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Combustible *</label>
                <select name="combustible" value={vehiculo.combustible} onChange={handleChange} required>
                  <option value="">Seleccionar Combustible</option>
                  {combustibles.map((c: any, i) => (
                    <option key={c.id || c.ID || i} value={c.id || c.ID}>
                      {c.nombre || c.NOMBRE}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Clase *</label>
                <select name="clase" value={vehiculo.clase} onChange={handleChange} required>
                  <option value="">Seleccionar Clase</option>
                  <option value="Automóvil">Automóvil</option>
                  <option value="Camioneta">Camioneta</option>
                  <option value="Motocicleta">Motocicleta</option>
                  <option value="Camión">Camión</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Número de Motor</label>
                <input type="text" name="numMotor" value={vehiculo.numMotor} onChange={handleChange} />
              </div>
              <div className={styles.formGroup}>
                <label>Número de Chasis</label>
                <input type="text" name="numChasis" value={vehiculo.numChasis} onChange={handleChange} />
              </div>
              <div className={styles.formGroup}>
                <label>Número de VIN</label>
                <input type="text" name="numeroVin" value={vehiculo.numeroVin} onChange={handleChange} />
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <Link href={`/asesor/tramites/${idTramite}`} className={styles.cancelButton}>Cancelar</Link>
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