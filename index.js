import express from "express";
import {handler} from './front/build/handler.js';
import cors from "cors";
const app = express();
const PORT = process.env.PORT || 16078;





//app.use("/", express.static("public"));
app.use(express.json());
app.use(cors());



// ---- PARTE BLANCA (modularizada correctamente) ----
import { loadBackend as loadBackendB } from "./back/index-BGA.js";
loadBackendB(app);



// ---- PARTE DARÍO (modularizada correctamente) ----
import { loadBackend as loadBackendD} from "./back/index-DLV.js";
loadBackendD(app);


// ---- PARTE ÁLVARO (modularizada correctamente) ----

import { loadBackend as loadBackendA } from "./back/index-AMN.js";
loadBackendA(app);


app.use(handler);


app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto :${PORT}`);
});


