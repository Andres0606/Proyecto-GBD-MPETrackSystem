'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../CSS/vehiculos/Vehiculos.module.css';
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
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

interface Vehiculo {
  placa: string;
  marca: string;
  linea: string;
  modelo: number;
  clase: string;
  tipoServicio: string;
  numMotor: string;
  numChasis: string;
  color?: string;
  estado?: string;
  prendado?: string;
  numeroVin?: string;
  combustible?: string;
}

export default function VehiculosPage() {
  const router = useRouter();
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const idCliente = typeof window !== 'undefined' ? sessionStorage.getItem('userCedula') : null;

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn || !idCliente) { router.push('/login'); return; }
    cargarVehiculos();
  }, []);

  const cargarVehiculos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/vehiculos/cliente/${idCliente}`);
      const data = await response.json();
      setVehiculos(Array.isArray(data.vehiculos) ? data.vehiculos : []);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar los vehículos');
      setVehiculos([]);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoClass = (estado?: string) =>
    estado === 'CANCELADO' ? styles.estadoCancelado : styles.estadoActivo;

  const getEstadoTexto = (estado?: string) =>
    estado === 'CANCELADO' ? 'Matrícula Cancelada' : 'Activo';

  const handleRegistrar = () => router.push('/vehiculos/registrar');

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Cargando vehículos...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.inner}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.logoMark}><CarIcon /></span>
            <span className={styles.logoText}>Trans<strong>Meta</strong></span>
          </div>
          <div className={styles.headerRight}>
            <Link href="/dashboard" className={styles.backButton}>
              <ArrowLeftIcon /> Volver al Dashboard
            </Link>
            <button onClick={handleRegistrar} className={styles.registrarButton}>
              <PlusIcon /> Registrar Vehículo
            </button>
          </div>
        </div>

        {/* ── Page title ── */}
        <div className={styles.pageTitleRow}>
          <div className={styles.pageIcon}><CarIcon /></div>
          <div>
            <h1 className={styles.pageTitle}>Mis Vehículos</h1>
            <p className={styles.pageSub}>Administra los vehículos asociados a tu cuenta</p>
          </div>
        </div>

        {/* ── Error ── */}
        {error && <div className={styles.errorAlert}>{error}</div>}

        {/* ── Contenido ── */}
        {vehiculos.length === 0 ? (
          <div className={styles.emptyState}>
            <CarIcon />
            <h3>No tienes vehículos registrados</h3>
            <p>Registra tu primer vehículo para comenzar</p>
            <button onClick={handleRegistrar} className={styles.emptyButton}>
              <PlusIcon /> Registrar Vehículo
            </button>
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {vehiculos.map((v) => (
                <div
                  key={v.placa}
                  className={`${styles.card} ${v.estado === 'CANCELADO' ? styles.cardCancelado : ''}`}
                >
                  <div className={styles.cardHeader}>
                    <CarIcon />
                    <h3>{v.marca} {v.linea}</h3>
                    <div className={styles.badgesGroup}>
                      <span className={`${styles.estadoBadge} ${getEstadoClass(v.estado)}`}>
                        {getEstadoTexto(v.estado)}
                      </span>
                      {v.prendado === 'S' && (
                        <span className={styles.prendaBadge}>Prendado</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.cardContent}>
                    <p><strong>Placa</strong>        <span>{v.placa}</span></p>
                    <p><strong>Modelo</strong>       <span>{v.modelo}</span></p>
                    <p><strong>Clase</strong>        <span>{v.clase}</span></p>
                    <p><strong>Tipo servicio</strong><span>{v.tipoServicio}</span></p>
                    {v.color && <p><strong>Color</strong><span>{v.color}</span></p>}
                    <p><strong>Núm. Motor</strong>   <span>{v.numMotor || 'No registrado'}</span></p>
                    <p><strong>Núm. Chasis</strong>  <span>{v.numChasis || 'No registrado'}</span></p>
                    {v.numeroVin && (
                    <p>
                      <strong>Núm. Vin</strong>
                      <span>{v.numeroVin}</span>
                    </p>
                  )}

                  {v.combustible && (
                    <p>
                      <strong>Combustible</strong>
                      <span>{v.combustible}</span>
                    </p>
                  )}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.footerButton}>
              <button onClick={handleRegistrar} className={styles.addButton}>
                <PlusIcon /> Agregar otro vehículo
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}