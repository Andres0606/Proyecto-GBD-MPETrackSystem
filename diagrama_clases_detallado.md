# 📊 Diagrama de Clases Textual - MPE Track System

Este documento detalla cada clase y archivo del sistema, estructurado para la elaboración directa de un diagrama UML.

---

## 🖥️ MÓDULOS DE FRONTEND (Next.js)

### Relaciones del archivo/clase: `app/login/page.tsx`
*   **Nombre del archivo relacionado**: `Backend/routes/authRoutes.js`
    *   **Tipo de relación**: Dependencia.
    *   **Cardinalidad**: 1:1.
    *   **Explicación**: El login depende de la ruta de autenticación para enviar el correo y verificar el OTP introducido por el usuario.

### Clase: `LoginPage`
**Variables:**
*   `email`: String
*   `otp`: String
*   `step`: Number
*   `loading`: Boolean

**Métodos:**
*   `handleSendOtp()`
*   `handleVerifyOtp()`

**Descripción:**
Punto de entrada seguro del sistema. Se encarga de capturar el correo, solicitar un código temporal y validarlo antes de permitir el acceso.

---

### Relaciones del archivo/clase: `app/mis-vehiculos/page.tsx`
*   **Nombre del archivo relacionado**: `Backend/routes/vehicleRoutes.js`
    *   **Tipo de relación**: Dependencia.
    *   **Cardinalidad**: 1:1.
    *   **Explicación**: La página consume el endpoint de vehículos para obtener la lista técnica de activos del cliente.

### Clase: `MisVehiculosPage`
**Variables:**
*   `vehiculos`: Array de Objetos (Vehiculo)
*   `loading`: Boolean
*   `error`: String

**Métodos:**
*   `cargarVehiculos()`

**Descripción:**
Interfaz del cliente que renderiza un catálogo visual con los detalles técnicos (chasis, motor, placa) de los vehículos de su propiedad.

---

### Relaciones del archivo/clase: `app/agendar-cita/page.tsx`
*   **Nombre del archivo relacionado**: `Backend/routes/appointmentRoutes.js`
    *   **Tipo de relación**: Dependencia.
    *   **Cardinalidad**: 1:1.
    *   **Explicación**: Envía el formulario para persistir una nueva cita.
*   **Nombre del archivo relacionado**: `Backend/routes/vehicleRoutes.js`
    *   **Tipo de relación**: Dependencia.
    *   **Cardinalidad**: 1:1.
    *   **Explicación**: Carga los vehículos disponibles del usuario para mostrarlos en el select del formulario.

### Clase: `AgendarCitaPage`
**Variables:**
*   `formData`: Object
*   `vehiculosDisponibles`: Array de Objetos
*   `tiposTramite`: Array de Objetos

**Métodos:**
*   `fetchData()`
*   `handleSubmit()`

**Descripción:**
Formulario interactivo para que el usuario asocie un vehículo de su propiedad con un tipo de trámite y solicite una cita presencial.

---

### Relaciones del archivo/clase: `app/registro/page.tsx`
*   **Nombre del archivo relacionado**: `Backend/routes/authRoutes.js`
    *   **Tipo de relación**: Dependencia.
    *   **Cardinalidad**: 1:1.
    *   **Explicación**: El formulario envía el payload de datos personales para la creación de un nuevo usuario en la BD.

### Clase: `RegistroPage`
**Variables:**
*   `formData`: Object (Cédula, Nombres, Correo, etc.)
*   `loading`: Boolean

**Métodos:**
*   `handleChange(e)`
*   `handleSubmit(e)`

**Descripción:**
Formulario de alta en el sistema para que nuevos usuarios puedan convertirse en Clientes.

---

### Relaciones del archivo/clase: `app/dashboard/page.tsx`
*   **Nombre del archivo relacionado**: `Backend/routes/dashboardRoutes.js`
    *   **Tipo de relación**: Dependencia.
    *   **Cardinalidad**: 1:1.
    *   **Explicación**: Consume el endpoint `/stats/:cedula` para obtener las métricas globales del usuario.

