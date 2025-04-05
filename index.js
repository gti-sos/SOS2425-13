import express from "express";
const app = express();
const PORT = process.env.PORT || 16078;

app.use("/", express.static("public"));
app.use(express.json());


//Acceder al homepage lanza un index.html de forma estatica
app.get("/", (req, res) => {
    res.sendFile(__dirname + "./public/index.html");
});

//Acceder al homepage lanza el about.html de forma estatica
app.get("/about", (req, res) => {
    res.sendFile(__dirname + "./public/about.html");
});




// ---- PARTE BLANCA (modularizada correctamente) ----
import { loadBackend } from "./src/back_D01/index-BGA.js";
loadBackend(app);


// ---- PARTE DARÍO (modularizada correctamente) ----
import { loadBackend as loadBackendD} from "./src/back_D01/index-DLV.js";
loadBackendD(app);

// Aquí puedes incluir otras partes modularizadas también (Darío, Álvaro...)

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto :${PORT}`);
});
