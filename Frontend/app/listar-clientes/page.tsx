'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../CSS/Admin/ListarClientes.module.css';
import { BACKEND_URL } from '@/lib/config';
import Logo from '../components/Logo';

/* ── Icons ── */
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
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
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);
const HistoryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const AlertTriangleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
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

interface HistorialItem {
  id: number;
  tipo: string;
  fecha: string;
  estado: string;
  vehiculo: string;
  total: number;
}

export default function ListarClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para Modal de Historial
  const [showHistory, setShowHistory] = useState(false);
  const [clientHistory, setClientHistory] = useState<HistorialItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedClientName, setSelectedClientName] = useState('');

  // Estados para Modal de Eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingClient, setDeletingClient] = useState<{cedula: string, nombre: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
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
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const verHistorial = async (cedula: string, nombre: string) => {
    try {
      setSelectedClientName(nombre);
      setShowHistory(true);
      setLoadingHistory(true);
      const response = await fetch(`${BACKEND_URL}/api/clientes/${cedula}/historial`);
      const data = await response.json();
      if (data.status === 'OK') {
        setClientHistory(data.historial);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleOpenDeleteModal = (cedula: string, nombre: string) => {
    setDeletingClient({ cedula, nombre });
    setShowDeleteModal(true);
  };

  const confirmarEliminacion = async () => {
    if (!deletingClient) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(`${BACKEND_URL}/api/clientes/${deletingClient.cedula}`, { method: 'DELETE' });
      const data = await response.json();
      
      if (response.ok && data.status === 'OK') {
        setSuccess(`Cliente ${deletingClient.nombre} eliminado correctamente`);
        setClientes(clientes.filter(c => c.cedula !== deletingClient.cedula));
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.mensaje || 'No se pudo eliminar el cliente');
        setTimeout(() => setError(''), 4000);
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeletingClient(null);
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
        <p>Sincronizando base de clientes...</p>
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
            <div className={styles.iconContainer}><Logo size={32} /></div>
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

        {/* ── Alertas ── */}
        {error && <div className={styles.errorAlert}>{error}</div>}
        {success && <div className={styles.successAlert}>{success}</div>}

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
                    <div className={styles.actionsCell}>
                      <button 
                        onClick={() => verHistorial(cliente.cedula, `${cliente.nombres} ${cliente.apellido}`)}
                        className={styles.historyBtn} 
                        title="Ver Historial"
                      >
                        <HistoryIcon />
                      </button>
                      <Link href={`/listar-clientes/${cliente.cedula}/editar`} className={styles.editBtn} title="Editar">
                        Editar
                      </Link>
                      <button 
                        onClick={() => handleOpenDeleteModal(cliente.cedula, `${cliente.nombres} ${cliente.apellido}`)} 
                        className={styles.deleteBtn}
                        title="Eliminar"
                      >
                        <TrashIcon />
                      </button>
                    </div>
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

        {/* ── Modal de Historial ── */}
        {showHistory && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3>Historial de Trámites: {selectedClientName}</h3>
                <button onClick={() => setShowHistory(false)} className={styles.closeBtn}>×</button>
              </div>
              <div className={styles.modalBody}>
                {loadingHistory ? (
                  <p className={styles.loadingModal}>Cargando historial...</p>
                ) : clientHistory.length > 0 ? (
                  <table className={styles.historyTable}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Trámite</th>
                        <th>Vehículo</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientHistory.map((item) => (
                        <tr key={item.id}>
                          <td>#{item.id}</td>
                          <td><strong>{item.tipo}</strong></td>
                          <td>{item.vehiculo}</td>
                          <td>{new Date(item.fecha).toLocaleDateString()}</td>
                          <td>
                            <span className={`${styles.statusBadge} ${styles[item.estado]}`}>
                              {item.estado}
                            </span>
                          </td>
                          <td>${item.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className={styles.emptyModal}>Este cliente no tiene trámites registrados.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Modal de Eliminación (Danger Modal) ── */}
        {showDeleteModal && (
          <div className={styles.modalOverlay}>
            <div className={`${styles.modal} ${styles.modalSmall}`}>
              <div className={styles.modalBodySmall}>
                <div className={styles.modalIconDanger}>
                  <AlertTriangleIcon />
                </div>
                <h3>¿Eliminar Cliente?</h3>
                <p>
                  Estás a punto de eliminar a <strong>{deletingClient?.nombre}</strong> del sistema. 
                  Esta acción es permanente y no se puede deshacer.
                </p>
              </div>
              <div className={styles.modalFooter}>
                <button 
                  onClick={() => setShowDeleteModal(false)} 
                  className={styles.cancelModalBtn}
                  disabled={isDeleting}
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmarEliminacion} 
                  className={styles.confirmDeleteBtn}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Eliminando...' : 'Sí, Eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
