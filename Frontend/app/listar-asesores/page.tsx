'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BACKEND_URL } from '@/lib/config';

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2rem',
  },
  card: {
    background: 'white',
    borderRadius: '1rem',
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap' as const,
    gap: '1rem',
  },
  title: {
    color: '#333',
    margin: 0,
  },
  backBtn: {
    padding: '0.5rem 1rem',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    overflowX: 'auto' as const,
    display: 'block' as const,
  },
  th: {
    padding: '0.75rem',
    textAlign: 'left' as const,
    borderBottom: '2px solid #ddd',
    backgroundColor: '#f3f4f6',
    fontWeight: 600,
  },
  td: {
    padding: '0.75rem',
    borderBottom: '1px solid #ddd',
    verticalAlign: 'middle' as const,
  },
  loading: {
    textAlign: 'center' as const,
    padding: '2rem',
  },
  errorAlert: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
    borderLeft: '4px solid #dc2626',
  },
  successAlert: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
    borderLeft: '4px solid #10b981',
  },
  emptyMessage: {
    textAlign: 'center' as const,
    padding: '2rem',
    color: '#666',
  },
  especialidadBadge: {
    backgroundColor: '#e0e7ff',
    color: '#4338ca',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    fontSize: '0.875rem',
    display: 'inline-block',
  },
  rolBadge: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    fontSize: '0.875rem',
    display: 'inline-block',
  },
  actionsContainer: {
    display: 'flex',
    gap: '0.5rem',
  },
  editBtn: {
    padding: '0.4rem 0.8rem',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    textDecoration: 'none',
    display: 'inline-block',
  },
  deleteBtn: {
    padding: '0.4rem 0.8rem',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    maxWidth: '400px',
    width: '90%',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  modalButtons: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'flex-end',
    marginTop: '1.5rem',
  },
  confirmBtn: {
    padding: '0.5rem 1rem',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
  },
  cancelBtn: {
    padding: '0.5rem 1rem',
    background: '#9ca3af',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
  },
};

interface Asesor {
  cedula: number;
  nombres: string;
  apellido: string;
  correo: string;
  especialidad: string;
  sueldo: number;
  tipoUsuario: number;
}

export default function ListarAsesoresPage() {
  const router = useRouter();
  const [asesores, setAsesores] = useState<Asesor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [asesorAEliminar, setAsesorAEliminar] = useState<Asesor | null>(null);

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userRol = sessionStorage.getItem('userRol');

    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    if (userRol !== '3') {
      router.push('/dashboard');
      return;
    }

    cargarAsesores();
  }, [router]);

  const cargarAsesores = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/asesores`);
      const data = await response.json();
      
      if (response.ok && data.status === 'OK') {
        setAsesores(data.asesores || []);
      } else {
        throw new Error(data.mensaje || 'Error al cargar asesores');
      }
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Error de conexión con el servidor');
      setAsesores([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (asesor: Asesor) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/asesores/${asesor.cedula}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (response.ok && data.status === 'OK') {
        setSuccess(`Asesor ${asesor.nombres} ${asesor.apellido} eliminado exitosamente`);
        cargarAsesores(); // Recargar la lista
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.mensaje || 'Error al eliminar asesor');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setAsesorAEliminar(null);
    }
  };

  const formatearSueldo = (sueldo: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(sueldo);
  };

  const getRolTexto = (tipoUsuario: number) => {
    return tipoUsuario === 2 ? 'Asesor' : 'Otro';
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.loading}>
            <div>Cargando lista de asesores...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Lista de Asesores</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/dashboard-admin" style={styles.backBtn}>
              ← Volver al Dashboard
            </Link>
            <Link href="/registrar-asesor" style={styles.editBtn}>
              + Nuevo Asesor
            </Link>
          </div>
        </div>

        {error && (
          <div style={styles.errorAlert} role="alert">
            {error}
          </div>
        )}

        {success && (
          <div style={styles.successAlert} role="alert">
            {success}
          </div>
        )}

        {asesores.length === 0 && !error ? (
          <div style={styles.emptyMessage}>
            <p>No hay asesores registrados en el sistema.</p>
            <p>
              <Link href="/registrar-asesor" style={{ color: '#667eea' }}>
                Haz clic aquí para registrar un asesor
              </Link>
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Cédula</th>
                  <th style={styles.th}>Nombre Completo</th>
                  <th style={styles.th}>Correo</th>
                  <th style={styles.th}>Especialidad</th>
                  <th style={styles.th}>Sueldo</th>
                  <th style={styles.th}>Rol</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {asesores.map((asesor, index) => (
                  <tr key={index}>
                    <td style={styles.td}>{asesor.cedula}</td>
                    <td style={styles.td}>
                      {asesor.nombres} {asesor.apellido}
                    </td>
                    <td style={styles.td}>{asesor.correo}</td>
                    <td style={styles.td}>
                      <span style={styles.especialidadBadge}>
                        {asesor.especialidad}
                      </span>
                    </td>
                    <td style={styles.td}>{formatearSueldo(asesor.sueldo)}</td>
                    <td style={styles.td}>
                      <span style={styles.rolBadge}>
                        {getRolTexto(asesor.tipoUsuario)}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionsContainer}>
                        <Link
                          href={`/editar-asesor/${asesor.cedula}`}
                          style={styles.editBtn}
                        >
                          Editar
                        </Link>
                        <button
                          style={styles.deleteBtn}
                          onClick={() => setAsesorAEliminar(asesor)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de confirmación para eliminar */}
      {asesorAEliminar && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Confirmar eliminación</h3>
            <p>
              ¿Estás seguro de que deseas eliminar al asesor{' '}
              <strong>{asesorAEliminar.nombres} {asesorAEliminar.apellido}</strong>?
            </p>
            <p style={{ fontSize: '0.875rem', color: '#666' }}>
              Esta acción no se puede deshacer.
            </p>
            <div style={styles.modalButtons}>
              <button
                style={styles.cancelBtn}
                onClick={() => setAsesorAEliminar(null)}
              >
                Cancelar
              </button>
              <button
                style={styles.confirmBtn}
                onClick={() => handleEliminar(asesorAEliminar)}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}