'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../Inicio/Sidebar';
import Footer from '../Inicio/Footer';
import styles from '../CSS/Nosotros/Nosotros.module.css';

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
const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const ZapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const TargetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);
const ChevronLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

/* ── Datos ── */
const VALORES = [
  { icon: <ShieldIcon />, color: 'azul',   title: 'Transparencia', desc: 'Precios claros antes de comenzar, sin cobros ocultos ni sorpresas al final del proceso.' },
  { icon: <ZapIcon />,   color: 'verde',  title: 'Eficiencia',    desc: 'Optimizamos cada trámite para que obtengas tu resultado en el menor tiempo posible.' },
  { icon: <HeartIcon />, color: 'dorado', title: 'Compromiso',    desc: 'Tu trámite es nuestra prioridad. Un agente personal asignado de inicio a fin.' },
  { icon: <TargetIcon />,color: 'azul',   title: 'Precisión',     desc: 'Cero errores en la documentación. Verificamos cada detalle antes de radicar.' },
];

const TIMELINE = [
  {
    year: '2022',
    title: 'Nace TransMeta en Villavicencio',
    desc: 'Una señora con más de 20 años de experiencia trabajando en tránsito decide pensionarse y fundar TransMeta, una empresa familiar para ayudar a los ciudadanos del Meta a gestionar sus trámites vehiculares sin filas.',
  },
  {
    year: '2023',
    title: 'Primeros agentes aliados',
    desc: 'Incorporamos los primeros agentes de confianza en Restrepo y Acacias, personas conocedoras del proceso en su municipio, que se convierten en extensión de nuestro servicio en el territorio.',
  },
  {
    year: '2024',
    title: 'Red de agentes en 6 municipios',
    desc: 'Completamos nuestra red con agentes presentes en Guamal, Granada y Puerto López. Aunque la sede es en Villavo, cada municipio tiene quién responda por el trámite localmente.',
  },
  {
    year: '2026',
    title: 'Plataforma de agendamiento y gestión de trámites',
    desc: 'Lanzamos nuestra plataforma digital para que los clientes vean el estado de su trámite en tiempo real, desde el celular o el computador, sin necesidad de llamar.',
  },
  {
    year: 'Actualmente',
    title: '10 agentes',
    desc: 'Hoy somos un equipo de 10 agentes distribuidos en el Meta, con más de 500 trámites gestionados y un 98% de satisfacción entre nuestros clientes.',
  },
];

const AGENTES = [
  { nombre: 'Carmen R.',   cargo: 'Fundadora · Villavicencio', exp: '20+ años',  iniciales: 'CR', sede: 'Villavicencio' },
  { nombre: 'Luis M.',     cargo: 'Agente · Villavicencio',    exp: '3 años',    iniciales: 'LM', sede: 'Villavicencio' },
  { nombre: 'Patricia V.', cargo: 'Agente · Villavicencio',    exp: '2 años',    iniciales: 'PV', sede: 'Villavicencio' },
  { nombre: 'Jorge S.',    cargo: 'Agente · Restrepo',         exp: '3 años',    iniciales: 'JS', sede: 'Restrepo' },
  { nombre: 'Sandra T.',   cargo: 'Agente · Restrepo',         exp: '2 años',    iniciales: 'ST', sede: 'Restrepo' },
  { nombre: 'Laura G.',    cargo: 'Agente · Acacias',          exp: '4 años',    iniciales: 'LG', sede: 'Acacias' },
  { nombre: 'Héctor P.',   cargo: 'Agente · Acacias',          exp: '2 años',    iniciales: 'HP', sede: 'Acacias' },
  { nombre: 'Rosario M.',  cargo: 'Agente · Guamal',           exp: '2 años',    iniciales: 'RM', sede: 'Guamal' },
  { nombre: 'María T.',    cargo: 'Agente · Granada',          exp: '3 años',    iniciales: 'MT', sede: 'Granada' },
  { nombre: 'Andrés R.',   cargo: 'Agente · Puerto López',     exp: '2 años',    iniciales: 'AR', sede: 'Puerto López' },
];

