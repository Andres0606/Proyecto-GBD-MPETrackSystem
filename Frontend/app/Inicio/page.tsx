'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import styles from '../CSS/Inicio/Inicio.module.css';

/* ── Icons ── */
const ArrowIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
);
const CheckIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
const FileIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
);
const StarIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);
const PhoneIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z" />
    </svg>
);
const CarIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h12l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" />
        <circle cx="7.5" cy="17.5" r="2.5" /><circle cx="16.5" cy="17.5" r="2.5" />
    </svg>
);
const RefreshIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
);
const CopyIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
);
const MapPinIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
);
const ClockIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
);
const ShieldIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);
const ThumbsUpIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
        <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
);
const ChevronLeft = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);
const ChevronRight = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
    </svg>
);

/* ── Animated counter ── */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
    const [val, setVal] = useState(0);
    const ref = useRef(null);
    const done = useRef(false);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting && !done.current) {
                done.current = true;
                let v = 0;
                const step = Math.ceil(to / 60);
                const t = setInterval(() => {
                    v = Math.min(v + step, to);
                    setVal(v);
                    if (v >= to) clearInterval(t);
                }, 24);
            }
        });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [to]);
    return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}


const HERO_SLIDES = [
    {
        img: '/imagen_redimensionada_1700x1122.jpeg',
        tag: 'Trámites vehiculares · Meta, Colombia',
        title: '¡Tus trámites de tránsito, sin complicaciones!',
        desc: 'En MPE SYSTEM trabajamos con dedicación para gestionar tu matrícula, traspasos y duplicados en el Meta. Sin filas, sin papeleos innecesarios.',
    },
    {
        img: '/sedes.jpeg',
        objPos: 'center center',   // ← esta es la que tiene el problema
        tag: 'Atención personalizada en el Meta',
        title: 'Agentes certificados en 6 municipios del Meta',
        desc: 'Villavicencio, Restrepo, Acacias, Guamal, Granada y Puerto López. Un agente de tu municipio te atiende el mismo día.',
    },
    {
        img: '/WhatsApp imagen 1.jpeg ',
        tag: 'Precio claro · Sin sorpresas',
        title: '¿Cuánto cuesta? Te lo decimos antes de comenzar',
        desc: 'Transparencia total en cada trámite. Sin cobros ocultos, sin sorpresas al final. Solo el precio justo por un servicio de calidad.',
    },
];

const SERVICES = [
    {
        icon: <FileIcon />,
        tag: 'Más solicitado',
        accentColor: 'azul',
        title: 'Matrícula & Registro',
        desc: 'Registra tu vehículo nuevo o usado con toda la documentación correcta. Te guiamos en cada paso sin que tengas que ir a tránsito.',
        href: '/servicios#matricula',
    },
    {
        icon: <RefreshIcon />,
        tag: 'Rápido',
        accentColor: 'verde',
        title: 'Traspaso de Vehículo',
        desc: 'Cambio de propietario sin complicaciones. Verificamos el estado del vehículo antes de tramitar y te mantenemos informado.',
        href: '/servicios#traspaso',
    },
    {
        icon: <CarIcon />,
        tag: 'Meta & Llanos',
        accentColor: 'dorado',
        title: 'Traslado de Matrícula',
        desc: '¿Te mudaste al Meta? Traslada tu matrícula a Villavicencio u otro municipio del departamento sin perder el día.',
        href: '/Servicios#traslado',
    },
    {
        icon: <CopyIcon />,
        tag: '1 día',
        accentColor: 'azul',
        title: 'Duplicado de Placas',
        desc: 'Pérdida, robo o deterioro. Obtenemos tus nuevas placas con el mínimo de trámites posible. Sin vueltas innecesarias.',
        href: '/servicios#duplicado',
    },
];

const PROCESS_STEPS = [
    { num: '01', title: 'Regístrate', desc: 'Crea tu cuenta para iniciar la solicitud de tu trámite vehicular.' },
    { num: '02', title: 'Agenda tu cita', desc: 'Elige el trámite, municipio y horario disponible.' },
    { num: '03', title: 'Confirmación del agente', desc: 'Un agente confirma la cita y crea el trámite en la plataforma.' },
    { num: '04', title: 'Trámite finalizado', desc: 'El agente gestiona el proceso y, al terminar, marca el trámite como completado.' },
];

const WHY_ITEMS = [
    { icon: <MapPinIcon />, title: '6 sedes en el Meta', desc: 'Villavicencio, Restrepo, Acacias, Guamal, Granada y Puerto López.' },
    { icon: <ClockIcon />, title: 'Respuesta el mismo día', desc: 'Confirmación de tu trámite el mismo día. Sin esperas innecesarias.' },
    { icon: <ShieldIcon />, title: 'Agentes eficientes', desc: 'Nuestro equipo te acompaña en el proceso y busca gestionar tu trámite de forma clara y ordenada.' },
    { icon: <ThumbsUpIcon />, title: 'Precio claro, sin sorpresas', desc: 'Te decimos exactamente cuánto vale antes de comenzar.' },
];