### Clase: `DashboardClientePage`
**Variables:**
*   `resumen`: Object (Trámites activos, multas, citas)
*   `loading`: Boolean

**Métodos:**
*   `fetchResumen()`

**Descripción:**
Panel principal de bienvenida del Cliente, actúa como un hub informativo del estado general de sus solicitudes.

---

### Relaciones del archivo/clase: `app/mis-citas/page.tsx`
*   **Nombre del archivo relacionado**: `Backend/routes/appointmentRoutes.js`
    *   **Tipo de relación**: Dependencia.
    *   **Cardinalidad**: 1:1.
    *   **Explicación**: Obtiene y renderiza el historial de agendamientos pasados y futuros del cliente.

### Clase: `MisCitasPage`
**Variables:**
*   `citas`: Array de Objetos (Cita)
*   `loading`: Boolean

**Métodos:**
*   `cargarCitas()`

**Descripción:**
Módulo de autogestión donde el cliente revisa el estatus, fecha y hora de sus citas programadas.

---

### Relaciones del archivo/clase: `app/mis-tramites/page.tsx`
*   **Nombre del archivo relacionado**: `Backend/routes/tramiteRoutes.js`
    *   **Tipo de relación**: Dependencia.
    *   **Cardinalidad**: 1:1.
    *   **Explicación**: Recupera la trazabilidad legal y financiera de los trámites.

### Clase: `MisTramitesPage`
**Variables:**
*   `tramites`: Array de Objetos (Tramite)
*   `loading`: Boolean

**Métodos:**
*   `cargarTramites()`

**Descripción:**
Historial legal de los procesos iniciados por el cliente, incluyendo costos y estados de avance.

---

### Relaciones del archivo/clase: `app/dashboard-asesor/page.tsx`
*   **Nombre del archivo relacionado**: `Backend/routes/dashboardRoutes.js`
    *   **Tipo de relación**: Dependencia.
    *   **Cardinalidad**: 1:1.
    *   **Explicación**: Obtiene métricas de rendimiento y tareas pendientes para el asesor logueado.

### Clase: `DashboardAsesorPage`
**Variables:**
*   `stats`: Object (KPIs de productividad diarios)
*   `loading`: Boolean

**Métodos:**
*   `fetchStats()`

**Descripción:**
Panel de control operativo diseñado para que los funcionarios puedan medir su flujo de trabajo.

---

### Relaciones del archivo/clase: `app/asesor/citas/page.tsx`
*   **Nombre del archivo relacionado**: `Backend/routes/appointmentRoutes.js`
    *   **Tipo de relación**: Dependencia.
    *   **Cardinalidad**: 1:1.
    *   **Explicación**: Consume el listado de clientes en espera para el día actual.

### Clase: `AsesorCitasPage`
**Variables:**
*   `colaAtencion`: Array de Objetos (Cita)
*   `loading`: Boolean

**Métodos:**
*   `cargarCola()`
*   `atenderCita(id)`

**Descripción:**
Módulo de gestión de atención presencial donde el asesor controla el avance de su agenda diaria.

---

### Relaciones del archivo/clase: `app/asesor/tramites/page.tsx`
*   **Nombre del archivo relacionado**: `Backend/routes/tramiteRoutes.js`
    *   **Tipo de relación**: Dependencia.
    *   **Cardinalidad**: 1:1.
    *   **Explicación**: Permite visualizar y mutar el estado técnico de cada radicado.

### Clase: `AsesorTramitesPage`
**Variables:**
*   `tramitesActivos`: Array de Objetos (TramiteDetallado)
*   `loading`: Boolean

**Métodos:**
*   `cargarTramites()`
*   `actualizarEstado(id, estado)`

**Descripción:**
Consola técnica avanzada utilizada por los asesores para empujar los trámites vehiculares por su ciclo de vida legal.

---

