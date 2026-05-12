'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../Inicio/Sidebar';
import Footer from '../Inicio/Footer';
import styles from '../CSS/Sedes/Sedes.module.css';

/* ── Icons ── */
const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z"/>
  </svg>
);
const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const WhatsappIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.558 4.136 1.535 5.874L.057 23.215a.5.5 0 0 0 .63.63l5.34-1.478A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.95 0-3.77-.525-5.33-1.44l-.38-.226-3.938 1.09 1.09-3.938-.226-.38A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
  </svg>
);
const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const BuildingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
  </svg>
);
const ZapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const SEDES = [
  {
    id: 'villavicencio',
    nombre: 'Villavicencio',
    tipo: 'oficina',
    tag: 'Oficina Principal',
    color: 'azul',
    short: 'Sede central con atención presencial. Todos los trámites vehiculares disponibles en un solo lugar.',
    direccion: 'Calle 3C #29-21 Barrio Coralina',
    telefono: '+57 311 469 1980',
    correo: 'transmeta@hotmail.com',
    horario: 'Lun – Vie · 8:00 am – 6:00 pm · Sáb 8:00 am – 1:00 pm',
    mapsUrl: 'https://maps.app.goo.gl/miNucAYGVjiu7AqT6',
    servicios: [
      'Atención presencial en oficina',
      'Todos los trámites vehiculares',
      'Asesoría especializada',
    ],
  },
  {
    id: 'restrepo',
    nombre: 'Restrepo',
    tipo: 'cobertura',
    tag: 'Zona de Cobertura',
    color: 'verde',
    short: 'Gestión asistida para trámites que deben realizarse en Restrepo. Un agente te orienta, revisa tus documentos y coordina el trámite para reducir desplazamientos innecesarios.',
    direccion: null,
    telefono: '+57 311 469 1980',
    correo: 'transmeta@hotmail.com',
    horario: 'Lun – Vie · 8:00 am – 5:00 pm',
    mapsUrl: 'https://maps.google.com/?q=Restrepo+Meta+Colombia',
    servicios: [
      'Acompañamiento personalizado',
      'Revisión previa de documentos',
      'Coordinación de firmas o huellas cuando aplique',
      'Gestión del trámite en Restrepo',
    ],
  },
  {
    id: 'acacias',
    nombre: 'Acacias',
    tipo: 'cobertura',
    tag: 'Zona de Cobertura',
    color: 'verde',
    short: 'Gestión asistida para trámites que deben realizarse en Acacías. Un agente te orienta, revisa tus documentos y coordina el proceso.',    direccion: null,
    telefono: '+57 311 469 1980',
    correo: 'transmeta@hotmail.com',
    horario: 'Lun – Vie · 8:00 am – 5:00 pm',
    mapsUrl: 'https://maps.google.com/?q=Acacias+Meta+Colombia',
    servicios: [
      'Acompañamiento personalizado',
      'Revisión previa de documentos',
      'Coordinación de firmas o huellas cuando aplique',
      'Gestión del trámite en Acacias',
    ],
  },
  {
    id: 'guamal',
    nombre: 'Guamal',
    tipo: 'cobertura',
    tag: 'Zona de Cobertura',
    color: 'verde',
    short: 'Acompañamiento para trámites que deben gestionarse en Guamal. Revisamos tus documentos y te guiamos en cada paso.',    direccion: null,
    telefono: '+57 311 469 1980',
    correo: 'transmeta@hotmail.com',
    horario: 'Lun – Vie · 8:00 am – 5:00 pm',
    mapsUrl: 'https://maps.google.com/?q=Guamal+Meta+Colombia',
    servicios: [
      'Acompañamiento personalizado',
      'Revisión previa de documentos',
      'Coordinación de firmas o huellas cuando aplique',
      'Gestión del trámite en Guamal',
    ],
  },
  {
    id: 'granada',
    nombre: 'Granada',
    tipo: 'cobertura',
    tag: 'Zona de Cobertura',
    color: 'verde',
    short: 'Gestión asistida para trámites que deben realizarse en Granada. Un agente coordina el proceso y evita desplazamientos innecesarios.',    direccion: null,
    telefono: '+57 311 469 1980',
    correo: 'transmeta@hotmail.com',
    horario: 'Lun – Vie · 8:00 am – 5:00 pm',
    mapsUrl: 'https://maps.google.com/?q=Granada+Meta+Colombia',
    servicios: [
      'Acompañamiento personalizado',
      'Revisión previa de documentos',
      'Coordinación de firmas o huellas cuando aplique',
      'Gestión del trámite en Granada',
    ],
  },
  {
    id: 'lopez',
    nombre: 'Puerto López',
    tipo: 'cobertura',
    tag: 'Zona de Cobertura',
    color: 'verde',
    short: 'Acompañamiento para trámites que deben gestionarse en Puerto López. Un agente te orienta durante todo el proceso.',    direccion: null,
    telefono: '+57 311 469 1980',
    correo: 'transmeta@hotmail.com',
    horario: 'Lun – Vie · 8:00 am – 5:00 pm',
    mapsUrl: 'https://maps.google.com/?q=Puerto+Lopez+Meta+Colombia',
    servicios: [
      'Acompañamiento personalizado',
      'Revisión previa de documentos',
      'Coordinación de firmas o huellas cuando aplique',
      'Gestión del trámite en Pto. López',
    ],
  },
];

