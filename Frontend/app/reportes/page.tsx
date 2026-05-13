'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../CSS/Admin/Reportes.module.css';
import { BACKEND_URL } from '@/lib/config';

/* ── Icons Limpios ── */
const BarChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
  </svg>
);
const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
  </svg>
);
const DollarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const CarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>
  </svg>
);
const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const TrendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);

/* ── Doughnut Chart Component Compacto ── */
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
                strokeWidth="15"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 50 50)"
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
    citasPendientes: number;
    totalVehiculos: number;
    totalClientes: number;
  };
  biAnalytics: any[];
  bottlenecks: { NOMBRESEDE: string; NOMBREMUNICIPIO: string; DIAS_PROMEDIO_ESPERA: number; CITAS_PROCESADAS: number }[];
  dailyDemand: { DIA_SEMANA: string; TOTAL_CITAS: number; PORCENTAJE_CARGA: number }[];
}

export default function ReportesPage() {
  const router = useRouter();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
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

  if (loading) return <div className={styles.loading}>Analizando datos...</div>;
  if (!data) return <div className={styles.loading}>{error}</div>;

  const totalIngresos = data.ingresos.reduce((acc, curr) => acc + curr.total, 0);
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
              <h1>Reportes de Gestión</h1>
              <p>MPE System · Dashboard Administrativo</p>
            </div>
          </div>
          <Link href="/dashboard-admin" className={styles.backBtn}>
            <ArrowLeftIcon /> Volver al Dashboard
          </Link>
        </div>

        {/* ── KPIs ── */}
        <div className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <div className={styles.kpiIcon}><DollarIcon /></div>
            <div className={styles.kpiInfo}>
              <h3>${totalIngresos.toLocaleString()}</h3>
              <p>Ingresos</p>
            </div>
          </div>
          <div className={styles.kpiCard}>
            <div className={styles.kpiIcon}><ClockIcon /></div>
            <div className={styles.kpiInfo}>
              <h3>{data.general.citasPendientes}</h3>
              <p>Pendientes</p>
            </div>
          </div>
          <div className={styles.kpiCard}>
            <div className={styles.kpiIcon}><UsersIcon /></div>
            <div className={styles.kpiInfo}>
              <h3>{data.general.totalClientes}</h3>
              <p>Clientes</p>
            </div>
          </div>
          <div className={styles.kpiCard}>
            <div className={styles.kpiIcon}><CarIcon /></div>
            <div className={styles.kpiInfo}>
              <h3>{data.general.totalVehiculos}</h3>
              <p>Vehículos</p>
            </div>
          </div>
        </div>

        <div className={styles.chartsGrid}>
          {/* Distribución de Trámites */}
          <div className={styles.chartCard}>
            <h3>Distribución de Trámites</h3>
            <DoughnutChart 
              data={data.estados.map(e => ({ label: e.estado, value: e.cantidad }))} 
              colors={palette}
            />
          </div>

          {/* Estado de Citas */}
          <div className={styles.chartCard}>
            <h3>Estado de Citas</h3>
            <DoughnutChart 
              data={data.citasEstado.map(e => ({ label: e.estado, value: e.cantidad }))} 
              colors={['#10b981', '#f59e0b', '#1565C0', '#ef4444', '#94a3b8']}
            />
          </div>

          {/* Trámites por Servicio */}
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
                        width: `${(item.cantidad / Math.max(...data.tipos.map(e => e.cantidad))) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ingresos por Trámite */}
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

          {/* Rendimiento Asesores */}
          <div className={styles.chartCardFull}>
            <h3>Rendimiento de Asesores</h3>
            <div className={styles.asesorGrid}>
              {data.asesores.map((asesor) => (
                <div key={asesor.asesor} className={styles.asesorCard}>
                  <div className={styles.asesorInfo}>
                    <strong>{asesor.asesor}</strong>
                    <p>Citas atendidas en el sistema</p>
                  </div>
                  <div className={styles.miniStat}>
                    <strong>{asesor.citasAtendidas}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analítica Avanzada por Municipios (NUEVO) */}
          <div className={styles.chartCardFull}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <h3>Inteligencia Operativa por Municipio</h3>
                <p className={styles.cardDesc}>Análisis matricial de ventas y crecimiento comparativo mensual procesado en tiempo real por PL/SQL.</p>
              </div>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.biTable}>
                <thead>
                  <tr>
                    <th>Mes</th>
                    <th>Trámite</th>
                    <th>Ventas</th>
                    <th>Crecimiento</th>
                    <th className={styles.colVillavo}>Villavo</th>
                    <th className={styles.colRestrepo}>Restrepo</th>
                    <th className={styles.colAcacias}>Acacías</th>
                    <th className={styles.colGranada}>Granada</th>
                    <th className={styles.colLopez}>Pto. López</th>
                    <th className={styles.colGuamal}>Guamal</th>
                  </tr>
                </thead>
                <tbody>
                  {data.biAnalytics && data.biAnalytics.map((item, idx) => {
                    const diff = item.VENTAS_MES - (item.VENTAS_MES_ANTERIOR || 0);
                    const pct = item.VENTAS_MES_ANTERIOR 
                      ? ((diff / item.VENTAS_MES_ANTERIOR) * 100).toFixed(1) 
                      : 'N/A';
                    const isPositive = !item.VENTAS_MES_ANTERIOR || diff >= 0;

                    return (
                      <tr key={idx}>
                        <td><strong>{item.PERIODO}</strong></td>
                        <td>{item.TRAMITE_DESC}</td>
                        <td className={styles.incomeVal}>${item.VENTAS_MES.toLocaleString()}</td>
                        <td className={isPositive ? styles.positive : styles.negative}>
                          {item.VENTAS_MES_ANTERIOR ? (isPositive ? '▲ ' : '▼ ') : ''}
                          {pct}{item.VENTAS_MES_ANTERIOR ? '%' : ''}
                        </td>
                        <td className={styles.colVillavo}>{item.VILLAVO || 0}</td>
                        <td className={styles.colRestrepo}>{item.RESTREPO || 0}</td>
                        <td className={styles.colAcacias}>{item.ACACIAS || 0}</td>
                        <td className={styles.colGranada}>{item.GRANADA || 0}</td>
                        <td className={styles.colLopez}>{item.PTO_LOPEZ || 0}</td>
                        <td className={styles.colGuamal}>{item.GUAMAL || 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cuellos de Botella (NUEVO) */}
          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <h3>Cuellos de Botella <AlertIcon /></h3>
                <p className={styles.cardDesc}>Tiempo promedio de espera desde que el cliente solicita la cita hasta que es atendido en la sede.</p>
              </div>
            </div>
            <div className={styles.bottleneckList}>
              {data.bottlenecks && data.bottlenecks.map((item, i) => (
                <div key={i} className={styles.bottleneckItem}>
                  <div className={styles.bottleneckInfo}>
                    <strong>{item.NOMBRESEDE}</strong>
                    <p>{item.NOMBREMUNICIPIO}</p>
                  </div>
                  <div className={styles.bottleneckValue}>
                    <span className={item.DIAS_PROMEDIO_ESPERA > 3 ? styles.negative : styles.positive}>
                      {item.DIAS_PROMEDIO_ESPERA} días
                    </span>
                    <small>Promedio</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Demanda por Día (NUEVO) */}
          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <h3>Distribución de Carga Semanal <TrendIcon /></h3>
                <p className={styles.cardDesc}>Mapeo de saturación por día de la semana para optimizar la asignación de asesores.</p>
              </div>
            </div>
            <div className={styles.barList}>
              {data.dailyDemand && data.dailyDemand.map((item, i) => (
                <div key={i} className={styles.barItem}>
                  <div className={styles.barLabel}>
                    <span style={{ textTransform: 'capitalize' }}>{item.DIA_SEMANA}</span>
                    <span>{item.PORCENTAJE_CARGA}%</span>
                  </div>
                  <div className={styles.barTrack}>
                    <div 
                      className={styles.barFill} 
                      style={{ width: `${item.PORCENTAJE_CARGA}%`, background: '#6366f1' }}
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
