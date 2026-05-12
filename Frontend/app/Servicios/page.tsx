'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar  from '../Inicio/Sidebar';
import Footer from '../Inicio/Footer';
import styles from '../CSS/Servicios/Servicios.module.css';

/* ── Icons ── */
const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z"/>
  </svg>
);

// Íconos específicos por servicio
const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);
const MapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
    <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
  </svg>
);
const ArchiveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/>
    <line x1="10" y1="12" x2="14" y2="12"/>
  </svg>
);
const PaletteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125C12.97 18.86 13 18.476 13 18c0-.993.808-1.8 1.8-1.8h2.4C19.76 16.2 22 13.96 22 11.2 22 6.17 17.52 2 12 2z"/>
  </svg>
);
const TruckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const CpuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/>
    <line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/>
    <line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/>
    <line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/>
    <line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>
  </svg>
);
const CopyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const XCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);
const CarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h12l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/>
    <circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>
  </svg>
);
const ToolIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);
const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const RepeatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);

/* ── Datos de servicios basados en la imagen oficial ── */
const SERVICES = [
  {
    id: 'matricula',
    num: 1,
    icon: <FileIcon />,
    color: 'azul',
    title: 'Matrícula / Registro',
    short: 'Registro inicial de tu vehículo ante el RUNT.',
    desc: 'Realiza el registro oficial de tu vehículo nuevo o usado. Nos encargamos de toda la documentación, revisión técnico-mecánica y radicación ante el organismo de tránsito del Meta.',
    time: '1–2 días hábiles',
    requisitos: ['Factura de compra o endoso', 'SOAT vigente', 'Revisión técnico-mecánica', 'Cédula del propietario'],
  },
  {
    id: 'traspaso',
    num: 2,
    icon: <RefreshIcon />,
    color: 'verde',
    title: 'Traspaso',
    short: 'Cambio de propietario rápido y sin errores.',
    desc: 'Transfiere legalmente la propiedad de un vehículo. Verificamos el historial del vehículo, gestionamos el paz y salvo y radicamos el cambio ante tránsito.',
    time: '2–3 días hábiles',
    requisitos: ['Licencia de tránsito original', 'Cédulas comprador y vendedor', 'SOAT vigente', 'Paz y salvo multas'],
  },
  {
    id: 'traslado',
    num: 3,
    icon: <MapIcon />,
    color: 'dorado',
    title: 'Translado Matrícula / Registro',
    short: '¿Te mudaste al Meta? Traslada tu matrícula.',
    desc: 'Cambia el organismo de tránsito de tu vehículo a cualquier municipio del departamento del Meta. Ideal para quienes se trasladan por trabajo o residencia.',
    time: '1–2 días hábiles',
    requisitos: ['Licencia de tránsito original', 'SOAT vigente', 'Cédula del propietario', 'Comprobante de domicilio'],
  },
  {
    id: 'radicado',
    num: 4,
    icon: <ArchiveIcon />,
    color: 'azul',
    title: 'Radicado Matrícula / Registro',
    short: 'Radicación oficial de documentos vehiculares.',
    desc: 'Gestión y radicación de documentos de matrícula o registro ante el organismo de tránsito competente. Aseguramos que todo sea correcto desde la primera vez.',
    time: '1 día hábil',
    requisitos: ['Documentos del vehículo', 'Cédula del propietario', 'Formulario diligenciado', 'SOAT vigente'],
  },
  {
    id: 'color',
    num: 5,
    icon: <PaletteIcon />,
    color: 'verde',
    title: 'Cambio de Color',
    short: 'Actualiza el color de tu vehículo en el RUNT.',
    desc: 'Si tu vehículo ha sido repintado o cambió de color, actualizamos el registro oficial. Coordinamos la inspección física y la actualización en el sistema RUNT.',
    time: '2–3 días hábiles',
    requisitos: ['Licencia de tránsito original', 'Cédula del propietario', 'Fotografías del vehículo', 'SOAT vigente'],
  },
  {
    id: 'servicio',
    num: 6,
    icon: <TruckIcon />,
    color: 'dorado',
    title: 'Cambio de Servicio',
    short: 'Cambia de particular a público o viceversa.',
    desc: 'Tramitamos el cambio de categoría de servicio de tu vehículo, ya sea de particular a público o al contrario. Incluye verificación de requisitos específicos por tipo de servicio.',
    time: '3–5 días hábiles',
    requisitos: ['Licencia de tránsito original', 'Cédula del propietario', 'Documentos habilitación', 'SOAT vigente'],
  },
  {
    id: 'motor',
    num: 7,
    icon: <CpuIcon />,
    color: 'azul',
    title: 'Regrabar Motor',
    short: 'Legaliza el número de motor de tu vehículo.',
    desc: 'Trámite de regrabación del número de motor cuando este está borroso o ilegible. Coordinamos la inspección técnica y la actualización ante el organismo de tránsito.',
    time: '3–5 días hábiles',
    requisitos: ['Licencia de tránsito original', 'Cédula del propietario', 'Denuncia si aplica', 'Inspección técnica'],
  },
  {
    id: 'chasis',
    num: 8,
    icon: <ToolIcon />,
    color: 'verde',
    title: 'Regrabar Chasis',
    short: 'Actualiza el número de chasis en el registro.',
    desc: 'Cuando el número de chasis es ilegible o requiere actualización, gestionamos el proceso completo de regrabación e inspección para dejarlo al día ante tránsito.',
    time: '3–5 días hábiles',
    requisitos: ['Licencia de tránsito original', 'Cédula del propietario', 'Inspección física', 'Documentos del fabricante'],
  },
  {
    id: 'transformacion',
    num: 9,
    icon: <RepeatIcon />,
    color: 'dorado',
    title: 'Transformación',
    short: 'Registra modificaciones estructurales del vehículo.',
    desc: 'Si tu vehículo ha sido modificado estructuralmente (carrocería, carrozado, adaptaciones), tramitamos la actualización del registro ante el RUNT y el organismo de tránsito.',
    time: '5–7 días hábiles',
    requisitos: ['Licencia de tránsito original', 'Certificado del taller homologado', 'Inspección técnica', 'Cédula del propietario'],
  },
  {
    id: 'duplicado-licencia',
    num: 10,
    icon: <CopyIcon />,
    color: 'azul',
    title: 'Duplicado Licencia de Tránsito',
    short: 'Reposición por pérdida, robo o deterioro.',
    desc: 'Obtén tu duplicado de licencia de tránsito en caso de pérdida, robo o deterioro del documento. Gestionamos el trámite completo con el organismo de tránsito.',
    time: '1–2 días hábiles',
    requisitos: ['Cédula del propietario', 'Denuncia por pérdida/robo (si aplica)', 'Formulario de solicitud', 'Pago de derechos'],
  },
  {
    id: 'prenda',
    num: 11,
    icon: <ShieldIcon />,
    color: 'verde',
    title: 'Inscripción de Prenda',
    short: 'Registra gravámenes sobre tu vehículo.',
    desc: 'Inscribimos gravámenes prendarios sobre el vehículo, requeridos por entidades financieras al momento de financiar la compra. Trámite rápido y seguro.',
    time: '1–2 días hábiles',
    requisitos: ['Licencia de tránsito original', 'Documento del acreedor', 'Cédula del propietario', 'Contrato de prenda'],
  },
  {
    id: 'levanta-prenda',
    num: 12,
    icon: <XCircleIcon />,
    color: 'dorado',
    title: 'Levanta Prenda',
    short: 'Libera el vehículo de gravámenes prendarios.',
    desc: 'Una vez cancelada la deuda con la entidad financiera, tramitamos el levantamiento de prenda para que tu vehículo quede libre de cualquier gravamen en el RUNT.',
    time: '1–2 días hábiles',
    requisitos: ['Licencia de tránsito original', 'Carta de levantamiento del acreedor', 'Cédula del propietario', 'Paz y salvo de la entidad'],
  },
  {
    id: 'cancelacion',
    num: 13,
    icon: <AlertIcon />,
    color: 'azul',
    title: 'Cancelación Matrícula / Registro',
    short: 'Cancela el registro de vehículos desintegrados.',
    desc: 'Para vehículos que van a ser desintegrados o dados de baja definitivamente, realizamos el proceso de cancelación de la matrícula ante el organismo de tránsito.',
    time: '2–3 días hábiles',
    requisitos: ['Licencia de tránsito original', 'Cédula del propietario', 'Acta de desintegración (si aplica)', 'Placas del vehículo'],
  },
  {
    id: 'cambio-placas',
    num: 14,
    icon: <GridIcon />,
    color: 'verde',
    title: 'Cambio de Placas',
    short: 'Gestiona el cambio de placas de tu vehículo.',
    desc: 'Tramitamos el cambio de placas por las razones que determine el organismo de tránsito, incluyendo homologación al nuevo sistema de placas o por disposición legal.',
    time: '2–3 días hábiles',
    requisitos: ['Licencia de tránsito original', 'Cédula del propietario', 'SOAT vigente', 'Placas actuales'],
  },
  {
    id: 'duplicado-placas',
    num: 15,
    icon: <CopyIcon />,
    color: 'dorado',
    title: 'Duplicado de Placas',
    short: 'Pérdida, robo o deterioro de placas.',
    desc: 'Obtenemos la reposición de placas en caso de pérdida, robo o deterioro. Gestionamos la denuncia, el pago de derechos y la fabricación con el proveedor autorizado.',
    time: '1 día hábil',
    requisitos: ['Licencia de tránsito original', 'Cédula del propietario', 'Denuncia policial (pérdida/robo)', 'SOAT vigente'],
  },
  {
    id: 'rematricula',
    num: 16,
    icon: <StarIcon />,
    color: 'azul',
    title: 'Rematrícula',
    short: 'Reactiva la matrícula de tu vehículo.',
    desc: 'Si tu vehículo tiene la matrícula suspendida o requiere renovación del registro, tramitamos el proceso de rematriculación completo ante el organismo de tránsito.',
    time: '2–3 días hábiles',
    requisitos: ['Cédula del propietario', 'SOAT vigente', 'Revisión técnico-mecánica', 'Pago de derechos'],
  },
  {
    id: 'carroceria',
    num: 17,
    icon: <CarIcon />,
    color: 'verde',
    title: 'Cambio de Carrocería',
    short: 'Actualiza el tipo de carrocería en el RUNT.',
    desc: 'Cuando se cambia la carrocería del vehículo, actualizamos el registro en el RUNT. Coordinamos la inspección técnica y la expedición de la nueva licencia de tránsito.',
    time: '3–5 días hábiles',
    requisitos: ['Licencia de tránsito original', 'Cédula del propietario', 'Certificado del taller', 'Inspección técnica'],
  },
  {
    id: 'otros',
    num: 18,
    icon: <ShieldIcon />,
    color: 'dorado',
    title: 'Otros Trámites',
    short: 'Consulta por el trámite que necesitas.',
    desc: 'Si tu trámite no está en la lista, contáctanos. Contamos con asesores expertos que pueden orientarte sobre cualquier gestión vehicular ante las autoridades de tránsito del Meta.',
    time: 'A consultar',
    requisitos: ['Consulta personalizada', 'Asesoría gratuita', 'Orientación legal', 'Acompañamiento completo'],
  },
] as const;

