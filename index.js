const express = require("express");
const cool = require("cool-ascii-faces");
const app = express();
const PORT = process.env.PORT || 16078;
const BASE_API = "/api/v1";


app.use(express.static("public"));
app.use(express.json()); //Para que pueda interpretar el body de las peticiones POST


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





                            /*  -----------------------------------     PARTE BLANCA     ----------------------------------------  */

const datosB = require("./index-BGA.js");

//L04
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

//L05
/*
let nuevasAyudas=[
    {year:"2010",autonomous_community:"andalucia",amount:"5447744",benefited_population:"13599",project_count:"60"}];

app.get(BASE_API + "/water-supply-improvements/loadInitialData", (request, response) => {
    console.log("Devolviendo 10 datos iniciales");
    response.send(JSON.stringify(nuevasAyudas,null,2));
});

app.get(BASE_API + "/water-supply-improvements", (request, response) => {
    console.log("Has accedido a la API de blagaralo - water-supply-improvements");
    response.send(JSON.stringify(datosB,null,2));
    response.sendStatus(200);
    
});

app.post(BASE_API+ "/water-supply-improvements",(reques,response)=>{
    console.log("POST to + /water-supply-improvements");
    //console.log(`<${request.body}>`);
    let newImprovements = JSON.parse(reques,body);
    nuevasAyudas.push(newImprovements);
    response.sendStatus(201);
})


/*


                            /*  -----------------------------------     PARTE DARÍO     ----------------------------------------  */


const datosD = require("./index-DLV.js");
    
//L04 - Media de todas las áreas de los parques naturales por comunidad autónoma
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
    let resultado = ("<h2>MEDIA DE TODAS LAS ÁREAS DE LOS PARQUES NATURALES POR COMUNIDAD AUTÓNOMA </h2>");
    medias.forEach(m =>  {
    resultado += (`<p> <h4>Media de todas las áreas de todos los parques naturales en ${m.comunidad}:</h2> ${m.media_current_area}</p>`);
});
    res.send(resultado);
});

//L05
let nuevosParques = [
    { national_park: "Timanfaya", declaration_date: 1974, autonomous_community: "Canarias", initial_area: 5107, current_area: 5107 },
    { national_park: "Sierra Nevada", declaration_date: 1995, autonomous_community: "Andalucía", initial_area: 70953, current_area: 70953 },
    { national_park: "Islas Atlánticas de Galicia", declaration_date: 2002, autonomous_community: "Galicia", initial_area: 8400, current_area: 1200 },
    { national_park: "Monfragüe", declaration_date: 2007, autonomous_community: "Extremadura", initial_area: 17852, current_area: 17852 },
    { national_park: "Sierra de Guadarrama", declaration_date: 2013, autonomous_community: "Madrid, Segovia", initial_area: 33960, current_area: 33960 },
    { national_park: "Sierra de las Nieves", declaration_date: 2021, autonomous_community: "Andalucía", initial_area: 33960, current_area: 33960 },
    { national_park: "Sierra de las Nieves2", declaration_date: 2021, autonomous_community: "Andalucía", initial_area: 33960, current_area: 33960 },
    { national_park: "Sierra de las Nieves3", declaration_date: 2021, autonomous_community: "Andalucía", initial_area: 33960, current_area: 33960 },
    { national_park: "Sierra de las Nieves4", declaration_date: 2021, autonomous_community: "Andalucía", initial_area: 33960, current_area: 33960 },
    { national_park: "Sierra de las Nieves5", declaration_date: 2021, autonomous_community: "Andalucía", initial_area: 33960, current_area: 33960 }
];
// GET al recurso /national-parks/loadInitialData
app.get(BASE_API + "/national-parks/loadInitialData", (request, response) => {
    console.log("Devolviendo 10 datos iniciales");
    response.send(JSON.stringify(nuevosParques,null,2));
});

// GET al recurso /national-parks
app.get(BASE_API + "/national-parks", (request, response) => {
    console.log("Has accedido a la API de darlopvil - national-parks");
    response.send(JSON.stringify(datosD,null,2));
    response.sendStatus(200);
    
});





                            /*  -----------------------------------     PARTE ALVARO     ----------------------------------------  */


const datosAlvaro = require("./index-AMN.js");

function calcularMediaNumeroDeIncendios(comunidad) {
    const datosFiltrados = datosAlvaro.filter(d => d.comunidad === comunidad);
    if (datosFiltrados.length === 0) return "No hay datos disponibles";
    const totalAccidentes = datosFiltrados.map(d => d.number_of_accidents).reduce((acc, num) => acc + num, 0);
    return (totalAccidentes / datosFiltrados.length).toFixed(2);
}


app.get("/samples/AMN", (req, res) => {
    const comunidades = [
        "Andalucía", "Aragón", "Asturias", "Canarias", "Cantabria", "Castilla y León", "Castilla-La Mancha", "Cataluña", "Comunidad Valenciana", "Ceuta", "Comunidad de Madrid"
    ];

    const resultado = `
        <h2>MEDIA DE ACCIDENTES FORESTALES POR COMUNIDAD</h2>
        ${comunidades.map(comunidad => `
            <p><strong>Media de número de accidentes forestales en ${comunidad}:</strong> ${calcularMediaNumeroDeIncendios(comunidad)}</p>
        `).join("")}
    `;

    res.send(resultado);
});



// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto :${PORT}`);
});
