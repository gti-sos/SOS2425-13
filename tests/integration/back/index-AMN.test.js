import request from 'supertest';
import express from 'express';
import { loadBackend } from '../../../back/index-AMN.js';
import helmet from 'helmet';

const app = express();

beforeAll(() => {
  app.use(helmet());
  app.use(express.json());
  loadBackend(app);
});

describe('API de Incendios Forestales (index-AMN)', () => {

    //Test para cargar datos iniciales 
    it('GET /loadInitialData debería cargar datos iniciales y devolver 200', async () => {
        const response = await request(app).get('/api/v1/forest-fires/loadInitialData');
        expect([200, 405]).toContain(response.statusCode); // Acepta 200 (cargado) o 405 (ya cargado)
    });

    // Test para comprobar que se listan los datos tras su carga
    it('GET /api/v1/forest-fires debería devolver un array y status 200 (después de cargar datos)', async () => { 
        const response = await request(app).get('/api/v1/forest-fires');
        expect(response.statusCode).toBe(200); // Ahora sí debería ser 200
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

});