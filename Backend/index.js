const ws = require('ws');
global.WebSocket = ws;
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
dotenv.config();

const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const tramiteRoutes = require('./routes/tramiteRoutes');
const consultasRoutes = require('./routes/consultasRoutes');
const clientRoutes = require('./routes/clientRoutes');
const biometricRoutes = require('./routes/biometricRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

const oracledb = require('oracledb');
try {
  // En Linux, configDir debe ser la ruta a la Wallet
  process.env.TNS_ADMIN = process.env.WALLET_PATH;
  oracledb.initOracleClient({ configDir: process.env.WALLET_PATH });
  console.log('✅ Oracle Client inicializado en:', process.env.WALLET_PATH);
} catch (err) {
  console.error('❌ Error initializing Oracle Client:', err.message);
}

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/vehiculos', vehicleRoutes);
app.use('/api/citas', appointmentRoutes);
app.use('/api/tipo-tramite', tramiteRoutes);
app.use('/api/tramite', tramiteRoutes);
app.use('/api/consultas', consultasRoutes);
app.use('/api/clientes', clientRoutes);
app.use('/api/biometric', biometricRoutes);
app.use('/api/reportes', reportRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'TransMeta Backend API is running' });
});

async function startServer() {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor Express escuchando en el puerto ${PORT}`);
  });

  try {
    await db.initialize();
    console.log('✅ Conexión a Oracle Cloud establecida.');
  } catch (err) {
    console.error('❌ Error en DB:', err.message);
  }
}

startServer();

process.on('SIGINT', async () => {
  await db.close();
  process.exit(0);
});
