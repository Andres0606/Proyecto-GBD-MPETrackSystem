'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from '../CSS/Sidebar.module.css';

const CarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h12l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" />
    <circle cx="7.5" cy="17.5" r="2.5" />
    <circle cx="16.5" cy="17.5" r="2.5" />
  </svg>
);

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5 10.5V20h14v-9.5" />
    <path d="M9 20v-6h6v6" />
  </svg>
);

const ServicesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="7" height="7" rx="2" />
    <rect x="13" y="4" width="7" height="7" rx="2" />
    <rect x="4" y="13" width="7" height="7" rx="2" />
    <rect x="13" y="13" width="7" height="7" rx="2" />
  </svg>
);

const SedesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.4" />
  </svg>
);

const NosotrosIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 20c1.6-4 13.4-4 15 0" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const NAV_LINKS = [
  { label: 'Inicio', href: '/', icon: <HomeIcon /> },
  { label: 'Servicios', href: '/Servicios', icon: <ServicesIcon /> },
  { label: 'Sedes', href: '/Sedes', icon: <SedesIcon /> },
  { label: 'Nosotros', href: '/Nosotros', icon: <NosotrosIcon /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className={styles.sidebar}>
      <Link href="/" className={styles.logo}>
        <span className={styles.logoMark}>
          <CarIcon />
        </span>
        <span className={styles.logoText}>
          Trans<strong>Meta</strong>
        </span>
      </Link>

      <div className={styles.divider} />

      <span className={styles.menuLabel}>MENÚ</span>

      <nav className={styles.nav}>
        {NAV_LINKS.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${active ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navText}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.actions}>
        <button onClick={() => router.push('/login')} className={styles.loginBtn}>
          <UserIcon />
          <span>Ingresar</span>
        </button>

        <button onClick={() => router.push('/registro')} className={styles.registerBtn}>
          Registrarse
        </button>
      </div>
    </aside>
  );
}