### Relaciones del archivo/clase: `app/consultas/page.tsx`
*   **Nombre del archivo relacionado**: `Backend/routes/consultasRoutes.js`
    *   **Tipo de relación**: Dependencia.
    *   **Cardinalidad**: 1:1.
    *   **Explicación**: Consume el endpoint para recuperar el historial de peticiones de atención al cliente.

### Clase: `ConsultasPage`
**Variables:**
*   `resultados`: Array de Objetos
*   `query`: String

**Métodos:**
*   `buscar()`

**Descripción:**
Módulo dedicado a las solicitudes generales (PQR) y a la interacción entre el cliente y el área de soporte del MPE.

---

### Relaciones del archivo/clase: `app/dashboard-admin/page.tsx`
*   **Nombre del archivo relacionado**: `Backend/routes/dashboardRoutes.js`
    *   **Tipo de relación**: Dependencia.
    *   **Cardinalidad**: 1:1.
    *   **Explicación**: Llama al endpoint de estadísticas globales (admin-stats).
*   **Nombre del archivo relacionado**: `app/listar-clientes/page.tsx`
    *   **Tipo de relación**: Asociación.
    *   **Cardinalidad**: 1:N.
    *   **Explicación**: Navegación hacia otros submódulos administrativos.

### Clase: `DashboardAdminPage`
**Variables:**
*   `statsAdmin`: Object (Totales del sistema)

**Métodos:**
*   `fetchAdminStats()`

**Descripción:**
El nivel más alto de jerarquía. Ofrece una vista panorámica del rendimiento del negocio y accesos rápidos a la gestión de personal.

---
### Relaciones del archivo/clase: `app/listar-clientes/page.tsx`
*   **Nombre del archivo relacionado**: `Backend/routes/clientRoutes.js`
    *   **Tipo de relación**: Dependencia.
    *   **Cardinalidad**: 1:1.
    *   **Explicación**: Obtiene el listado completo de clientes y permite ejecutar borrados u obtener historiales.
*   **Nombre del archivo relacionado**: `app/listar-clientes/[id]/editar/page.tsx`
    *   **Tipo de relación**: Asociación.
    *   **Cardinalidad**: 1:1.
    *   **Explicación**: Permite la navegación lógica hacia la pantalla de edición del usuario seleccionado.

### Clase: `ListarClientesPage`
**Variables:**
*   `clientes`: Array de Objetos (Cliente)
*   `searchTerm`: String
*   `showHistory`: Boolean
*   `clientHistory`: Array de Objetos (Tramite)

**Métodos:**
*   `cargarClientes()`
*   `verHistorial(cedula)`
*   `eliminarCliente(cedula)`

**Descripción:**
Módulo administrativo maestro para visualizar, buscar y auditar usuarios, incorporando un modal dinámico para historiales.

---

### Relaciones del archivo/clase: `app/listar-clientes/[id]/editar/page.tsx`
*   **Nombre del archivo relacionado**: `Backend/routes/clientRoutes.js`
    *   **Tipo de relación**: Dependencia.
    *   **Cardinalidad**: 1:1.
    *   **Explicación**: Consume el endpoint para obtener los datos actuales del usuario y para enviar la actualización (PUT).

### Clase: `EditarClientePage`
**Variables:**
*   `formData`: Object
*   `loading`: Boolean

**Métodos:**
*   `cargarCliente()`
*   `handleSubmit()`

**Descripción:**
Formulario dinámico que permite a los roles administrativos o al propio cliente mutar la información básica de su cuenta (nombres, teléfono, licencia).

---

### Relaciones del archivo/clase: `app/reportes/page.tsx`
*   **Nombre del archivo relacionado**: `Backend/routes/reportRoutes.js`
    *   **Tipo de relación**: Dependencia.
    *   **Cardinalidad**: 1:1.
    *   **Explicación**: El componente se alimenta del motor de inteligencia de negocios para renderizar las métricas.

### Clase: `ReportesPage`
**Variables:**
*   `data`: Object (Métricas de citas, trámites por estado, rentabilidad)
*   `loading`: Boolean

**Métodos:**
*   `fetchReportes()`

