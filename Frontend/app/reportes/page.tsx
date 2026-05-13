'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../CSS/Admin/Reportes.module.css';
import { BACKEND_URL } from '@/lib/config';

/* ── Technical Icons ── */
const BarChartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const DollarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

/* ── Custom Doughnut Chart Component ── */
const DoughnutChart = ({ data, colors }: { data: { label: string, value: number }[], colors: string[] }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  let currentOffset = 0;
  
  return (
    <div className={styles.chartFlex}>
      <div className={styles.doughnutContainer}>
        <svg viewBox="0 0 100 100" className={styles.doughnutSvg}>
          {data.map((item, i) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            const strokeDasharray = `${percentage} ${100 - percentage}`;
            const strokeDashoffset = -currentOffset;
            currentOffset += percentage;
            
            return (
              <circle
                key={i}
                cx="50" cy="50" r="40"
                fill="transparent"
                stroke={colors[i % colors.length]}
                strokeWidth="10"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 50 50)"
                className={styles.doughnutSegment}
              />
            );
          })}
        </svg>
        <div className={styles.doughnutCenter}>
          <span>Total</span>
          <strong>{total}</strong>
        </div>
      </div>
      <div className={styles.legend}>
        {data.map((item, i) => (
          <div key={i} className={styles.legendItem}>
            <div className={styles.legendLabel}>
              <span className={styles.dot} style={{ background: colors[i % colors.length] }} />
              {item.label}
            </div>
            <div className={styles.legendValue}>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

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
    const userRole = sessionStorage.getItem('userRol'); // Corregido key de sessionStorage

    if (!isLoggedIn || userRole !== '3') {
      router.push('/login');
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
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.loading}>Cargando analítica del sistema...</div>;
  if (!data) return <div className={styles.loading}>{error}</div>;

  const totalIngresos = data.ingresos.reduce((acc, curr) => acc + curr.total, 0);

  // Colores para las gráficas
  const palette = ['#1565C0', '#F57C00', '#2E7D32', '#C62828', '#6366f1'];

  return (
    <div className={styles.container}>
      <div className={styles.grid} aria-hidden />
      <div className={styles.inner}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <div className={styles.iconBox}><BarChartIcon /></div>
            <div>
              <h1>Analítica de Gestión</h1>
              <p>Métricas operativas y financieras actualizadas</p>
            </div>
          </div>
          <Link href="/dashboard-admin" className={styles.backBtn}>
            <ArrowLeftIcon /> Volver al Dashboard
          </Link>
        </div>

        {/* ── KPIs ── */}
        <div className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <p>Ingresos Totales</p>
            <h3>${totalIngresos.toLocaleString()}</h3>
            <span className={styles.trend}>📈 En crecimiento</span>
          </div>
          <div className={styles.kpiCard}>
            <p>Citas Pendientes</p>
            <h3>{data.general.citasPendientes}</h3>
            <span className={styles.warning}>⚠️ Revisar hoy</span>
          </div>
          <div className={styles.kpiCard}>
            <p>Base de Clientes</p>
            <h3>{data.general.totalClientes}</h3>
            <span>👥 Activos</span>
          </div>
          <div className={styles.kpiCard}>
            <p>Flota Registrada</p>
            <h3>{data.general.totalVehiculos}</h3>
            <span>🚗 Vehículos</span>
          </div>
        </div>

        <div className={styles.chartsGrid}>
          
          {/* ── Distribución de Trámites (Doughnut) ── */}
          <div className={styles.chartCard}>
            <h3>Distribución de Trámites</h3>
            <DoughnutChart 
              data={data.estados.map(e => ({ label: e.estado, value: e.cantidad }))} 
              colors={palette}
            />
          </div>

          {/* ── Distribución de Citas (Doughnut) ── */}
          <div className={styles.chartCard}>
            <h3>Estado de Citas</h3>
            <DoughnutChart 
              data={data.citasEstado.map(e => ({ label: e.estado, value: e.cantidad }))} 
              colors={['#10b981', '#f59e0b', '#6366f1', '#ef4444', '#94a3b8']}
            />
          </div>

          {/* ── Trámites por Tipo (Technical Bars) ── */}
          <div className={styles.chartCard}>
            <h3>Trámites por Servicio</h3>
            <div className={styles.barList}>
              {data.tipos.map((item) => (
                <div key={item.tipo} className={styles.barItem}>
                  <div className={styles.barLabel}>
                    <span>{item.tipo}</span>
                    <span>{item.cantidad}</span>
                  </div>
                  <div className={styles.barTrack}>
                    <div 
                      className={styles.barFill} 
                      style={{ 
                        width: `${(item.cantidad / Math.max(...data.tipos.map(e => e.cantidad))) * 100}%`,
                        background: '#1565C0'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Ingresos por Tipo ── */}
          <div className={styles.chartCard}>
            <h3>Ingresos por Trámite</h3>
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
            <h3>Productividad de Asesores</h3>
            <div className={styles.asesorGrid}>
              {data.asesores.map((asesor) => (
                <div key={asesor.asesor} className={styles.asesorCard}>
                  <div className={styles.asesorInfo}>
                    <strong>{asesor.asesor}</strong>
                    <p>Asesor de Trámites</p>
                  </div>
                  <div className={styles.miniStat}>
                    <strong>{asesor.citasAtendidas}</strong>
                    <p>Atendidas</p>
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
