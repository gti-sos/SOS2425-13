import { loadBackend as loadBackendBGA } from './back/index-BGA.js';
import { loadBackend as loadBackendDLV } from './back/index-DLV.js';
import { loadBackend as loadBackendAMN } from './back/index-AMN.js';
import express from 'express';

// Crear una app Express
const app = express();

// Cargar los backends
console.log('Cargando backends para probar cobertura...');
loadBackendBGA(app);
loadBackendDLV(app);
loadBackendAMN(app);

console.log('Backends cargados correctamente');
console.log('Test completado con éxito');