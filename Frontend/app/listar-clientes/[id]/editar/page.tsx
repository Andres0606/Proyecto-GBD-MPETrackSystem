'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../../../CSS/Admin/EditarCliente.module.css';
import { BACKEND_URL } from '@/lib/config';

/* ── Icons ── */
const UserEditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const SaveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
);

interface EditClientPageProps {
  params: Promise<{ id: string }>;
}

export default function EditarClientePage({ params }: EditClientPageProps) {
  const router = useRouter();
  const { id } = use(params);
  
  const [formData, setFormData] = useState({
    nombres: '',
    apellido: '',
    telefono: '',
    correo: '', // Solo lectura
    licencia: 'N'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userRole = sessionStorage.getItem('userRole');
    if (!isLoggedIn || userRole === '1' || userRole === '2') {
      router.push('/dashboard');
      return;
    }
    cargarDatosCliente();
  }, [id]);

  const cargarDatosCliente = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/clientes/${id}`);
      const data = await response.json();
      
      if (response.ok && data.status === 'OK') {
        setFormData({
          nombres: data.cliente.nombres,
          apellido: data.cliente.apellido,
          telefono: data.cliente.telefono,
          correo: data.cliente.correo,
          licencia: data.cliente.licencia
        });
      } else {
        setMessage({ type: 'error', text: data.mensaje || 'No se pudo cargar el cliente' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await fetch(`${BACKEND_URL}/api/clientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (response.ok && data.status === 'OK') {
        setMessage({ type: 'success', text: '¡Cliente actualizado correctamente!' });
        setTimeout(() => router.push('/listar-clientes'), 2000);
      } else {
        setMessage({ type: 'error', text: data.mensaje || 'Error al actualizar' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.loading}>Cargando datos...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        
        {/* Header */}
        <div className={styles.header}>
          <Link href="/listar-clientes" className={styles.backBtn}>
            <ArrowLeftIcon />
          </Link>
          <div className={styles.titleArea}>
            <div className={styles.iconBox}><UserEditIcon /></div>
            <div>
              <h1>Editar Cliente</h1>
              <p>Actualiza la información del usuario <strong>{id}</strong></p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className={styles.form}>
          
          <div className={styles.grid}>
            <div className={styles.inputGroup}>
              <label>Nombres</label>
              <input 
                type="text" 
                value={formData.nombres}
                onChange={(e) => setFormData({...formData, nombres: e.target.value})}
                required
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label>Apellidos</label>
              <input 
                type="text" 
                value={formData.apellido}
                onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Correo Electrónico (No editable)</label>
              <input 
                type="email" 
                value={formData.correo}
                disabled
                className={styles.disabledInput}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Teléfono</label>
              <input 
                type="text" 
                value={formData.telefono}
                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>¿Tiene Licencia?</label>
              <select 
                value={formData.licencia}
                onChange={(e) => setFormData({...formData, licencia: e.target.value})}
                className={styles.select}
              >
                <option value="S">Sí, tiene licencia</option>
                <option value="N">No tiene licencia</option>
              </select>
            </div>
          </div>

          {message.text && (
            <div className={`${styles.alert} ${message.type === 'success' ? styles.success : styles.error}`}>
              {message.text}
            </div>
          )}

          <div className={styles.actions}>
            <Link href="/listar-clientes" className={styles.cancelBtn}>Cancelar</Link>
            <button type="submit" className={styles.submitBtn} disabled={saving}>
              {saving ? 'Guardando...' : <><SaveIcon /> Guardar Cambios</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