**Descripción:**
Panel analítico (Business Intelligence) destinado a proveer gráficos y cuadros estadísticos de alto nivel para la toma de decisiones empresariales.

---

### Relaciones del archivo/clase: `app/crear-asesor/page.tsx`
*   **Nombre del archivo relacionado**: `Backend/routes/authRoutes.js`
    *   **Tipo de relación**: Dependencia.
    *   **Cardinalidad**: 1:1.
    *   **Explicación**: El Administrador utiliza la misma ruta lógica de creación de usuarios, pero forzando el tipo de rol a Asesor (Rol 2).

### Clase: `CrearAsesorPage`
**Variables:**
*   `formData`: Object (Datos corporativos del nuevo funcionario)
*   `loading`: Boolean

**Métodos:**
*   `handleSubmit()`

**Descripción:**
Módulo exclusivo del administrador diseñado para la alta y validación de nuevos miembros del personal operativo de MPE.

---

### Relaciones del archivo/clase: `app/asesor/clientes/page.tsx`
*   **Nombre del archivo relacionado**: `Backend/routes/clientRoutes.js`
    *   **Tipo de relación**: Dependencia.
    *   **Cardinalidad**: 1:1.
    *   **Explicación**: El asesor consume esta ruta para listar únicamente los clientes que han interactuado con él en el pasado.

### Clase: `AsesorClientesPage`
**Variables:**
*   `clientes`: Array de Objetos (Cliente)
*   `loading`: Boolean

**Métodos:**
*   `cargarClientesAsesor()`

**Descripción:**
Módulo para que el Asesor lleve un control de su cartera de clientes atendidos, pudiendo visualizar sus datos de contacto y trámites pasados.

---

### Relaciones del archivo/clase: `app/citas/solicitar/page.tsx`
*   **Nombre del archivo relacionado**: `Backend/routes/appointmentRoutes.js`
    *   **Tipo de relación**: Dependencia.
    *   **Cardinalidad**: 1:1.
    *   **Explicación**: Envía la solicitud formal de agendamiento.
*   **Nombre del archivo relacionado**: `Backend/routes/vehicleRoutes.js`
    *   **Tipo de relación**: Dependencia.
    *   **Cardinalidad**: 1:1.
    *   **Explicación**: Obtiene el catálogo de vehículos del usuario.

### Clase: `SolicitarCitaPage`
**Variables:**
*   `formData`: Object
*   `vehiculosDisponibles`: Array de Objetos

**Métodos:**
*   `fetchData()`
*   `handleSubmit()`

**Descripción:**
Flujo interactivo principal para que los clientes soliciten atención presencial vinculando un vehículo y un tipo de trámite.

---

### Relaciones del archivo/clase: `app/vehiculos/page.tsx` (y registrar)
*   **Nombre del archivo relacionado**: `app/components/RegistrarVehiculoForm.tsx`
    *   **Tipo de relación**: Composición.
    *   **Cardinalidad**: 1:1.
    *   **Explicación**: La página renderiza y encapsula el formulario como un componente hijo.

### Clase: `VehiculosPage`
**Variables:** Ninguna (Delega el estado al componente).

**Métodos:** Ninguno.

**Descripción:**
Página contenedora encargada de mostrar la interfaz para la gestión y alta de nuevos vehículos en el sistema.

---

### Relaciones del archivo/clase: `app/components/RegistrarVehiculoForm.tsx`
*   **Nombre del archivo relacionado**: `Backend/routes/vehicleRoutes.js`
    *   **Tipo de relación**: Dependencia.
    *   **Cardinalidad**: 1:1.
    *   **Explicación**: Ejecuta la mutación (POST) para persistir el nuevo activo.

### Clase: `RegistrarVehiculoForm`
**Variables:**
*   `formData`: Object (Placa, Chasis, Motor, etc.)
*   `loading`: Boolean

**Métodos:**
*   `handleSubmit()`

**Descripción:**
Componente de React puro encargado de capturar y validar técnicamente los datos del automotor antes de enviarlos al backend.

---