const FAQS = [
  { q: '¿Cuánto cuesta usar TransMeta?',                     a: 'Nuestros honorarios dependen del tipo de trámite. Siempre te informamos el costo total antes de empezar. No hay cobros ocultos ni sorpresas.' },
  { q: '¿Tengo que ir personalmente a las oficinas?',        a: 'Depende del trámite. Te ayudamos a reducir desplazamientos, pero si se requieren firmas, huellas o validaciones presenciales, te indicamos cuándo y dónde realizarlas.' },
  { q: '¿Cómo hago seguimiento a mi trámite?',              a: 'Una vez creada tu cuenta, puedes ver el estado de tu trámite en tiempo real desde cualquier dispositivo a través de nuestra plataforma.' },
  { q: '¿Qué pasa si me rechazan el trámite?',              a: 'Si el trámite presenta observaciones, te informamos el motivo y te orientamos para corregirlo. En caso de documentos faltantes, errores o requisitos pendientes, coordinamos contigo los ajustes necesarios para continuar el proceso.' },
  { q: '¿Tienen sede en mi municipio?',                     a: 'Nuestra sede principal está en Villavicencio, pero contamos con agentes aliados en Restrepo, Acacias, Guamal, Granada y Puerto López que atienden localmente.' },
  { q: '¿Es una empresa confiable?',                        a: 'TransMeta es una empresa familiar fundada por una ex funcionaria de tránsito con más de 20 años de experiencia. Cada agente es una persona de confianza, conocedora del proceso en su municipio.' },
];

const SEDES = [
  { ciudad: 'Villavicencio', agentes: 3, color: 'azul' },
  { ciudad: 'Restrepo',      agentes: 2, color: 'verde' },
  { ciudad: 'Acacias',       agentes: 2, color: 'dorado' },
  { ciudad: 'Guamal',        agentes: 1, color: 'azul' },
  { ciudad: 'Granada',       agentes: 1, color: 'verde' },
  { ciudad: 'Puerto López',  agentes: 1, color: 'dorado' },
];

const VISIBLE_CARDS = 5;

