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
    const comunidades = ["andalucia", "aragon", "asturias", "baleares", "canarias", "cantabria", "castilla y leon", "castilla-La mancha", "catalunia", "valencia", "extremadura", "galicia", "madrid", "murcia", "pais vasco"];
    comunidades.forEach(comunidad => {
        resultado += `<p> <h4>Media de project_count en ${comunidad}:</h4> ${calcularMediaProyectos(comunidad)} </p>`;
    });

    res.send(resultado);
});



function calcularMediaProyectos(comunidad) {
    let datosFiltrados = datosB.filter(d => d.comunidad === comunidad);
    let totalAmount = datosFiltrados.reduce((acc, d) => acc + d.project_count, 0);
    let media = totalAmount / datosFiltrados.length;
    return media.toFixed(2);
}


//PARTE DARÍO


const datosD = require("./index-DLV.js");
    
//Algoritmo usado y replicado:
function mediaParquesPorComunidad (){
    let mapDeComunidades = {};
    datosD.forEach(d => {
       
        if (!mapDeComunidades[d.autonomous_community]) {
            mapDeComunidades[d.autonomous_community] = { total: 0, count: 0 };
        }
       
         mapDeComunidades[d.autonomous_community].total += d.current_area;
         mapDeComunidades[d.autonomous_community].count += 1;
    });
    let mediaPorComunidad = Object.keys(mapDeComunidades).map(comunidad => ({
        comunidad: comunidad,
        media_current_area: (mapDeComunidades[comunidad].total / mapDeComunidades[comunidad].count).toFixed(2)
    }));
    return mediaPorComunidad;
}


app.get("/samples/DLV", (req, res) => {
        let medias = mediaParquesPorComunidad();
    let resultado = ("\n MEDIA DE TODAS LAS ÁREAS DE LOS PARQUES NATURALES POR COMUNIDAD AUTÓNOMA \n");
    medias.forEach(m =>  {
    resultado += (`Media de todas las áreas de todos los parques naturales en ${m.comunidad}: ${m.media_current_area}`);
});
    res.send(resultado);
});





// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto :${PORT}`);
});
