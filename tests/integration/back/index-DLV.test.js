import request from 'supertest';
import express from 'express';
import { loadBackend } from '../../../back/index-DLV.js';

let app;

beforeAll(() => {
    app = express();
    app.use(express.json());
    loadBackend(app);
});

describe('API de National Parks (index-DLV)', () => {

    // Añadir un test para cargar datos iniciales PRIMERO
    it('GET /loadInitialData debería cargar datos iniciales y devolver 200', async () => {
        const response = await request(app).get('/api/v2/national-parks/loadInitialData');
        
        expect([200, 405]).toContain(response.statusCode); // Acepta 200 (cargado) o 405 (ya cargado)
    });


    it('GET /api/v2/national-parks debería devolver un array y status 200 (después de cargar datos)', async () => {
        
        const response = await request(app).get('/api/v2/national-parks');
        expect(response.statusCode).toBe(200); // Ahora sí debería ser 200
        expect(Array.isArray(response.body)).toBe(true);
        // Opcional: verificar que el array no esté vacío
        expect(response.body.length).toBeGreaterThan(0);
    });

});