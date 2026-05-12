'use client';

import Link from 'next/link';
import styles from '../CSS/Footer.module.css';

/* ── Icons ── */
const CarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h12l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" />
    <circle cx="7.5" cy="17.5" r="2.5" /><circle cx="16.5" cy="17.5" r="2.5" />
  </svg>
);
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z" />
  </svg>
);
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const WhatsappIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.558 4.136 1.535 5.874L.057 23.215a.5.5 0 0 0 .63.63l5.34-1.478A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.95 0-3.77-.525-5.33-1.44l-.38-.226-3.938 1.09 1.09-3.938-.226-.38A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const NAV_COLS = [
  {
    title: 'Trámites',
    links: [
      { label: 'Matrícula & Registro', href: '/servicios#matricula' },
      { label: 'Traspaso de Vehículo', href: '/servicios#traspaso' },
      { label: 'Traslado de Matrícula', href: '/servicios#traslado' },
      { label: 'Duplicado de Placas', href: '/servicios#duplicado' },
    ],
  },
  {
    title: 'Sedes',
    links: [
      { label: 'Villavicencio', href: '/sedes#villavicencio' },
      { label: 'Restrepo', href: '/sedes#restrepo' },
      { label: 'Acacias', href: '/sedes#acacias' },
      { label: 'Guamal', href: '/sedes#guamal' },
      { label: 'Granada', href: '/sedes#granada' },
      { label: 'Puerto López', href: '/sedes#lopez' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Servicios', href: '/Servicios' },
      { label: 'Sedes', href: '/Sedes' },
      { label: 'Nosotros', href: '/Nosotros' },
      { label: 'Preguntas Frecuentes', href: '/Nosotros#faq' },
    ],
  },
];



export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      {/* Shimmer top accent */}
      <div className={styles.accentLine} />

      {/* Main grid */}
      <div className={styles.inner}>
        {/* Brand column */}
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoMark}><CarIcon /></span>
            <span className={styles.logoText}>Trans<strong>Meta</strong></span>
          </Link>
          <p className={styles.tagline}>
            Especialistas en trámites vehiculares en el departamento del Meta, Colombia. Rápido, claro y sin filas.
          </p>

          <ul className={styles.contact}>
            <li>
              <span className={styles.contactIco}><PhoneIcon /></span>
              <div>
                <span className={styles.contactLabel}>Línea directa</span>
                <span className={styles.contactVal}>+57 311 469 1980</span>
              </div>
            </li>
            <li>
              <span className={styles.contactIco}><MailIcon /></span>
              <div>
                <span className={styles.contactLabel}>Correo</span>
                <span className={styles.contactVal}>transmeta@hotmail.com</span>
              </div>
            </li>
            <li>
              <span className={styles.contactIco}><PinIcon /></span>
              <div>
                <span className={styles.contactLabel}>Sede principal</span>
                <span className={styles.contactVal}>Villavicencio, Meta</span>
              </div>
            </li>
            <li>
              <span className={styles.contactIco}><ClockIcon /></span>
              <div>
                <span className={styles.contactLabel}>Horario</span>
                <span className={styles.contactVal}>Lun – Vie · 8 am – 6 pm</span>
              </div>
            </li>
          </ul>
        </div>

        {/* Nav columns */}
        {NAV_COLS.map(({ title, links }) => (
          <div key={title} className={styles.col}>
            <h4 className={styles.colTitle}>{title}</h4>
            <ul className={styles.colList}>
              {links.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className={styles.colLink}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className={styles.bottom}>
        <p className={styles.copy}>© {year} TransMeta® · Todos los derechos reservados </p>
        <div className={styles.bottomLinks}>
          <Link href="/privacidad" className={styles.bottomLink}>Privacidad</Link>
          <span className={styles.bottomDot} />
          <Link href="/terminos" className={styles.bottomLink}>Términos</Link>
          <span className={styles.bottomDot} />
          <Link href="/cookies" className={styles.bottomLink}>Cookies</Link>
        </div>
      </div>
    </footer>
  );
}