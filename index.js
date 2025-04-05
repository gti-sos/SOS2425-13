import express from "express";
const app = express();
const PORT = process.env.PORT || 16078;

app.use("/", express.static("public"));
app.use(express.json());


// ---- PARTE BLANCA (modularizada correctamente) ----
import { loadBackend as loadBackendB} from "./src/back_D01/index-BGA.js";
loadBackendB(app);


// ---- PARTE DARÍO (modularizada correctamente) ----
import { loadBackend as loadBackendD} from "./src/back_D01/index-DLV.js";
loadBackendD(app);


// ---- PARTE ÁLVARO (modularizada correctamente) ----

import { loadBackend as loadBackendDA } from "./src/back_D01/index-AMN.js";
loadBackendDA(app);


app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto :${PORT}`);
});