export default function NosotrosPage() {
  const router = useRouter();
  const [visible, setVisible]   = useState(false);
  const [openFaq, setOpenFaq]   = useState<number | null>(null);
  const [agentIdx, setAgentIdx] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const prevAgent = () => setAgentIdx(i => Math.max(0, i - 1));
  const nextAgent = () => setAgentIdx(i => Math.min(AGENTES.length - VISIBLE_CARDS, i + 1));
  const canPrev = agentIdx > 0;
  const canNext = agentIdx < AGENTES.length - VISIBLE_CARDS;

  return (
    <div className={styles.pg}>
      <Sidebar />

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroDots} aria-hidden />
        <div className={styles.heroCut} aria-hidden />
        <div className={`${styles.heroInner} ${visible ? styles.heroVisible : ''}`}>
          <span className={styles.eyebrow}>Quiénes somos</span>
          <h1 className={styles.h1}>Una empresa familiar<br /><span className={styles.h1Light}>nacida en el llano</span></h1>
          <p className={styles.heroP}>
            Fundada en 2022 por una ex funcionaria de tránsito con más de 20 años de experiencia. Nuestra misión: que ningún ciudadano del Meta pierda un día en filas.
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

      {/* ── VALORES ── */}
      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.sectionHead}>
            <span className={styles.eyebrow2}>Nuestros valores</span>
            <h2 className={styles.sectionH2}>Lo que nos guía cada día</h2>
            <p className={styles.sectionDesc}>Cuatro principios que definen cómo trabajamos con cada cliente.</p>
          </div>
          <div className={styles.valoresGrid}>
            {VALORES.map((v, i) => (
              <div
                key={v.title}
                className={`${styles.valorCard} ${styles[`color_${v.color}`]}`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className={styles.valorIco}>{v.icon}</div>
                <div className={styles.valorText}>
                  <h3 className={styles.valorTitle}>{v.title}</h3>
                  <p className={styles.valorDesc}>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HISTORIA / TIMELINE ── */}
      <section className={styles.timelineSection}>
        <div className={styles.timelineBg} aria-hidden />
        <div className={styles.inner}>
          <div className={styles.sectionHead}>
            <span className={styles.eyebrow2}>Nuestra historia</span>
            <h2 className={styles.sectionH2}>4 años transformando trámites</h2>
            <p className={styles.sectionDesc}>De una pensionada con vocación de servicio a una red de 10 agentes en el Meta.</p>
          </div>
          <div className={styles.tlList}>
            {TIMELINE.map((item, i) => (
              <div key={item.year} className={`${styles.tlCard} ${i % 2 === 0 ? styles.tlAzul : styles.tlVerde}`}>
                <span className={styles.tlYear}>{item.year}</span>
                <h3 className={styles.tlTitle}>{item.title}</h3>
                <p className={styles.tlDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COBERTURA ── */}
      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.sectionHead}>
            <span className={styles.eyebrow2}>Nuestra cobertura</span>
            <h2 className={styles.sectionH2}>Una sede, seis municipios</h2>
            <p className={styles.sectionDesc}>
              Operamos desde Villavicencio, pero nuestros agentes atienden en terreno en todo el departamento.
            </p>
          </div>
          <div className={styles.sedesGrid}>
            {SEDES.map((s, i) => (
              <div
                key={s.ciudad}
                className={`${styles.sedeCard} ${styles[`color_${s.color}`]}`}
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className={styles.sedeIco}><MapPinIcon /></div>
                <div className={styles.sedeInfo}>
                  <strong className={styles.sedeCiudad}>{s.ciudad}</strong>
                  <span className={styles.sedeAgentes}>{s.agentes} agente{s.agentes > 1 ? 's' : ''}</span>
                </div>
                {s.ciudad === 'Villavicencio' && (
                  <span className={styles.sedeBadge}>Sede principal</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AGENTES ── */}
      <section className={styles.agentesSection}>
        <div className={styles.agentesBg} aria-hidden />
        <div className={styles.inner}>
          <div className={styles.sectionHead}>
            <span className={styles.eyebrow2}>Nuestro equipo</span>
            <h2 className={styles.sectionH2}>Los agentes que hacen posible todo</h2>
            <p className={styles.sectionDesc}>10 agentes distribuidos en 6 municipios del Meta, listos para atenderte.</p>
          </div>

          <div className={styles.carouselWrap}>
            <button
              className={`${styles.carouselBtn} ${!canPrev ? styles.carouselBtnDisabled : ''}`}
              onClick={prevAgent}
              disabled={!canPrev}
              aria-label="Anterior"
            >
              <ChevronLeftIcon />
            </button>

            <div className={styles.carouselTrack}>
              <div
                className={styles.carouselInner}
                style={{ transform: `translateX(calc(-${agentIdx} * (100% / ${VISIBLE_CARDS})))` }}
              >
                {AGENTES.map((a, i) => (
                  <div key={a.nombre} className={styles.agenteCard} style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className={styles.agenteAvatar}>{a.iniciales}</div>
                    <div className={styles.agenteRating}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <StarIcon key={j} />
                      ))}
                    </div>
                    <h3 className={styles.agenteNombre}>{a.nombre}</h3>
                    <p className={styles.agenteCargo}>{a.cargo}</p>
                    <div className={styles.agenteMeta}>
                      <div className={styles.agenteMetaItem}>
                        <strong>{a.exp}</strong>
                        <span>Experiencia</span>
                      </div>
                  
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              className={`${styles.carouselBtn} ${!canNext ? styles.carouselBtnDisabled : ''}`}
              onClick={nextAgent}
              disabled={!canNext}
              aria-label="Siguiente"
            >
              <ChevronRightIcon />
            </button>
          </div>

          {/* Dots */}
          <div className={styles.carouselDots}>
            {Array.from({ length: AGENTES.length - VISIBLE_CARDS + 1 }).map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${agentIdx === i ? styles.dotActive : ''}`}
                onClick={() => setAgentIdx(i)}
                aria-label={`Ir a agente ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className={styles.faqSection}>
        <div className={styles.inner} style={{ maxWidth: 800 }}>
          <div className={styles.sectionHead}>
            <span className={styles.eyebrow2}>FAQ</span>
            <h2 className={styles.sectionH2}>Preguntas frecuentes</h2>
          </div>
          <div className={styles.faqList}>
            {FAQS.map((faq, i) => (
              <div key={i} className={`${styles.faqItem} ${openFaq === i ? styles.faqOpen : ''}`}>
                <button className={styles.faqQ} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <span className={`${styles.faqChevron} ${openFaq === i ? styles.faqChevronOpen : ''}`}>
                    <ChevronIcon />
                  </span>
                </button>
                {openFaq === i && (
                  <div className={styles.faqA}>
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <div className={styles.cta}>
        <div className={styles.ctaDots} aria-hidden />
        <div className={styles.ctaText}>
          <h2>¿Listo para gestionar tu trámite?</h2>
          <p>Crea tu cuenta gratis y un agente de tu municipio te atiende hoy.</p>
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