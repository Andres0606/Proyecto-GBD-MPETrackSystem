'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../CSS/Header.module.css';
import Logo from '../components/Logo';

/* ── Icons ── */
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="16" y2="18" />
  </svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const NAV_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Servicios', href: '/Servicios' },
  { label: 'Sedes', href: '/Sedes' },
  { label: 'Nosotros', href: '/Nosotros' },
];

interface HeaderProps {
  onLoginClick?: () => void;
  textoBoton?: string;
}

export default function Header({ onLoginClick, textoBoton = 'Ingresar' }: HeaderProps) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleLogin = () => {
    if (onLoginClick) onLoginClick();
    else router.push('/login');
  };
  const handleRegister = () => router.push('/registro');

  return (
    <header className={`${styles.nav} ${scrolled ? styles.navScrolled : ''} ${mounted ? styles.navVisible : ''}`}>

      {/* Logo */}
      <Link href="/" className={styles.logo}>
        <span className={styles.logoMark}>
          <Logo size={28} />
        </span>
        <span className={styles.logoText}>
          MPE <strong>SYSTEM</strong>
        </span>
      </Link>

      {/* Desktop links */}
      <nav className={styles.links}>
        {NAV_LINKS.map(({ label, href }) => (
          <Link key={href} href={href} className={styles.navLink}>
            {label}
          </Link>
        ))}
      </nav>

      {/* Desktop actions */}
      <div className={styles.actions}>
        <button className={styles.loginBtn} onClick={handleLogin}>
          <UserIcon />
          <span>{textoBoton}</span>
        </button>
        <button className={styles.registerBtn} onClick={handleRegister}>
          Registrarse →
        </button>
      </div>

      <button
        className={styles.burger}
        onClick={() => setMenuOpen(v => !v)}
        aria-label="Menú"
      >
        {menuOpen ? <XIcon /> : <MenuIcon />}
      </button>

      {/* Mobile overlay */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}>
        <div className={styles.mobileInner}>
          {NAV_LINKS.map(({ label, href }, i) => (
            <Link
              key={href}
              href={href}
              className={styles.mobileLink}
              style={{ animationDelay: `${i * 0.07 + 0.05}s` }}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <button
            className={styles.mobileCta}
            style={{ animationDelay: '0.33s' }}
            onClick={() => { setMenuOpen(false); handleLogin(); }}
          >
            {textoBoton}
          </button>
          <button
            className={styles.mobileCtaOutline}
            style={{ animationDelay: '0.4s' }}
            onClick={() => { setMenuOpen(false); handleRegister(); }}
          >
            Registrarse
          </button>
        </div>
      </div>
    </header>
  );
}
