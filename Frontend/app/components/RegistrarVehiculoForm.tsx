'use client';

import { useState, useEffect } from 'react';
import styles from '../CSS/vehiculos/RegistrarVehiculo.module.css';
import { BACKEND_URL } from '@/lib/config';

interface RegistrarVehiculoFormProps {
  idCliente: number;
  idTramite?: number;
  onSuccess?: (placa: string) => void;
  onCancel?: () => void;
  buttonText?: string;
}

interface MasterData {
  id: string | number;
  nombre: string;
}

export default function RegistrarVehiculoForm({ 
  idCliente, 
  idTramite,
  onSuccess, 
  onCancel, 
  buttonText = 'Registrar Vehículo' 
}: RegistrarVehiculoFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [loadingLists, setLoadingLists] = useState(true);
  const [error, setError] = useState('');
  
  // Listas dinámicas desde la DB
  const [colores, setColores] = useState<MasterData[]>([]);
  const [clases, setClases] = useState<MasterData[]>([]);
  const [servicios, setServicios] = useState<MasterData[]>([]);
  const [combustibles, setCombustibles] = useState<MasterData[]>([]);

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
    combustible: '',
    prendado: 'N'
  });

  useEffect(() => {
    cargarListas();
  }, []);

  const cargarListas = async () => {
    try {
      setLoadingLists(true);
      const [resCol, resComb, resServ, resClase] = await Promise.all([
        fetch(`${BACKEND_URL}/api/vehiculos/colores`),
        fetch(`${BACKEND_URL}/api/vehiculos/combustibles`),
        fetch(`${BACKEND_URL}/api/vehiculos/tipos-servicio`),
        fetch(`${BACKEND_URL}/api/vehiculos/clases`)
      ]);

      const [dataCol, dataComb, dataServ, dataClase] = await Promise.all([
        resCol.json(), resComb.json(), resServ.json(), resClase.json()
      ]);

      if (dataCol.status === 'OK') setColores(dataCol.data);
      if (dataComb.status === 'OK') setCombustibles(dataComb.data);
      if (dataServ.status === 'OK') setServicios(dataServ.data);
      if (dataClase.status === 'OK') setClases(dataClase.data);

    } catch (err) {
      console.error('Error cargando listas maestras:', err);
      setError('Error al cargar opciones de la base de datos');
    } finally {
      setLoadingLists(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!formData.placa.trim()) {
      setError('La placa es requerida');
      setSubmitting(false);
      return;
    }

    const vehiculoData = {
      placa: formData.placa.toUpperCase(),
      idCliente: idCliente,
      idTramite: idTramite, // Para vincularlo automáticamente
      marca: formData.marca,
      linea: formData.linea,
      modelo: formData.modelo ? parseInt(formData.modelo) : null,
      clase: formData.clase,
      tipoServicio: formData.tipoServicio ? parseInt(formData.tipoServicio) : null,
      numMotor: formData.numMotor,
      numChasis: formData.numChasis,
      color: formData.color ? parseInt(formData.color) : null,
      numeroVin: formData.numeroVin,
      combustible: formData.combustible ? parseInt(formData.combustible) : null,
      prendado: formData.prendado
    };

    try {
      const response = await fetch(`${BACKEND_URL}/api/vehiculos/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehiculoData),
      });

      const data = await response.json();

      if (response.ok && data.status === 'OK') {
        if (onSuccess) {
          onSuccess(formData.placa.toUpperCase());
        }
      } else {
        setError(data.mensaje || 'Error al registrar vehículo');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingLists) {
    return <div className={styles.loading}>Cargando opciones del sistema...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      {error && <div className={styles.errorAlert}>{error}</div>}
      
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>Placa *</label>
          <input type="text" name="placa" value={formData.placa} onChange={handleChange} required placeholder="ABC123" />
        </div>
        <div className={styles.formGroup}>
          <label>Marca</label>
          <input type="text" name="marca" value={formData.marca} onChange={handleChange} placeholder="Ej: Chevrolet" />
        </div>
        <div className={styles.formGroup}>
          <label>Línea</label>
          <input type="text" name="linea" value={formData.linea} onChange={handleChange} placeholder="Ej: Aveo" />
        </div>
        <div className={styles.formGroup}>
          <label>Modelo (Año)</label>
          <input type="number" name="modelo" value={formData.modelo} onChange={handleChange} placeholder="Ej: 2024" />
        </div>

        <div className={styles.formGroup}>
          <label>Clase de Vehículo</label>
          <select name="clase" value={formData.clase} onChange={handleChange}>
            <option value="">Seleccionar Clase</option>
            {clases.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Tipo de Servicio</label>
          <select name="tipoServicio" value={formData.tipoServicio} onChange={handleChange}>
            <option value="">Seleccionar Servicio</option>
            {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Color</label>
          <select name="color" value={formData.color} onChange={handleChange}>
            <option value="">Seleccionar Color</option>
            {colores.map(col => <option key={col.id} value={col.id}>{col.nombre}</option>)}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Combustible</label>
          <select name="combustible" value={formData.combustible} onChange={handleChange}>
            <option value="">Seleccionar Combustible</option>
            {combustibles.map(comb => <option key={comb.id} value={comb.id}>{comb.nombre}</option>)}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Número VIN</label>
          <input type="text" name="numeroVin" value={formData.numeroVin} onChange={handleChange} placeholder="17 caracteres" />
        </div>
        <div className={styles.formGroup}>
          <label>Número Motor</label>
          <input type="text" name="numMotor" value={formData.numMotor} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label>Número Chasis</label>
          <input type="text" name="numChasis" value={formData.numChasis} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label>¿Tiene Prenda?</label>
          <select name="prendado" value={formData.prendado} onChange={handleChange}>
            <option value="N">No</option>
            <option value="S">Sí (Con Prenda)</option>
          </select>
        </div>
      </div>

      <div className={styles.buttonGroup}>
        <button type="submit" disabled={submitting} className={styles.submitButton}>
          {submitting ? 'Registrando...' : buttonText}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={styles.cancelButton}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}