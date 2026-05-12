'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../CSS/Admin/Reportes.module.css';
import { BACKEND_URL } from '@/lib/config';

/* ── Icons ── */
const BarChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const TrendingUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);
const DollarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

interface ReportData {
  estados: { estado: string; cantidad: number }[];
  tipos: { tipo: string; cantidad: number }[];
  citasEstado: { estado: string; cantidad: number }[];
  ingresos: { tipo: string; total: number }[];
  asesores: { asesor: string; citasAtendidas: number }[];
  general: {
    totalVehiculos: number;
    totalClientes: number;
    citasPendientes: number;
  };
}

export default function ReportesPage() {
  const router = useRouter();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userRole = sessionStorage.getItem('userRole');

    // Si no está logueado o es un cliente/asesor, no tiene permisos
    if (!isLoggedIn || userRole === '1' || userRole === '2') {
      console.log('Acceso denegado a reportes');
      router.push('/dashboard');
      return;
    }
    
    cargarReportes();
  }, []);

  const cargarReportes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/reportes/stats`);
      const result = await response.json();
      if (response.ok && result.status === 'OK') {
        setData(result.data);
      } else {
        setError(result.mensaje || 'Error al cargar estadísticas');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.loading}>Analizando datos del sistema...</div>;
  if (!data) return <div className={styles.error}>{error}</div>;

  const totalIngresos = data.ingresos.reduce((acc, curr) => acc + curr.total, 0);

  // ── Preparar Estados de Trámites ──
  const estadosBase = ['PENDIENTE', 'ACTIVO', 'FINALIZADO', 'CANCELADO'];
  const estadosDB = data.estados.map(e => ({ 
    estado: e.estado.toUpperCase(), 
    cantidad: e.cantidad 
  }));
  const estadosVisualizar = estadosBase.map(eb => {
    const real = estadosDB.find(e => e.estado === eb);
    return { estado: eb, cantidad: real ? real.cantidad : 0 };
  });
  estadosDB.forEach(e => {
    if (!estadosBase.includes(e.estado)) estadosVisualizar.push(e);
  });

  // ── Preparar Estados de Citas (Según tu configuración) ──
  const citasBase = ['PENDIENTE', 'AGENDADA', 'POSPUESTA', 'CANCELADA', 'ATENDIDA'];
  const citasDB = data.citasEstado.map(e => ({
    estado: e.estado.toUpperCase(),
    cantidad: e.cantidad
  }));
  const citasVisualizar = citasBase.map(cb => {
    const real = citasDB.find(e => e.estado === cb);
    return { estado: cb, cantidad: real ? real.cantidad : 0 };
  });

  return (
    <div className={styles.container}>
      <div className={styles.inner}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <Link href="/dashboard-admin" className={styles.backBtn}>
            <ArrowLeftIcon /> Volver
          </Link>
          <div className={styles.titleArea}>
            <div className={styles.iconBox}><BarChartIcon /></div>
            <div>
              <h1>Reportes de Gestión</h1>
              <p>Estadísticas en tiempo real del MPE Track System</p>
            </div>
          </div>
        </div>

        {/* ── KPIs Rápidos ── */}
        <div className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <p>Total Ingresos</p>
            <h3>${totalIngresos.toLocaleString()}</h3>
            <span className={styles.trend}><TrendingUpIcon /> Rendimiento total</span>
          </div>
          <div className={styles.kpiCard}>
            <p>Clientes Activos</p>
            <h3>{data.general.totalClientes}</h3>
            <span>Registrados en el sistema</span>
          </div>
          <div className={styles.kpiCard}>
            <p>Vehículos en Inventario</p>
            <h3>{data.general.totalVehiculos}</h3>
            <span>En base de datos</span>
          </div>
          <div className={styles.kpiCard}>
            <p>Citas Pendientes</p>
            <h3>{data.general.citasPendientes}</h3>
            <span className={styles.warning}>Requieren atención</span>
          </div>
        </div>

        <div className={styles.chartsGrid}>
          
          {/* ── Estados de Trámites ── */}
          <div className={styles.chartCard}>
            <h3>Distribución de Trámites</h3>
            <div className={styles.barList}>
              {estadosVisualizar.map((item) => (
                <div key={item.estado} className={styles.barItem}>
                  <div className={styles.barLabel}>
                    <span>{item.estado}</span>
                    <span>{item.cantidad}</span>
                  </div>
                  <div className={styles.barTrack}>
                    <div 
                      className={styles.barFill} 
                      style={{ 
                        width: `${item.cantidad > 0 ? (item.cantidad / Math.max(...estadosVisualizar.map(e => e.cantidad))) * 100 : 0}%`,
                        background: item.estado === 'PENDIENTE' ? '#f59e0b' : item.estado === 'ACTIVO' ? '#3b82f6' : '#10b981'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Distribución de Citas ── */}
          <div className={styles.chartCard}>
            <h3>Distribución de Citas</h3>
            <div className={styles.barList}>
              {citasVisualizar.map((item) => (
                <div key={item.estado} className={styles.barItem}>
                  <div className={styles.barLabel}>
                    <span>{item.estado}</span>
                    <span>{item.cantidad}</span>
                  </div>
                  <div className={styles.barTrack}>
                    <div 
                      className={styles.barFill} 
                      style={{ 
                        width: `${item.cantidad > 0 ? (item.cantidad / Math.max(...citasVisualizar.map(e => e.cantidad))) * 100 : 0}%`,
                        background: item.estado === 'ATENDIDA' ? '#10b981' : item.estado === 'CANCELADA' ? '#ef4444' : '#6366f1'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Trámites por Tipo ── */}
          <div className={styles.chartCard}>
            <h3>Trámites por Tipo de Servicio</h3>
            <div className={styles.barList}>
              {data.tipos.length > 0 ? data.tipos.map((item) => (
                <div key={item.tipo} className={styles.barItem}>
                  <div className={styles.barLabel}>
                    <span>{item.tipo}</span>
                    <span>{item.cantidad}</span>
                  </div>
                  <div className={styles.barTrack}>
                    <div 
                      className={`${styles.barFill} ${styles.purpleBar}`} 
                      style={{ width: `${(item.cantidad / Math.max(...data.tipos.map(e => e.cantidad))) * 100}%` }}
                    />
                  </div>
                </div>
              )) : (
                <div className={styles.emptyInternal}>No hay trámites registrados aún.</div>
              )}
            </div>
          </div>

          {/* ── Ingresos por Tipo ── */}

          {/* ── Ingresos por Tipo ── */}
          <div className={styles.chartCard}>
            <h3>Ingresos por Tipo de Trámite</h3>
            <div className={styles.incomeList}>
              {data.ingresos.map((item) => (
                <div key={item.tipo} className={styles.incomeItem}>
                  <div className={styles.incomeIcon}><DollarIcon /></div>
                  <div className={styles.incomeInfo}>
                    <strong>{item.tipo}</strong>
                    <p>${item.total.toLocaleString()}</p>
                  </div>
                  <div className={styles.percentage}>
                    {((item.total / totalIngresos) * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Rendimiento de Asesores ── */}
          <div className={styles.chartCardFull}>
            <h3>Rendimiento de Asesores (Citas Atendidas)</h3>
            <div className={styles.asesorGrid}>
              {data.asesores.map((asesor, index) => (
                <div key={asesor.asesor} className={styles.asesorCard}>
                  <div className={styles.rank}>#{index + 1}</div>
                  <div className={styles.asesorInfo}>
                    <strong>{asesor.asesor}</strong>
                    <p>{asesor.citasAtendidas} citas completadas</p>
                  </div>
                  <div className={styles.miniBar}>
                    <div 
                      className={styles.miniBarFill} 
                      style={{ width: `${(asesor.citasAtendidas / data.asesores[0].citasAtendidas) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
