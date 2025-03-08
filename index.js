const express = require("express");
const cool = require("cool-ascii-faces");
const app = express();
const PORT = process.env.PORT || 16078;

app.use(express.static("public"));


app.get("/", (req, res) => {
    res.send(`
        <h1>Bienvenido a la API del Grupo 13</h1>
       
    `);
});

app.get("/about", (req, res) => {
    res.sendFile(__dirname + "/public/about.html");
});

app.get("/cool", (req, res) => {
    res.send(`<h1>${cool()}</h1>`);
});




//PARTE BLANCA GARCÍA ALONSO
const datosB = require("./index-BGA.js");


app.get("/samples/BGA", (req, res) => {
    let resultado = "<h2> MEDIA DE PROYECTOS POR COMUNIDAD</h2>";
    const comunidades= ["andalucia","aragon","asturias","baleares","canarias","cantabria","castilla y leon","castilla-La mancha","catalunia","valencia","extremadura","galicia","madrid","murcia","pais vasco"];
    comunidades.forEach(comunidad => {
        resultado  += `<p> <h4>Media de project_count en ${comunidad}:</h4> ${calcularMediaProyectos(comunidad)} </p>`;
    });

    res.send(resultado);
});



function calcularMediaProyectos(comunidad) {
    let datosFiltrados = datosB.filter(d => d.comunidad === comunidad);
    let totalAmount = datosFiltrados.reduce((acc, d) => acc + d.project_count, 0);
    let media = totalAmount / datosFiltrados.length;
    return media.toFixed(2);
}


//PARTE DARÍO LÓPEZ VILLEGAS
const datosD = require("./index-DLV.js");

app.get("/samples/DLV", (req, res) => {
    let resultado = "<h2> MEDIA DE TODAS LAS ÁREAS DE PARQUES NATURALES POR COMUNIDAD AUTÓNOMA </h2>";
    const comunidades = ["andalucia","aragon","asturias","baleares","canarias","cantabria","castilla y leon","castilla-La mancha","catalunia","valencia","extremadura","galicia","madrid","murcia","pais vasco"];
    comunidades.forEach(comunidad => {
        resultado += `<p> <h4>Media de current_area en ${comunidad}:</h4> ${calcularMediaPorComunidad(comunidad)} </p>`;
    });

    res.send(resultado);
});

function calcularMediaPorComunidad(comunidad) {
    let datosFiltradosPorComunidadAutonoma = datosD.filter(x => x.autonomous_community === comunidad);
    let cantidadTotal = datosFiltradosPorComunidadAutonoma.reduce((acc, d) => acc + d.current_area, 0);
    let media = cantidadTotal / datosFiltradosPorComunidadAutonoma.length;
    return media.toFixed(2);
}


// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto :${PORT}`);
});
