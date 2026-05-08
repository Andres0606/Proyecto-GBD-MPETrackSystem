const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const tramiteRoutes = require('./routes/tramiteRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Oracle Client Initialization (Thin mode with Wallet)
const oracledb = require('oracledb');
try {
  // Establecemos TNS_ADMIN para que Oracle encuentre los archivos de configuración
  process.env.TNS_ADMIN = process.env.WALLET_PATH;
  
  // Use Thin mode (default in v6) and specify where tnsnames.ora is
  oracledb.initOracleClient({ configDir: process.env.WALLET_PATH });
  console.log('Oracle Client initialized with configDir:', process.env.WALLET_PATH);
} catch (err) {
  console.error('Error initializing Oracle Client:', err);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/vehiculos', vehicleRoutes);
app.use('/api/citas', appointmentRoutes);
app.use('/api/tipo-tramite', tramiteRoutes);

// Root path
app.get('/', (req, res) => {
  res.json({ message: 'TransMeta Backend API is running' });
});

// Start Server
async function startServer() {
  // Iniciamos el servidor Express primero para evitar ERR_CONNECTION_REFUSED
  app.listen(PORT, () => {
    console.log(`🚀 Servidor Express escuchando en http://localhost:${PORT}`);
    console.log('⏳ Conectando a Oracle Cloud (esto puede tardar unos segundos)...');
  });

  try {
    await db.initialize();
    console.log('✅ Conexión a Oracle Cloud establecida correctamente.');
  } catch (err) {
    console.error('❌ Error crítico al conectar a Oracle:', err.message);
    console.log('⚠️ El servidor está corriendo pero las consultas a la BD fallarán.');
  }
}

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  await db.close();
  process.exit(0);
});
