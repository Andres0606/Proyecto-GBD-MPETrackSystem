# 📘 Manual Técnico y de Usuario - MPE Track System

## 1. Introducción del Sistema
**MPE Track System** es una plataforma integral de gestión vehicular diseñada para centralizar procesos de tránsito, trámites de propiedad y seguimiento de servicios técnicos. El sistema utiliza una arquitectura robusta basada en **Next.js** para el frontend y **Node.js** con **Oracle Database** para el backend, garantizando alta disponibilidad y procesamiento eficiente de datos mediante Colecciones y Funciones Pipelined.

---

## 2. Tipos de Usuarios y Permisos
El sistema implementa un Control de Acceso Basado en Roles (RBAC) estructurado en tres niveles:

| Rol | Nivel | Descripción |
| :--- | :---: | :--- |
| **Cliente** | 1 | Usuario propietario de vehículos. Permisos limitados a la visualización de su propia información y solicitud de servicios. |
| **Asesor** | 2 | Personal operativo. Gestiona la ejecución de trámites y atención de citas programadas. |
| **Administrador** | 3 | Control total. Gestión de usuarios (CRUD), supervisión de personal y acceso a analítica de negocio. |

---

## 3. Módulo de Cliente (Gestión Personal)
Este módulo está diseñado para que el ciudadano tenga control total sobre sus activos vehiculares y el estado de sus procesos legales.

### 🏠 Dashboard de Usuario
*   **Ubicación**: `app/dashboard/page.tsx`
*   **Funcionalidad**: Actúa como el centro de notificaciones personal. Muestra un resumen dinámico de la actividad del usuario.
*   **Elementos Clave**:
    *   **Tarjetas de Resumen**: Conteos rápidos de vehículos registrados y trámites activos.
    *   **Acciones Rápidas**: Botones de navegación directa a trámites y citas.
*   **Acciones**: Visualizar estado global.

### 🚗 Inventario de Vehículos
*   **Ubicación**: `app/mis-vehiculos/page.tsx`
*   **Funcionalidad**: Catálogo detallado de propiedades. Utiliza una vista de cuadrícula (Grid) para mostrar la información técnica.
*   **Detalles Mostrados**: Marca, Modelo, Placa, Número de Motor, Número de Chasis y Clase de vehículo.
*   **Acciones**: Visualización técnica y consulta de especificaciones.

### 📅 Agenda de Citas
*   **Ubicación**: `app/mis-citas/page.tsx`
*   **Funcionalidad**: Historial y control de citas presenciales.
*   **Acciones**: 
    *   **Visualizar**: Consultar fechas pasadas y futuras.
    *   **Consultar Asesor**: Ver qué funcionario atenderá la solicitud.

### 📑 Seguimiento de Trámites
*   **Ubicación**: `app/mis-tramites/page.tsx`
*   **Funcionalidad**: Módulo de transparencia donde el cliente ve el progreso legal de sus solicitudes.
*   **Acciones**: 
    *   **Monitorear**: Ver si un trámite está en "PENDIENTE", "ACTIVO" o "FINALIZADO".
    *   **Consultar Costos**: Ver el desglose financiero del trámite (Valor base + Conceptos adicionales).

---

## 4. Módulo de Asesor (Gestión Operativa)
Enfocado en la productividad y la gestión de la cola de atención.

### 🎮 Panel de Control de Operaciones
*   **Ubicación**: `app/dashboard-asesor/page.tsx`
*   **Funcionalidad**: Muestra métricas de rendimiento individual del asesor.
*   **KPIs**: Citas para hoy, trámites procesados exitosamente.
*   **Acciones**: Gestión de prioridades diarias.

### 📅 Gestión de Agenda Diaria
*   **Ubicación**: `app/asesor/citas/page.tsx`
*   **Funcionalidad**: Tabla interactiva con los clientes asignados por el sistema de turnos.
*   **Acciones**: 
    *   **Gestionar**: Cambiar estados de cita (Atendida, Cancelada).
    *   **Visualizar**: Ver datos del vehículo y del trámite antes de la atención.

