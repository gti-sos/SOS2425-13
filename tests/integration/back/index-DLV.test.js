import request from 'supertest';
import express from 'express';
import { loadBackend } from '../../../back/index-DLV.js'; // Ajusta la ruta relativa si es necesario

let app; // Variable para nuestra app Express de prueba

// Antes de todas las pruebas en este archivo
beforeAll(() => {
  app = express(); // Crea una nueva instancia de Express
  app.use(express.json()); // Asegúrate de que use JSON middleware si tus rutas lo necesitan
  loadBackend(app); // ¡Importante! Llama a tu función para que defina las rutas en la app de prueba
});

// Describe un conjunto de pruebas para la API de National Parks
describe('API de National Parks (index-DLV)', () => {


  // Prueba para GET /api/v2/national-parks (sin filtros)
  it('GET /api/v2/national-parks debería devolver un array y status 200', async () => {
    // Realiza una petición GET a la ruta base de tu API
    const response = await request(app).get('/api/v2/national-parks');

    // Verifica que el código de estado sea 200 (OK)
    expect(response.statusCode).toBe(200);

    // Verifica que el cuerpo de la respuesta sea un array
    // (puede estar vacío si la base de datos no tiene datos, o lleno si los tiene)
    expect(Array.isArray(response.body)).toBe(true);
  });
  

});

// (Opcional) Limpiar después de las pruebas si es necesario
// afterAll(async () => {
//   // Cerrar conexiones a BD, etc.
// });