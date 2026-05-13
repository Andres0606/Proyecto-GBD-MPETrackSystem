'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../CSS/Admin/Auditoria.module.css';
import { BACKEND_URL } from '@/lib/config';

interface AuditLog {
  id: number;
  tabla: string;
  operacion: string;
  usuario: string;
  fecha: string;
  idRegistro: number;
  detalle: string;
}

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOp, setFilterOp] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auditoria/logs`);
      const data = await res.json();
      if (data.status === 'OK') {
        setLogs(data.logs);
        setFilteredLogs(data.logs);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = logs;
    if (filterOp !== 'Todas') {
      result = result.filter(log => log.operacion === filterOp);
    }
    if (searchTerm) {
      result = result.filter(log => 
        log.tabla.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.detalle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.usuario.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredLogs(result);
  }, [filterOp, searchTerm, logs]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className={styles.loading}>Iniciando Monitor de Seguridad...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.grid}></div>
      
      <div className={styles.inner}>
        <header className={styles.header}>
          <div className={styles.titleArea}>
            <div className={styles.iconBox}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1>Auditoría de Seguridad</h1>
              <p>Historial de cambios y trazabilidad del sistema</p>
            </div>
          </div>
          <div className={styles.actions}>
            <Link href="/dashboard-admin" className={styles.backBtn}>
               Volver
            </Link>
            <button onClick={handlePrint} className={styles.printBtn}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Exportar Reporte
            </button>
          </div>
        </header>

        <section className={styles.filterCard}>
          <div className={styles.filterGroup}>
            <label>Tipo de Operación</label>
            <select 
              className={styles.select}
              value={filterOp}
              onChange={(e) => setFilterOp(e.target.value)}
            >
              <option value="Todas">Todas las acciones</option>
              <option value="INSERT">Inserciones (Nuevos)</option>
              <option value="UPDATE">Actualizaciones</option>
              <option value="DELETE">Eliminaciones</option>
            </select>
          </div>
          <div className={styles.filterGroup} style={{ flex: 1 }}>
            <label>Buscador Inteligente</label>
            <input 
              type="text" 
              placeholder="Buscar por tabla, usuario o descripción..." 
              className={styles.input}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </section>

        <main className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tabla</th>
                  <th>Acción</th>
                  <th>Usuario</th>
                  <th>Fecha</th>
                  <th>Detalles del Cambio</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: 800 }}>#{log.id}</td>
                    <td><span style={{ fontWeight: 600 }}>{log.tabla}</span></td>
                    <td>
                      <span className={`${styles.badge} ${
                        log.operacion === 'INSERT' ? styles.insert : 
                        log.operacion === 'UPDATE' ? styles.update : styles.delete
                      }`}>
                        {log.operacion}
                      </span>
                    </td>
                    <td>{log.usuario}</td>
                    <td className={styles.fecha}>{log.fecha}</td>
                    <td className={styles.detalle} title={log.detalle}>{log.detalle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
