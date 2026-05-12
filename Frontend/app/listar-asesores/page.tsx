'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../CSS/Admin/ListarAsesores.module.css';
import { BACKEND_URL } from '@/lib/config';

/* ── Icons ── */
const CarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h12l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" />
    <circle cx="7.5" cy="17.5" r="2.5" /><circle cx="16.5" cy="17.5" r="2.5" />
  </svg>
);

const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

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
      setError(err.message || 'Error de conexión');
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
        setSuccess(`Asesor eliminado correctamente`);
        cargarAsesores();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.mensaje || 'Error al eliminar');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setAsesorAEliminar(null);
    }
  };

  const formatearSueldo = (sueldo: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(sueldo);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner} />
          <p>Cargando panel de asesores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid} aria-hidden />

      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <div className={styles.logoMark}><CarIcon /></div>
            <h1 className={styles.title}>Lista de Asesores</h1>
          </div>
          <div className={styles.buttonGroup}>
            <Link href="/dashboard-admin" className={`${styles.actionBtn} ${styles.secondaryBtn}`}>
              ← Volver
            </Link>
            <Link href="/crear-asesor" className={`${styles.actionBtn} ${styles.primaryBtn}`}>
              + Nuevo Asesor
            </Link>
          </div>
        </div>

        {error && <div className={`${styles.alert} ${styles.errorAlert}`}>{error}</div>}
        {success && <div className={`${styles.alert} ${styles.successAlert}`}>{success}</div>}

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>ID / Cédula</th>
                <th className={styles.th}>Nombre</th>
                <th className={styles.th}>Correo</th>
                <th className={styles.th}>Especialidad</th>
                <th className={styles.th}>Sueldo</th>
                <th className={styles.th}>Rol</th>
                <th className={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {asesores.map((asesor, index) => (
                <tr key={index} className={styles.tr}>
                  <td className={styles.td}><strong>{asesor.cedula}</strong></td>
                  <td className={styles.td}>{asesor.nombres} {asesor.apellido}</td>
                  <td className={styles.td}>{asesor.correo}</td>
                  <td className={styles.td}><span className={styles.especialidadBadge}>{asesor.especialidad}</span></td>
                  <td className={styles.td}><strong>{formatearSueldo(asesor.sueldo)}</strong></td>
                  <td className={styles.td}><span className={styles.rolBadge}>Asesor</span></td>
                  <td className={styles.td}>
                    <div className={styles.rowActions}>
                      <Link href={`/editar-asesor/${asesor.cedula}`} className={styles.editIconBtn} title="Editar">
                        <EditIcon />
                      </Link>
                      <button className={styles.deleteIconBtn} onClick={() => setAsesorAEliminar(asesor)} title="Eliminar">
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {asesores.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              No se han encontrado asesores registrados.
            </div>
          )}
        </div>
      </div>

      {asesorAEliminar && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Confirmar eliminación</h3>
            <p className={styles.modalText}>
              ¿Estás seguro de que deseas eliminar a <strong>{asesorAEliminar.nombres} {asesorAEliminar.apellido}</strong>?<br/>
              Esta acción no se puede deshacer.
            </p>
            <div className={styles.modalButtons}>
              <button className={styles.cancelModalBtn} onClick={() => setAsesorAEliminar(null)}>Cancelar</button>
              <button className={styles.confirmDeleteBtn} onClick={() => handleEliminar(asesorAEliminar)}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
