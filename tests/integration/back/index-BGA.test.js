import request from 'supertest';
import express from 'express';
import { loadBackend } from '../../../back/index-BGA.js';
import helmet from 'helmet';

const app = express();

beforeAll(() => {
  app.use(helmet());
  app.use(express.json());
  loadBackend(app);
});

describe('API de Water Supply Improvements (index-BGA)', () => {

  // Añadir un test para cargar datos iniciales PRIMERO
  it('GET /loadInitialData debería cargar datos iniciales y devolver 200 o 405', async () => {
    const response = await request(app).get('/api/v1/water-supply-improvements/loadInitialData');
    expect([200, 405]).toContain(response.statusCode);
  });

  // Test para listado tras cargar datos
  it('GET /api/v1/water-supply-improvements debería devolver un array y status 200', async () => {
    const response = await request(app).get('/api/v1/water-supply-improvements');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

});
