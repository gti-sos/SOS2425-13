import express from "express";
const app = express();
const PORT = process.env.PORT || 16078;
const BASE_API = "/api/v1";

app.use(express.static("public"));
app.use(express.json());

app.get("/", (req, res) => {
    res.send(`
        <h1>Bienvenido a la API del Grupo 13</h1>
    `);
});

app.get("/about", (req, res) => {
    res.sendFile("/public/about.html");
});

// ---- PARTE BLANCA (modularizada correctamente) ----
import { loadBackend } from "./src/back_D01/index-BGA.js";
loadBackend(app);

// Aquí puedes incluir otras partes modularizadas también (Darío, Álvaro...)

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto :${PORT}`);
});
