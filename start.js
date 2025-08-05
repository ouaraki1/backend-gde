// Script de démarrage pour le backend
const { spawn } = require('child_process');

// Variables d'environnement
process.env.PORT = process.env.PORT || 5000;
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/DossierDB';
process.env.JWT_SECRET = process.env.JWT_SECRET || '134567t7e4t3c67bt428348cwejh7x2h39c2783b6cn372B%@^&*38&*&@UY@NY&@&@bTB@t26&7@T&^BT@';

console.log('Starting backend with environment variables:');
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '***' : 'NOT SET');

// Démarrer le serveur

require('./server.js'); 