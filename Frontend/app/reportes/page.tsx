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
  const [selectedSede, setSelectedSede] = useState('General');

  const sedesList = ['General', 'Villavicencio', 'Restrepo', 'Acacías', 'Granada', 'Puerto López', 'Guamal'];

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

  // Lógica de filtrado dinámico
  const biMayoRaw = data.biAnalytics?.filter(i => i.PERIODO === '2026-05') || [];
  
  // Si hay sede seleccionada (distinta de General), filtramos los valores de la tabla
  const biMayo = biMayoRaw.map(item => {
    if (selectedSede === 'General') return item;
    
    // Si elegimos una sede, calculamos "VENTAS_MES" solo para esa sede 
    // y "CANTIDAD_TOTAL" solo para esa sede
    const key = selectedSede === 'Villavicencio' ? 'VILLAVO' :
                selectedSede === 'Restrepo' ? 'RESTREPO' :
                selectedSede === 'Acacías' ? 'ACACIAS' :
                selectedSede === 'Granada' ? 'GRANADA' :
                selectedSede === 'Puerto López' ? 'PTO_LOPEZ' : 'GUAMAL';
    
    const qty = item[key] || 0;
    const itemPrice = item.VENTAS_MES / (item.CANTIDAD_TOTAL || 1); // Precio promedio
    
    return {
      ...item,
      VENTAS_MES: qty * itemPrice,
      CANTIDAD_TOTAL: qty,
      // Para la tabla simplificada, mantenemos los otros campos para que no rompa
    };
  }).filter(item => selectedSede === 'General' || item.CANTIDAD_TOTAL > 0);

  const totalVentasMayo = biMayo.reduce((acc, curr) => acc + curr.VENTAS_MES, 0);
  const totalVentasAbril = biMayo.reduce((acc, curr) => acc + (curr.VENTAS_MES_ANTERIOR || 0), 0);
  const crecimientoGlobal = totalVentasAbril > 0 ? (((totalVentasMayo - totalVentasAbril) / totalVentasAbril) * 100).toFixed(1) : '0';
  
  const totalCitasMayo = biMayo.reduce((acc, curr) => acc + curr.CANTIDAD_TOTAL, 0);

  const sedesTotales = {
    Villavicencio: biMayo.reduce((acc, curr) => acc + (curr.VILLAVO || 0), 0),
    Restrepo: biMayo.reduce((acc, curr) => acc + (curr.RESTREPO || 0), 0),
    Acacías: biMayo.reduce((acc, curr) => acc + (curr.ACACIAS || 0), 0),
    Granada: biMayo.reduce((acc, curr) => acc + (curr.GRANADA || 0), 0),
    'Puerto López': biMayo.reduce((acc, curr) => acc + (curr.PTO_LOPEZ || 0), 0),
    Guamal: biMayo.reduce((acc, curr) => acc + (curr.GUAMAL || 0), 0),
  };
  const sedeEstrella = Object.entries(sedesTotales).reduce((a, b) => a[1] > b[1] ? a : b)[0];

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

        {/* ── Mini Bar de Filtros ── */}
        <div className={styles.filterBar}>
          {sedesList.map(sede => (
            <button 
              key={sede}
              className={`${styles.filterTab} ${selectedSede === sede ? styles.activeTab : ''}`}
              onClick={() => setSelectedSede(sede)}
            >
              {sede}
            </button>
          ))}
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

        {/* ── SECCIÓN: CONSOLIDADO {selectedSede.toUpperCase()} ── */}
        <div className={styles.chartCardFull} style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)' }}>
           <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <h3>{selectedSede === 'General' ? 'Consolidado General de Operaciones' : `Rendimiento Individual: ${selectedSede}`}</h3>
                <p className={styles.cardDesc}>
                  {selectedSede === 'General' 
                    ? 'Vista unificada de todas las sedes y municipios del departamento.' 
                    : `Análisis específico de la actividad operativa en la sede de ${selectedSede}.`}
                </p>
              </div>
           </div>
           
           <div className={styles.summaryGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
              <div className={styles.summaryItem}>
                 <div className={styles.summaryIcon} style={{ background: '#e0f2fe', color: '#0369a1' }}><DollarIcon /></div>
                 <div>
                    <span className={styles.summaryLabel}>Recaudación Mayo</span>
                    <h4 className={styles.summaryVal}>${totalVentasMayo.toLocaleString()}</h4>
                    <span className={styles.growthBadgePos} style={{ fontSize: '0.75rem' }}>▲ {crecimientoGlobal}% vs Abril</span>
                 </div>
              </div>
              <div className={styles.summaryItem}>
                 <div className={styles.summaryIcon} style={{ background: '#f0fdf4', color: '#15803d' }}><BarChartIcon /></div>
                 <div>
                    <span className={styles.summaryLabel}>Trámites Procesados</span>
                    <h4 className={styles.summaryVal}>{totalCitasMayo} citas</h4>
                    <small style={{ color: '#64748b' }}>{selectedSede === 'General' ? 'Todas las sedes' : `Sede ${selectedSede}`}</small>
                 </div>
              </div>
              {selectedSede === 'General' && (
                <div className={styles.summaryItem}>
                  <div className={styles.summaryIcon} style={{ background: '#fff7ed', color: '#c2410c' }}><UsersIcon /></div>
                  <div>
                      <span className={styles.summaryLabel}>Sede Líder</span>
                      <h4 className={styles.summaryVal}>{sedeEstrella}</h4>
                      <small style={{ color: '#64748b' }}>Máxima demanda actual</small>
                  </div>
                </div>
              )}
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
                <h3>Rendimiento Estratégico por Municipio</h3>
                <p className={styles.cardDesc}>Análisis comparativo de servicios y crecimiento mensual de ingresos en las diferentes sedes.</p>
              </div>
            </div>

            {/* Guía de Lectura para el Usuario */}
            <div className={styles.biGuide}>
              <div className={styles.guideItem}>
                <div className={`${styles.guideIcon} ${styles.bgBlue}`}><BarChartIcon /></div>
                <div><strong>Ventas</strong><p>Total recaudado este mes</p></div>
              </div>
              <div className={styles.guideItem}>
                <div className={`${styles.guideIcon} ${styles.bgGreen}`}><TrendIcon /></div>
                <div><strong>Crecimiento</strong><p>Comparación vs mes anterior</p></div>
              </div>
              <div className={styles.guideItem}>
                <div className={`${styles.guideIcon} ${styles.bgOrange}`}><UsersIcon /></div>
                <div><strong>Sedes</strong><p>Cantidad de citas por municipio</p></div>
              </div>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.biTable}>
                <thead>
                  <tr>
                    <th>Trámite</th>
                    <th>Abril (Ant.)</th>
                    <th>Mayo (Act.)</th>
                    <th>Crecimiento</th>
                    <th className={styles.colSedes}>Sedes (Total)</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Agrupamos por trámite para comparar meses directamente */}
                  {data.biAnalytics && data.biAnalytics
                    .filter(item => item.PERIODO === '2026-05') // Tomamos los de este mes
                    .map((item, idx) => {
                      const diff = item.VENTAS_MES - (item.VENTAS_MES_ANTERIOR || 0);
                      const pct = item.VENTAS_MES_ANTERIOR 
                        ? ((diff / item.VENTAS_MES_ANTERIOR) * 100).toFixed(1) 
                        : 'N/A';
                      const isPositive = !item.VENTAS_MES_ANTERIOR || diff >= 0;
                      const totalSedes = (item.VILLAVO || 0) + (item.RESTREPO || 0) + (item.ACACIAS || 0) + (item.GRANADA || 0) + (item.PTO_LOPEZ || 0) + (item.GUAMAL || 0);

                      return (
                        <tr key={idx}>
                          <td><strong>{item.TRAMITE_DESC}</strong></td>
                          <td className={styles.oldVal}>
                            {item.VENTAS_MES_ANTERIOR ? `$${item.VENTAS_MES_ANTERIOR.toLocaleString()}` : '-'}
                          </td>
                          <td className={styles.incomeVal}>${item.VENTAS_MES.toLocaleString()}</td>
                          <td>
                            {item.VENTAS_MES_ANTERIOR ? (
                              <span className={isPositive ? styles.growthBadgePos : styles.growthBadgeNeg}>
                                {isPositive ? '▲' : '▼'} {pct}%
                              </span>
                            ) : (
                              <span className={styles.growthBadgeNone}>Nuevo</span>
                            )}
                          </td>
                          <td className={styles.colSedes}>{totalSedes}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Matriz de Distribución por Sede (SOLO EN VISTA GENERAL) */}
          {selectedSede === 'General' && (
            <div className={styles.chartCardFull}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <h3>Distribución Geográfica de Trámites</h3>
                  <p className={styles.cardDesc}>Comparativa directa de la demanda de cada trámite entre los diferentes municipios (Mayo 2026).</p>
                </div>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.biTable}>
                  <thead>
                    <tr>
                      <th>Trámite</th>
                      <th style={{ textAlign: 'center' }}>Villavo</th>
                      <th style={{ textAlign: 'center' }}>Restrepo</th>
                      <th style={{ textAlign: 'center' }}>Acacías</th>
                      <th style={{ textAlign: 'center' }}>Granada</th>
                      <th style={{ textAlign: 'center' }}>Pto. López</th>
                      <th style={{ textAlign: 'center' }}>Guamal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {biMayoRaw.map((item, idx) => (
                      <tr key={idx}>
                        <td><strong>{item.TRAMITE_DESC}</strong></td>
                        <td className={item.VILLAVO > 0 ? styles.activeCell : ''} style={{ textAlign: 'center' }}>{item.VILLAVO || 0}</td>
                        <td className={item.RESTREPO > 0 ? styles.activeCell : ''} style={{ textAlign: 'center' }}>{item.RESTREPO || 0}</td>
                        <td className={item.ACACIAS > 0 ? styles.activeCell : ''} style={{ textAlign: 'center' }}>{item.ACACIAS || 0}</td>
                        <td className={item.GRANADA > 0 ? styles.activeCell : ''} style={{ textAlign: 'center' }}>{item.GRANADA || 0}</td>
                        <td className={item.PTO_LOPEZ > 0 ? styles.activeCell : ''} style={{ textAlign: 'center' }}>{item.PTO_LOPEZ || 0}</td>
                        <td className={item.GUAMAL > 0 ? styles.activeCell : ''} style={{ textAlign: 'center' }}>{item.GUAMAL || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Fila Inferior: Cuellos de Botella y Carga Semanal (PEGADOS) */}
          <div className={styles.sideBySideRow}>
            {/* Cuellos de Botella */}
            <div className={styles.chartCardHalf}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <h3>Eficiencia por Sede <AlertIcon /></h3>
                  <p className={styles.cardDesc}>Tiempos promedio de espera (días).</p>
                </div>
              </div>
              <div className={styles.bottleneckList}>
                {data.bottlenecks && data.bottlenecks
                  .filter(item => selectedSede === 'General' || item.NOMBREMUNICIPIO === selectedSede)
                  .map((item, i) => (
                    <div key={i} className={`${styles.bottleneckItem} ${item.DIAS_PROMEDIO_ESPERA > 3 ? styles.itemBad : styles.itemGood}`}>
                      <div className={styles.bottleneckInfo}>
                        <strong>{item.NOMBRESEDE}</strong>
                        <p>{item.NOMBREMUNICIPIO}</p>
                      </div>
                      <div className={styles.bottleneckValue}>
                        <span>{item.DIAS_PROMEDIO_ESPERA} días</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Demanda por Día */}
            <div className={styles.chartCardHalf}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <h3>Carga Semanal <TrendIcon /></h3>
                  <p className={styles.cardDesc}>Saturación por día (General).</p>
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
                        style={{ width: `${item.PORCENTAJE_CARGA}%`, background: 'linear-gradient(90deg, #1565C0, #1E88E5)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