export default function ServiciosPage() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const toggle = (id: string) => setExpandedId(prev => prev === id ? null : id);

  return (
    <div className={styles.pg}>
      <Sidebar />

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.blobs} aria-hidden>
          <div className={`${styles.blob} ${styles.blob1}`} />
          <div className={`${styles.blob} ${styles.blob2}`} />
          <div className={`${styles.blob} ${styles.blob3}`} />
        </div>
        <div className={styles.grid} aria-hidden />
        <div className={`${styles.heroInner} ${visible ? styles.heroVisible : ''}`}>
          <span className={styles.eyebrow}>Nuestros servicios</span>
          <h1 className={styles.h1}>18 trámites vehiculares<br /><span className={styles.h1Grad}>en el Meta</span></h1>
          <p className={styles.heroP}>
            Desde la matrícula inicial hasta el levantamiento de prenda. Recibe acompañamiento en cada proceso, sin filas y con precio claro.
          </p>
          <div className={styles.heroBtns}>
            <button className={styles.btnPrimary} onClick={() => router.push('/registro')}>
              Crear cuenta gratis <ArrowIcon />
            </button>
            <a href="tel:+573100000000" className={styles.btnGhost}>
              <PhoneIcon /> Llamar ahora
            </a>
          </div>
        </div>
        
      </section>

      {/* ── GRID DE SERVICIOS ── */}
      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionH2}>Todos nuestros trámites</h2>
            <p className={styles.sectionDesc}>Selecciona el servicio que necesitas para ver los detalles y requisitos.</p>
          </div>

          <div className={styles.servGrid}>
            {SERVICES.map((s, i) => (
              <div
                key={s.id}
                id={s.id}
                className={`${styles.servCard} ${styles[`color_${s.color}`]} ${expandedId === s.id ? styles.expanded : ''}`}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className={styles.cardHeader} onClick={() => toggle(s.id)}>
                  <span className={styles.cardNum}>#{s.num}</span>
                  <div className={styles.cardIco}>{s.icon}</div>
                  <div className={styles.cardInfo}>
                    <h3 className={styles.cardTitle}>{s.title}</h3>
                    <p className={styles.cardShort}>{s.short}</p>
                  </div>
                  <div className={styles.cardTime}>
                    <ClockIcon />
                    <span>{s.time}</span>
                  </div>
                  <span className={`${styles.chevron} ${expandedId === s.id ? styles.chevronOpen : ''}`}>
                    <ArrowIcon />
                  </span>
                </div>

                {expandedId === s.id && (
                  <div className={styles.cardBody}>
                    <p className={styles.cardDesc}>{s.desc}</p>
                    <div className={styles.reqSection}>
                      <h4 className={styles.reqTitle}>Documentos requeridos</h4>
                      <ul className={styles.reqList}>
                        {s.requisitos.map(r => (
                          <li key={r}>
                            <span className={styles.reqCheck}><CheckIcon /></span>
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button className={styles.cardCta} onClick={() => router.push('/registro')}>
                      Iniciar trámite <ArrowIcon />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <div className={styles.cta}>
        <div className={styles.ctaGfx} aria-hidden>
          <div className={`${styles.ctaBlob} ${styles.ctaBlob1}`} />
          <div className={`${styles.ctaBlob} ${styles.ctaBlob2}`} />
        </div>
        <div className={styles.ctaText}>
          <h2>¿No encuentras tu trámite?</h2>
          <p>Contáctanos y un asesor te orientará sin costo alguno.</p>
        </div>
        <div className={styles.ctaBtns}>
          <button className={styles.btnWhite} onClick={() => router.push('/registro')}>
            Crear cuenta gratis <ArrowIcon />
          </button>
          <a href="tel:+573100000000" className={styles.btnGhostW}>
            <PhoneIcon /> Llamar ahora
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}