# Reporte Técnico: Modernización y Analítica de Base de Datos
## Proyecto: MPE SYSTEM - Gestión de Trámites de Tránsito

Este documento detalla las implementaciones de alta complejidad realizadas en el backend de la base de datos Oracle para elevar el nivel técnico del proyecto.

### 1. Arquitectura y Normalización (3FN)
Se rediseñó la estructura física para desacoplar las ubicaciones geográficas de las entidades operativas:
- **Tabla `MUNICIPIO`**: Entidad maestra de ubicaciones.
- **Tabla `SEDE`**: Entidad que representa los puntos físicos de atención, vinculada a municipios.
- **Relaciones**: Se migraron las llaves foráneas en `ASESOR` y `CITA` para apuntar a `IDSEDE`, permitiendo reportes cruzados por ubicación geográfica.

### 2. Motor de Inteligencia de Negocio (BI Analytics)
Se implementó una capa de análisis mediante **Vistas Complejas** que procesan miles de registros en tiempo real:

#### A. Vista Analítica de Rendimiento (`VW_INTELIGENCIA_OPERATIVA`)
Utiliza funciones de ventana de última generación:
- **`LAG`**: Para comparar las ventas del mes actual contra el mes anterior y calcular el porcentaje de crecimiento.
- **`SUM() OVER`**: Para generar totales acumulados anuales sin necesidad de múltiples consultas.
- **`PIVOT`**: Para transformar filas de municipios en columnas, permitiendo una visualización matricial ideal para la toma de decisiones gerenciales.

#### B. Análisis de Eficiencia (`VW_CUELLOS_BOTELLA`)
Detecta problemas de servicio mediante el cálculo de tiempos:
- Calcula el **Tiempo Promedio de Respuesta** restando la marca de tiempo de solicitud vs. la de programación.
- Permite identificar qué sedes están saturadas y requieren más personal.

#### C. Mapa de Calor de Demanda (`VW_DEMANDA_DIARIA`)
- Utiliza **`RATIO_TO_REPORT`** para calcular el peso porcentual de cada día de la semana sobre el total de la carga de trabajo.

### 3. Programación Procedimental (PL/SQL)
- **Procedimiento `SP_REPORTE_SEDE_ESTRELLA`**: Un motor de búsqueda que utiliza cursores y lógica condicional para identificar la sede con mejor desempeño financiero en un periodo dado.
- **Manejo de Excepciones**: Implementación de bloques `TRY-CATCH` (EXCEPTION) para asegurar la integridad de los datos y respuestas controladas ante errores.

### 4. Impacto del Proyecto
Gracias a estas implementaciones, el sistema pasó de ser una simple base de datos transaccional (CRUD) a convertirse en una **Plataforma de Inteligencia de Datos**, capaz de predecir picos de demanda y evaluar la salud financiera del negocio de forma automática.
