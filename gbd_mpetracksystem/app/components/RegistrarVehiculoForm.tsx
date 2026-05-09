'use client';

import { useState } from 'react';
import styles from '../CSS/vehiculos/RegistrarVehiculo.module.css';
import { BACKEND_URL } from '@/lib/config';

interface RegistrarVehiculoFormProps {
  idCliente: number;
  onSuccess?: (placa: string) => void;
  onCancel?: () => void;
  buttonText?: string;
}

export default function RegistrarVehiculoForm({ 
  idCliente, 
  onSuccess, 
  onCancel, 
  buttonText = 'Registrar Vehículo' 
}: RegistrarVehiculoFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
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
      prendado: 'N'
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
      console.error('Error:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className={styles.errorAlert}>{error}</div>}
      
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>Placa *</label>
          <input type="text" name="placa" value={formData.placa} onChange={handleChange} required />
        </div>
        <div className={styles.formGroup}>
          <label>Marca</label>
          <input type="text" name="marca" value={formData.marca} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label>Línea</label>
          <input type="text" name="linea" value={formData.linea} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label>Modelo</label>
          <input type="number" name="modelo" value={formData.modelo} onChange={handleChange} />
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
        <div className={styles.formGroup}>
          <label>Tipo Servicio</label>
          <select name="tipoServicio" value={formData.tipoServicio} onChange={handleChange}>
            <option value="">Seleccionar</option>
            <option value="Particular">Particular</option>
            <option value="Público">Público</option>
            <option value="Público">Diplomático</option>
            <option value="Público">Oficial</option>
            <option value="Público">Especial</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>Color</label>
          <input type="text" name="color" value={formData.color} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label>Número VIN</label>
          <input type="text" name="numeroVin" value={formData.numeroVin} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label>Combustible</label>
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
          <label>Número Motor</label>
          <input type="text" name="numMotor" value={formData.numMotor} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label>Número Chasis</label>
          <input type="text" name="numChasis" value={formData.numChasis} onChange={handleChange} />
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