### 🛠️ Procesamiento Técnico de Trámites
*   **Ubicación**: `app/asesor/tramites/page.tsx`
*   **Funcionalidad**: Es la página más compleja a nivel técnico. Permite procesar traspasos y radicaciones.
*   **Características Especiales**:
    *   Muestra datos del dueño actual y del dueño destino (en caso de Traspaso).
    *   Carga datos mediante la función `fn_get_tramites_asesor` para optimizar la visualización de grandes tablas.
*   **Acciones**: Editar estados de trámites y validar documentación.

---

## 5. Módulo de Administrador (Control y Analítica)
Centro neurálgico para la toma de decisiones estratégicas.

### 🏛️ Consola de Administración
*   **Ubicación**: `app/dashboard-admin/page.tsx`
*   **Funcionalidad**: Panel de control con acceso a los módulos de auditoría y gestión de personal.
*   **Acciones**: Punto de entrada a todas las funciones críticas de gestión.

### 👥 Maestro de Clientes (CRUD)
*   **Ubicación**: `app/listar-clientes/page.tsx`
*   **Funcionalidad**: Gestión total de la base de datos de usuarios.
*   **Componentes Clave**:
    *   **Barra de Búsqueda**: Filtrado en tiempo real por nombre, apellido o cédula.
    *   **Modal de Historial 🕒**: Al hacer clic en el icono de reloj, se abre una ventana emergente (`modalOverlay`) que carga el historial de trámites del cliente usando una **Colección de Oracle** (`fn_get_historial_cliente`).
    *   **Botón Eliminar**: Borra al usuario tras confirmación. Incluye lógica de seguridad (Trigger) que impide borrar clientes con citas vigentes.
*   **Acciones**: Crear (vía registro), Editar, Eliminar, Visualizar historial, Filtrar.

### 📝 Editor de Perfil de Cliente
*   **Ubicación**: `app/listar-clientes/[id]/editar/page.tsx`
*   **Funcionalidad**: Formulario de actualización de datos sensibles.
*   **Campos**: Nombres, Apellidos, Teléfono y Estado de Licencia de Conducción.
*   **Acciones**: Modificar y persistir cambios en la tabla `PERSONA` y `CLIENTE`.

### 📊 Inteligencia de Negocios (BI)
*   **Ubicación**: `app/reportes/page.tsx`
*   **Funcionalidad**: Visualización de datos estadísticos del sistema.
*   **Gráficos y KPIs**:
    *   **Distribución de Trámites**: Gráfico de barras dinámico con colores semánticos (Naranja: Pendiente, Azul: Activo, Verde: Finalizado).
    *   **Ingresos por Tipo**: Desglose financiero por categorías de trámites.
    *   **Productividad de Asesores**: Ranking de atención de citas.
*   **Acciones**: Análisis de datos y exportación visual de métricas.

---

## 6. Flujo de Navegación y ejemplos de Uso

### Ejemplo 1: Flujo de Gestión de un Traspaso
1.  **Cliente**: Ingresa a `app/agendar-cita/` y solicita turno para Traspaso.
2.  **Admin**: Visualiza el movimiento en `app/reportes/` como una nueva cita pendiente.
3.  **Asesor**: Ve la cita en `app/asesor/citas/`, atiende al cliente y actualiza el trámite en `app/asesor/tramites/`.
4.  **Admin**: Consulta el éxito del trámite en el historial del cliente desde `app/listar-clientes/`.

---

## 7. Conclusiones y Recomendaciones de Uso
*   **Seguridad**: Nunca comparta su contraseña. El sistema cerrará sesión automáticamente si detecta inactividad.
*   **Rendimiento**: Se recomienda el uso de navegadores modernos (Chrome, Edge) para una renderización óptima de los gráficos de reportes.
*   **Soporte**: En caso de errores `ORA-XXXX`, contacte al administrador del sistema indicando el código de error reportado por el backend.
