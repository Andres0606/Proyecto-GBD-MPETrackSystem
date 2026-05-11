'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../CSS/Admin/ListarClientes.module.css';
import { BACKEND_URL } from '@/lib/config';

/* ── Icons ── */
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

interface Cliente {
  cedula: string;
  nombres: string;
  apellido: string;
  telefono: string;
  correo: string;
  totalCitas: number;
  licencia: string;
}

export default function ListarClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userRole = sessionStorage.getItem('userRole');

    // Si no está logueado o es un cliente/asesor, no puede estar aquí
    if (!isLoggedIn || userRole === '1' || userRole === '2') {
      console.log('Acceso denegado: Usuario no tiene permisos de Administrador');
      router.push('/dashboard');
      return;
    }
    
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/clientes/all`);
      const data = await response.json();
      if (response.ok && data.status === 'OK') {
        setClientes(data.clientes || []);
      } else {
        setError(data.mensaje || 'Error al cargar los clientes');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const clientesFiltrados = clientes.filter(c =>
    c.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cedula.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Cargando lista de clientes...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        
        {/* ── Header ── */}
        <div className={styles.header}>
          <Link href="/dashboard-admin" className={styles.backButton}>
            <ArrowLeftIcon />
            Volver al Dashboard
          </Link>
          <div className={styles.headerTitle}>
            <div className={styles.iconContainer}><UsersIcon /></div>
            <div>
              <h1>Gestión de Clientes</h1>
              <p>Visualiza y administra todos los clientes registrados</p>
            </div>
          </div>
        </div>

        {/* ── Buscador ── */}
        <div className={styles.searchBox}>
          <SearchIcon />
          <input 
            type="text" 
            placeholder="Buscar por nombre o cédula..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className={styles.count}>{clientesFiltrados.length} clientes encontrados</span>
        </div>

        {/* ── Error ── */}
        {error && <div className={styles.errorAlert}>{error}</div>}

        {/* ── Tabla ── */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Cédula</th>
                <th>Contacto</th>
                <th>Citas</th>
                <th>Licencia</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente.cedula}>
                  <td>
                    <div className={styles.clientName}>
                      <div className={styles.avatar}>
                        {cliente.nombres[0]}{cliente.apellido[0]}
                      </div>
                      <div>
                        <strong>{cliente.nombres} {cliente.apellido}</strong>
                      </div>
                    </div>
                  </td>
                  <td><span className={styles.badgeId}>{cliente.cedula}</span></td>
                  <td>
                    <div className={styles.contactInfo}>
                      <span><MailIcon /> {cliente.correo}</span>
                      <span><PhoneIcon /> {cliente.telefono}</span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.citasCount}>{cliente.totalCitas}</span>
                  </td>
                  <td>
                    <span className={`${styles.licenciaBadge} ${cliente.licencia === 'S' ? styles.hasLicencia : styles.noLicencia}`}>
                      {cliente.licencia === 'S' ? 'SI' : 'NO'}
                    </span>
                  </td>
                  <td>
                    <button className={styles.detailBtn}>Detalles</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {clientesFiltrados.length === 0 && (
            <div className={styles.emptyState}>
              <p>No se encontraron clientes que coincidan con la búsqueda.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
