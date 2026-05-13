'use client';

import Link from 'next/link';
import styles from '../CSS/Footer.module.css';
import Logo from '../components/Logo';

/* ── Icons ── */
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

const NAV_COLS = [
  {
    title: 'Trámites',
    links: [
      { label: 'Matrícula & Registro', href: '/Servicios#matricula' },
      { label: 'Traspaso de Vehículo', href: '/Servicios#traspaso' },
      { label: 'Traslado de Matrícula', href: '/Servicios#traslado' },
      { label: 'Duplicado de Placas', href: '/Servicios#duplicado-placas' },
    ],
  },
  {
    title: 'Sedes',
    links: [
      { label: 'Villavicencio', href: '/Sedes#villavicencio' },
      { label: 'Restrepo', href: '/Sedes#restrepo' },
      { label: 'Acacías', href: '/Sedes#acacias' },
      { label: 'Guamal', href: '/Sedes#guamal' },
      { label: 'Granada', href: '/Sedes#granada' },
      { label: 'Puerto López', href: '/Sedes#lopez' },
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
            <span className={styles.logoMark}><Logo size={28} /></span>
            <span className={styles.logoText}>MPE <strong>SYSTEM</strong></span>
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
                <span className={styles.contactVal}>asesoriastramitesmpe@gmail.com</span>
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
        <p className={styles.copy}>© {year} MPE SYSTEM® · Todos los derechos reservados </p>
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