### Relaciones del archivo/clase: `app/components/FaceCapture.tsx`
*   **Nombre del archivo relacionado**: `Backend/routes/biometricRoutes.js`
    *   **Tipo de relación**: Dependencia.
    *   **Cardinalidad**: 1:1.
    *   **Explicación**: Consume el servicio de comparación facial o dactilar.

### Clase: `FaceCapture`
**Variables:**
*   `imageSrc`: String (Base64)
*   `isMatched`: Boolean

**Métodos:**
*   `capture()`
*   `verifyIdentity()`

**Descripción:**
Componente de seguridad avanzada que accede a los periféricos del hardware para garantizar la identidad del usuario durante procesos legales sensibles.

---

### Relaciones del archivo/clase: `app/editar-asesor/page.tsx`
*   **Nombre del archivo relacionado**: `Backend/routes/authRoutes.js`
    *   **Tipo de relación**: Dependencia.
    *   **Cardinalidad**: 1:1.
    *   **Explicación**: Permite la actualización de las credenciales y datos del funcionario.

### Clase: `EditarAsesorPage`
**Variables:**
*   `formData`: Object

**Métodos:**
*   `cargarAsesor()`
*   `handleSubmit()`

**Descripción:**
Pantalla administrativa para gestionar la información de los empleados operativos del sistema.

---

### Relaciones del archivo/clase: `app/Inicio/page.tsx`
*   **Nombre del archivo relacionado**: Ninguno directo (Página estática/Informativa).
    *   **Tipo de relación**: N/A.
    *   **Cardinalidad**: N/A.
    *   **Explicación**: Punto de inicio puramente visual.

### Clase: `InicioPage`
**Variables:** Ninguna.

**Métodos:** Ninguno.

**Descripción:**
Landing page del sistema MPE Track System. Ofrece información corporativa, rutas hacia el inicio de sesión y publicidad de los servicios.

---

### Relaciones del archivo/clase: `app/listar-asesores/page.tsx`
*   **Nombre del archivo relacionado**: `Backend/routes/clientRoutes.js` (u otra API de gestión administrativa).
    *   **Tipo de relación**: Dependencia.
    *   **Cardinalidad**: 1:1.
    *   **Explicación**: Solicita a la base de datos la lista del personal con rol 2.

### Clase: `ListarAsesoresPage`
**Variables:**
*   `asesores`: Array de Objetos

**Métodos:**
*   `cargarAsesores()`

**Descripción:**
Módulo exclusivo del administrador para visualizar y auditar al personal operativo activo en la sucursal.

---

### Relaciones del archivo/clase: `app/perfil/page.tsx`
*   **Nombre del archivo relacionado**: `Backend/routes/clientRoutes.js`
    *   **Tipo de relación**: Dependencia.
    *   **Cardinalidad**: 1:1.
    *   **Explicación**: Consume los datos de la sesión actual y permite la edición del perfil.

### Clase: `PerfilPage`
**Variables:**
*   `perfilData`: Object

**Métodos:**
*   `fetchPerfil()`
*   `updatePerfil()`

**Descripción:**
Interfaz personal donde cualquier usuario logueado (Cliente, Asesor o Admin) puede gestionar su información de cuenta y configuraciones de seguridad.

---

## ⚙️ CAPA DE RUTAS Y CONTROLADORES (Backend)

### Relaciones del archivo/clase: `Backend/routes/authRoutes.js`
*   **Nombre del archivo relacionado**: `Backend/controller/authController.js`
    *   **Tipo de relación**: Composición.
    *   **Cardinalidad**: 1:1.
    *   **Explicación**: La ruta no tiene lógica propia, se compone de los métodos del controlador para delegar la ejecución de las peticiones HTTP.

### Clase: `AuthRoutes`
**Variables:**
*   `router`: Express.Router

**Métodos:**
*   `POST /send-otp`
*   `POST /verify-otp`
*   `POST /register`

**Descripción:**
Define los endpoints públicos para la autenticación y registro, enrutando el tráfico hacia el controlador específico.

---