export default function SedesPage() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [activeSede, setActiveSede] = useState(SEDES[0].id);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && SEDES.find(s => s.id === hash)) setActiveSede(hash);
  }, []);

  const sede = SEDES.find(s => s.id === activeSede)!;

  const handleTabClick = (id: string) => {
    setActiveSede(id);
    window.history.replaceState(null, '', `#${id}`);
  };

  return (
    <div className={styles.pg}>
      <Sidebar />

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={`${styles.heroInner} ${visible ? styles.heroVisible : ''}`}>
          <span className={styles.eyebrow}>Dónde estamos</span>
          <h1 className={styles.h1}>Presencia en 6 municipios<br /><span className={styles.h1Grad}>del departamento del Meta</span></h1>
          <p className={styles.heroP}>
            Oficina central en Villavicencio y cobertura remota en Restrepo, Acacias, Guamal, Granada y Puerto López. Sin filas, sin desplazamientos innecesarios.
          </p>
          <div className={styles.heroBtns}>
            <button className={styles.btnPrimary} onClick={() => router.push('/registro')}>
              Crear cuenta gratis <ArrowIcon />
            </button>
            <a href="tel:+573114691980" className={styles.btnGhost}>
              <PhoneIcon /> Llamar ahora
            </a>
          </div>
        </div>
      </section>

      {/* ── TABS + PANEL ── */}
      <section className={styles.section}>
        <div className={styles.inner}>

          {/* Tabs de municipios */}
          <div className={styles.tabs}>
            {SEDES.map(s => (
              <button
                key={s.id}
                className={[
                  styles.tab,
                  activeSede === s.id ? styles.tabActive : '',
                  activeSede === s.id ? styles[`tabActive_${s.color}`] : '',
                ].join(' ')}
                onClick={() => handleTabClick(s.id)}
              >
                <MapPinIcon />
                <span>{s.nombre}</span>
                {s.tipo === 'oficina' && <span className={styles.tabBadge}>Oficina</span>}
              </button>
            ))}
          </div>

          {/* Panel de detalle */}
          <div className={`${styles.detailPanel} ${styles[`panel_${sede.color}`]}`} key={sede.id}>

            {/* Cabecera */}
            <div className={styles.panelHeader}>
              <div className={`${styles.panelIco} ${styles[`ico_${sede.color}`]}`}>
                {sede.tipo === 'oficina' ? <BuildingIcon /> : <ZapIcon />}
              </div>
              <div className={styles.panelTitles}>
                <span className={`${styles.panelTag} ${styles[`tag_${sede.color}`]}`}>{sede.tag}</span>
                <h2 className={styles.panelName}>{sede.nombre}</h2>
                <p className={styles.panelDesc}>{sede.short}</p>
              </div>
      
            </div>

            {/* Aviso cobertura remota */}
            {sede.tipo === 'cobertura' && (
              <div className={styles.coverageNotice}>
                <span className={styles.noticeIco}><ZapIcon /></span>
                <p>
                  <strong>Actualmente no contamos con oficina física en este municipio.</strong> Un agente te acompaña durante el proceso, revisa tus documentos, coordina la radicación del trámite y te indica cuándo es necesario realizar firmas, huellas o validaciones presenciales.
                </p>
              </div>
            )}

            {/* Cuerpo del panel: dos columnas */}
            <div className={styles.panelBody}>

              {/* Columna izquierda — contacto + stats */}
              <div className={styles.panelLeft}>
                <h4 className={styles.blockTitle}>Información de contacto</h4>
                <ul className={styles.infoList}>
                  {sede.direccion && (
                    <li>
                      <span className={`${styles.infoIco} ${styles[`ico_${sede.color}`]}`}><MapPinIcon /></span>
                      <div>
                        <span className={styles.infoLabel}>Dirección</span>
                        <span className={styles.infoVal}>{sede.direccion}</span>
                      </div>
                    </li>
                  )}
                  <li>
                    <span className={`${styles.infoIco} ${styles[`ico_${sede.color}`]}`}><PhoneIcon /></span>
                    <div>
                      <span className={styles.infoLabel}>Teléfono</span>
                      <a href={`tel:${sede.telefono}`} className={styles.infoVal}>{sede.telefono}</a>
                    </div>
                  </li>
                  <li>
                    <span className={`${styles.infoIco} ${styles[`ico_${sede.color}`]}`}><MailIcon /></span>
                    <div>
                      <span className={styles.infoLabel}>Correo electrónico</span>
                      <a href={`mailto:${sede.correo}`} className={styles.infoVal}>{sede.correo}</a>
                    </div>
                  </li>
                  <li>
                    <span className={`${styles.infoIco} ${styles[`ico_${sede.color}`]}`}><ClockIcon /></span>
                    <div>
                      <span className={styles.infoLabel}>Horario de atención</span>
                      <span className={styles.infoVal}>{sede.horario}</span>
                    </div>
                  </li>
                </ul>

                <div className={styles.statsRow}>
                 
            
           
                </div>
              </div>

              {/* Columna derecha — servicios + acciones */}
              <div className={styles.panelRight}>
                <h4 className={styles.blockTitle}>
                  {sede.tipo === 'oficina' ? 'Servicios disponibles' : '¿Cómo funciona?'}
                </h4>
                <ul className={styles.reqList}>
                  {sede.servicios.map(sv => (
                    <li key={sv}>
                      <span className={`${styles.reqCheck} ${styles[`check_${sede.color}`]}`}><CheckIcon /></span>
                      {sv}
                    </li>
                  ))}
                </ul>

                <div className={styles.cardActions}>
                 
                  {sede.tipo === 'oficina' ? (
                    <a
                      href={sede.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.btnSecondary}
                    >
                      <MapPinIcon /> Ver en Maps <ArrowIcon />
                    </a>
                  ) : (
                    <button className={styles.btnSecondary} onClick={() => router.push('/registro')}>
                      Iniciar trámite <ArrowIcon />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Mapa embed — solo para oficina física */}
{sede.tipo === 'oficina' && (
  <div className={styles.mapEmbed}>
    <iframe
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3979.5091324028444!2d-73.62613299999997!3d4.119712000000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3e2e41bbc16f37%3A0x55c6b23b03518b2e!2sCl.%203c%20%23%2029-21%2C%20Villavicencio%2C%20Meta!5e0!3m2!1ses!2sco!4v1777617932539!5m2!1ses!2sco"
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title="Ubicación oficina Villavicencio"
    />
  </div>
)}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <div className={styles.cta}>
        <div className={styles.ctaText}>
          <h2>¿Listo para empezar tu trámite?</h2>
          <p>Crea tu cuenta y un agente de tu municipio te contactará hoy.</p>
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