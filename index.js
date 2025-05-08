import express from "express";
import { handler } from './front/build/handler.js';
import cors from "cors";
import helmet from "helmet";
const app = express();
//app.disable('x-powered-by'); -solución alternativa-
const PORT = process.env.PORT || 16078;


/*
Helmet no solo elimina el encabezado X-Powered-By, 
sino que también añade otras protecciones importantes 
contra ataques comunes como XSS, clickjacking y sniffing MIME.
*/
// Añadir Helmet para mejorar la seguridad
app.use(helmet());

//app.use("/", express.static("public"));
app.use(express.json());
app.use(cors());

require('dotenv').config(); //Manejar API keys externas



// ---- PARTE BLANCA (modularizada correctamente) ----
import { loadBackend as loadBackendB } from "./back/index-BGA.js";
loadBackendB(app);



// ---- PARTE DARÍO (modularizada correctamente) ----
import { loadBackend as loadBackendD } from "./back/index-DLV.js";
loadBackendD(app);


// ---- PARTE ÁLVARO (modularizada correctamente) ----

import { loadBackend as loadBackendA } from "./back/index-AMN.js";
loadBackendA(app);


app.use(handler);


app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto :${PORT}`);
});