### Relaciones del archivo/clase: `Backend/controller/authController.js`
*   **Nombre del archivo relacionado**: `Backend/service/authService.js`
    *   **Tipo de relación**: Agregación.
    *   **Cardinalidad**: 1:1.
    *   **Explicación**: El controlador utiliza (agrega) el servicio para procesar las reglas de negocio, manteniendo separada la capa de HTTP de la capa de lógica.

### Clase: `AuthController`
**Variables:** Ninguna (Clase sin estado).

**Métodos:**
*   `sendOtp(req, res)`
*   `verifyOtp(req, res)`
*   `register(req, res)`

**Descripción:**
Recibe las peticiones HTTP, extrae el cuerpo (body) y parámetros, llama a la capa de servicio y formatea la respuesta JSON final.

---

### Relaciones del archivo/clase: `Backend/routes/clientRoutes.js`
*   **Nombre del archivo relacionado**: `Backend/index.js`
    *   **Tipo de relación**: Composición.
    *   **Cardinalidad**: 1:1.
    *   **Explicación**: Es parte vital de la aplicación Express global.
*   **Nombre del archivo relacionado**: Base de Datos Oracle (Tablas CLIENTE y PERSONA)
    *   **Tipo de relación**: Dependencia (Lógica Integrada).
    *   **Cardinalidad**: 1:N.
    *   **Explicación**: Al no tener controlador ni servicio, este archivo depende directamente de ejecutar consultas SQL hacia la base de datos para recuperar múltiples clientes.

### Clase: `ClientRoutes` (Ruta con lógica integrada)
**Variables:**
*   `router`: Express.Router
*   `connection`: OracleDB.Connection

**Métodos:**
*   `GET /all`
*   `GET /:cedula`
*   `PUT /:cedula`
*   `DELETE /:cedula`
*   `GET /:cedula/historial`

**Descripción:**
Módulo que implementa el patrón Active Record. Actúa como ruta, controlador y servicio al mismo tiempo para gestionar todo el CRUD de los clientes en el sistema.

---

## 🗄️ CAPA DE SERVICIOS Y REPOSITORIOS (Lógica de Negocio)

### Relaciones del archivo/clase: `Backend/service/authService.js`
*   **Nombre del archivo relacionado**: `Backend/repository/personaRepository.js`
    *   **Tipo de relación**: Composición.
    *   **Cardinalidad**: 1:1.
    *   **Explicación**: El servicio instancia al repositorio obligatoriamente para poder consultar si la persona existe.
*   **Nombre del archivo relacionado**: `Backend/repository/clienteRepository.js`
    *   **Tipo de relación**: Composición.
    *   **Cardinalidad**: 1:1.
    *   **Explicación**: Se requiere para crear el rol en caso de un nuevo registro.

### Clase: `AuthService`
**Variables:**
*   `transporter`: Objeto de Nodemailer (Manejo de emails).
*   `otpStore`: Mapa temporal en memoria.

**Métodos:**
*   `generateAndSendOTP(email)`
*   `validateOTP(email, otp)`
*   `registerUser(userData)`

**Descripción:**
Contiene toda la complejidad del negocio: desde enviar correos electrónicos reales hasta aplicar validaciones matemáticas o de negocio antes de ordenar la inserción en la base de datos.

---

### Relaciones del archivo/clase: `Backend/repository/personaRepository.js`
*   **Nombre del archivo relacionado**: Conexión DB (Oracle)
    *   **Tipo de relación**: Dependencia.
    *   **Cardinalidad**: 1:1.
    *   **Explicación**: Requiere de una conexión activa a la base de datos para operar.

### Clase: `PersonaRepository`
**Variables:** Ninguna (Se le pasa la conexión por parámetro).

**Métodos:**
*   `findByDocumento(connection, cedula)`
*   `create(connection, data)`

**Descripción:**
Capa más profunda de abstracción. Su única responsabilidad es ejecutar sentencias SQL (Select, Insert) sobre la tabla PERSONA, aislando el código SQL del resto de la aplicación JavaScript.