const TESTIMONIALS = [
    {
        name: 'Carlos Rodríguez',
        city: 'Villavicencio',
        stars: 5,
        text: 'Hice el traspaso de mi camioneta en menos de 3 días. El agente me explicó todo con calma y no tuve que ir a ninguna oficina de tránsito.',
        tramite: 'Traspaso de vehículo',
        initials: 'CR',
    },
    {
        name: 'Luisa Martínez',
        city: 'Acacias',
        stars: 5,
        text: 'Llevaba meses con el problema de mis placas deterioradas. MPE SYSTEM lo resolvió en un día. El seguimiento en tiempo real es increíble.',
        tramite: 'Duplicado de placas',
        initials: 'LM',
    },
    {
        name: 'Jorge Peña',
        city: 'Puerto López',
        stars: 5,
        text: 'Me ayudaron con la matrícula de mi moto nueva. Precio justo, sin cobros raros. Lo recomiendo a todos los del llano.',
        tramite: 'Matrícula nueva',
        initials: 'JP',
    },
];

/* ── Page ── */
export default function HomePage() {
    const router = useRouter();
    const [visible, setVisible] = useState(false);
    const [slide, setSlide] = useState(0);
    const [estaLogueado, setEstaLogueado] = useState(false);

    useEffect(() => {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');
        const cedula = sessionStorage.getItem('userCedula');

        setEstaLogueado(!!isLoggedIn && !!cedula);
    }, []);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 80);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        const t = setInterval(() => setSlide(v => (v + 1) % HERO_SLIDES.length), 5000);
        return () => clearInterval(t);
    }, []);

    const irAlPanel = () => {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');
        const cedula = sessionStorage.getItem('userCedula');
        const rol = sessionStorage.getItem('userRol');

        if (!isLoggedIn || !cedula) {
            router.push('/login');
            return;
        }

        if (rol === '1') {
            router.push('/dashboard');
        } else if (rol === '2') {
            router.push('/dashboard-asesor');
        } else if (rol === '3') {
            router.push('/dashboard-admin');
        } else {
            router.push('/login');
        }
    };

    const current = HERO_SLIDES[slide];

    return (
        <div className={styles.pg}>
            <Header
                onLoginClick={irAlPanel}
                textoBoton={estaLogueado ? 'Mi perfil' : 'Ingresar'}
            />
            {/* ═══════════════════════════════════
          HERO — Split: imagen izq · texto der
          (mismo layout que Arepas El Poblado)
      ═══════════════════════════════════ */}
            <section className={styles.hero}>
                {/* Columna imagen */}
                <div className={styles.heroImgCol}>
                    {HERO_SLIDES.map((s, i) => (
                        <img
                            key={i}
                            src={s.img}
                            alt="MPE SYSTEM trámites vehiculares"
                            className={`${styles.heroImg} ${i === slide ? styles.heroImgActive : ''}`}
                        />
                    ))}
                    {/* Flechas de navegación */}
                    <button className={`${styles.heroArrow} ${styles.heroArrowL}`} onClick={() => setSlide(v => (v - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}>
                        <ChevronLeft />
                    </button>
                    <button className={`${styles.heroArrow} ${styles.heroArrowR}`} onClick={() => setSlide(v => (v + 1) % HERO_SLIDES.length)}>
                        <ChevronRight />
                    </button>
                </div>

                {/* Columna texto */}
                <div className={`${styles.heroTextCol} ${visible ? styles.heroVisible : ''}`}>
                    <span className={styles.heroBadge}>
                        <span className={styles.heroBadgeDot} />
                        {current.tag}
                    </span>

                    <h1 className={styles.heroH1}>{current.title}</h1>

                    <p className={styles.heroP}>{current.desc}</p>

                    <div className={styles.heroCtas}>
                        <button className={styles.ctaMain} onClick={() => router.push('/Servicios')}>
                            Ver servicios <ArrowIcon />
                        </button>
                        <button className={styles.ctaSec} onClick={() => router.push('/registro')}>
                            Crear cuenta gratis
                        </button>
                    </div>

                    <div className={styles.heroTags}>
                        {['Sin filas', 'Precio claro', 'Agentes RUNT', 'Seguimiento en tiempo real'].map(t => (
                            <span key={t} className={styles.heroTag}><CheckIcon />{t}</span>
                        ))}
                    </div>

                    {/* Dots */}
                    <div className={styles.heroDots}>
                        {HERO_SLIDES.map((_, i) => (
                            <button key={i} className={`${styles.dot} ${i === slide ? styles.dotOn : ''}`} onClick={() => setSlide(i)} />
                        ))}
                    </div>
                </div>
            </section>


            {/* ═══════════════════════════════════
          SERVICIOS — cards con borde superior de color
      ═══════════════════════════════════ */}
            <section id="servicios" className={styles.section}>
                <div className={styles.inner}>
                    <div className={styles.secHead}>
                        <span className={styles.eyebrow}>Lo que hacemos</span>
                        <h2 className={styles.secH2}>
                            Trámites vehiculares <span className={styles.accent}>sin papeleos</span>
                        </h2>
                        <p className={styles.secP}>
                            Un agente certificado te atiende desde la primera consulta hasta la entrega, en tu municipio del Meta.
                        </p>
                    </div>

                    <div className={styles.servGrid}>
                        {SERVICES.map(s => (
                            <a key={s.title} href={s.href} className={`${styles.servCard} ${styles[`border_${s.accentColor}`]}`}>
                                <span className={`${styles.servTag} ${styles[`tag_${s.accentColor}`]}`}>{s.tag}</span>
                                <div className={`${styles.servIco} ${styles[`ico_${s.accentColor}`]}`}>{s.icon}</div>
                                <h3 className={styles.servTitle}>{s.title}</h3>
                                <p className={styles.servDesc}>{s.desc}</p>

                            </a>
                        ))}
                    </div>

                    <p className={styles.servExtra}>
                        ¿No encuentras tu trámite?{' '}
                        <a href="/Servicios" className={styles.servExtraLink}>Ver todos los servicios <ArrowIcon /></a>
                    </p>
                </div>
            </section>

            {/* ═══════════════════════════════════
          CÓMO FUNCIONA — pasos con imagen de fondo
          (inspirado en "Así preparamos nuestras arepas")
      ═══════════════════════════════════ */}
            <section className={styles.processSection}>
                {/* Franja de imagen de fondo con overlay */}
                <div className={styles.processBg}>
                    <img src="/Imagenes/imagen_redimensionada_1700x1122.jpeg" alt="" className={styles.processBgImg} />
                    <div className={styles.processBgOverlay} />
                </div>

                <div className={styles.inner}>
                    <div className={`${styles.secHead} ${styles.secHeadLight}`}>
                        <span className={styles.eyebrowLight}>¿Cómo funciona?</span>
                        <h2 className={`${styles.secH2} ${styles.secH2Light}`}>
                            Así gestionamos <span className={styles.accentLight}>tus trámites</span>
                        </h2>
                        <p className={`${styles.secP} ${styles.secPLight}`}>
                            Conoce el proceso que seguimos para que tu trámite salga bien a la primera.
                        </p>
                    </div>

                    <div className={styles.processGrid}>
                        {PROCESS_STEPS.map((step, i) => (
                            <div key={step.num} className={styles.processCard}>
                                <div className={styles.processNum}>{step.num}</div>
                                <h4 className={styles.processTitle}>{step.title}</h4>
                                <p className={styles.processDesc}>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════
          POR QUÉ NOSOTROS — split texto izq · imagen der
      ═══════════════════════════════════ */}
            <section className={styles.whySection}>
                <div className={styles.whyGrid}>
                    {/* Columna texto */}
                    <div className={styles.whyText}>
                        <span className={styles.eyebrow}>¿Por qué MPE SYSTEM?</span>
                        <h2 className={styles.secH2}>
                            La forma más fácil de <span className={styles.accent}>tramitar en el Meta</span>
                        </h2>
                        <p className={styles.secP} style={{ textAlign: 'left' }}>
                            Nacimos en Villavicencio para resolver el problema que todos conocemos: horas perdidas en filas, papeles equivocados y costos opacos.
                        </p>
                        <div className={styles.whyCards}>
                            {WHY_ITEMS.map(item => (
                                <div key={item.title} className={styles.whyCard}>
                                    <span className={styles.whyIco}>{item.icon}</span>
                                    <div>
                                        <h4 className={styles.whyCardTitle}>{item.title}</h4>
                                        <p className={styles.whyCardDesc}>{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className={styles.btnMain} onClick={() => router.push('/registro')}>
                            Empezar ahora <ArrowIcon />
                        </button>
                    </div>

                    {/* Columna imagen */}
                    <div className={styles.whyImgWrap}>
                        <img
                            src="/WhatsApp 3.jpeg"
                            alt="Agente MPE SYSTEM con cliente"
                            className={styles.whyImg}
                        />
                        <div className={styles.whyBadge}>
                            <span className={styles.whyBadgeN}>98%</span>
                            <span className={styles.whyBadgeL}>Satisfacción</span>
                        </div>
                    </div>
                </div>
            </section>
            {/* ═══════════════════════════════════
          CTA FINAL
      ═══════════════════════════════════ */}
            <section className={styles.ctaSection}>
                <div className={styles.ctaInner}>
                    <div>
                        <h2 className={styles.ctaH2}>¿Listo para gestionar tu trámite?</h2>
                        <p className={styles.ctaP}>Crea tu cuenta gratis y un agente de tu municipio te atiende hoy.</p>
                    </div>
                    <div className={styles.ctaBtns}>
                        <button className={styles.ctaBtnWhite} onClick={() => router.push('/registro')}>
                            Crear cuenta gratis <ArrowIcon />
                        </button>
                        <a href="tel:+573114691980" className={styles.ctaBtnGhost}>
                            <PhoneIcon /> Llamar ahora
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
