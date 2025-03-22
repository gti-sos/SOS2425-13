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

let nuevasAyudas=[
    {year: 2010,autonomous_community:"andalucia",amount:5447744,benefited_population:13599,project_count:60}];

app.get(BASE_API + "/water-supply-improvements/loadInitialData", (request, response) => {
    console.log("Devolviendo 10 datos iniciales");
    response.send(JSON.stringify(nuevasAyudas,null,2));
});

app.get(BASE_API + "/water-supply-improvements", (req, res) => {
    console.log("Has accedido a la API de blagaralo - water-supply-improvements");
    response.send(JSON.stringify(datosB,null,2));
    response.sendStatus(200);
    
});

app.post(BASE_API+ "/water-supply-improvements/loadInitialData",(req,res)=>{
    console.log("POST to + /water-supply-improvements/loadInitialData");
    console.log(`<${req.body}>`);
    let newImprovements = req.body;
    nuevasAyudas.push(newImprovements);
    res.sendStatus(201);
})

app.post(BASE_API+ "/water-supply-improvements",(req,res)=>{
    console.log("POST to + /water-supply-improvements");
    console.log(`<${req.body}>`);
    let newImprovements = req.body;
    nuevasAyudas.push(newImprovements);
    res.sendStatus(201);
})





                            /*  -----------------------------------     PARTE DARÍO     ----------------------------------------  */


let datosD = require("./index-DLV.js");
    
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


// GET al recurso /national-parks
/*
Debe tener desplegado en Render una API REST funcional ofreciendo su fuente de datos. 
La API debe estar desplegada (e integrada con los compañeros de grupo) en la dirección: https://sos2425-XX.onrender.com/api/v1/FFFFF  
(Siendo XX el numero de grupo relleno con ceros y FFFFF el nombre del recurso).

*/
app.get(BASE_API + "/national-parks", (request, response) => {
    console.log("New GET to /national-parks");

    response.send(JSON.stringify(datosD,null,2));
    response.sendStatus(200);
    
});

//loadInitialData

app.get(BASE_API + "/national-parks/loadInitialData", (request, response) => {
    console.log("New GET to /national-parks/loadInitialData");

    if (datosD.length === 0) {
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

        // Actualizamos datosD con los nuevos datos
        /*
        Se usa el operador "spread" o de propagación para añadir los nuevos parques al array de datosD
        Si solo se usara datosD.push(nuevosParques), se añadiría un array dentro de otro array (arrays anidados)
        y eso no es lo que se desea.
        En su lugar, "spread" desempaqueta los elementos de nuevosParques y los añade uno a uno al array datosD
        */
        datosD.push(...nuevosParques);

        console.log("Datos iniciales cargados correctamente");
        response.status(200).send({ message: "Datos iniciales cargados correctamente", data: datosD });
    } else {
        console.log("Ya existen datos en el array. No se sobreescriben");
        response.status(200).send({ message: "Ya existen datos en el array", data: datosD });
    }
});


/*
14. -
La API debe cumplir con las buenas prácticas definidas en los laboratorios:
    -Deben implementarse todos los métodos de la tabla azul (vistos en el L05)
    -Deben usarse todos los códigos de estado del cuadro verde (vistos en el L05)
    -No se debe devolver HTML en ningún caso

*/

// a- POST a api/v1/national-parks
app.post(BASE_API + "/national-parks", (request, response) => {
    console.log("New POST to /national-parks");
    let newPark = request.body;

    //Si el body de la petición no tiene al menos alguno de los campos obligatorios, devolvemos un error 400 (mala sintaxis)
    const missingFields = [];
    if(!newPark.national_park) missingFields.push("national_park");
    if(!newPark.declaration_date) missingFields.push("declaration_date");
    if(!newPark.autonomous_community) missingFields.push("autonomous_community");
    if(!newPark.initial_area) missingFields.push("initial_area");
    if(!newPark.current_area) missingFields.push("current_area");
    
    if(missingFields.length > 0) {
      return response.status(400).send({
        error: "Faltan campos obligatorios",
        missing_fields: missingFields
      });
    }

    //Verifico que no exista ya un parque con el mismo nombre
    let parkExists = datosD.find(p => p.national_park === newPark.national_park);
    if(parkExists){
        return response.status(409).send({error: "Ya existe un parque con ese nombre"});
    }

    //Si todo está correcto, añado el nuevo parque al array de datos
    datosD.push(newPark);
    response.status(201).send({message: "Parque añadido correctamente", data: newPark});
});

// a- POST a api/v1/national-parks/Teide
app.post(BASE_API + "/national-parks/:name", (request, response) => {
    console.log("New POST to /national-parks/:name");

    return response.status(405).send({error: "Método no permitido. No se puede hacer un POST a un recurso específico"});
});


//b- GET a api/v1/national-parks/Teide
app.get(BASE_API + "/national-parks/:name", (request, response) => {
    console.log("New GET to /national-parks/:name");
    let parkName = request.params.name; //request params es un objeto que contiene los valores de los parámetros de la URL
    let park = datosD.find(p => p.national_park === parkName);
    if (!park) {
        return response.status(404).send({error: "Parque no encontrado"});
    }else{
       
        return response.status(200).send(park);
    }
});

//c- PUT a api/v1/national-parks
app.put(BASE_API + "/national-parks", (request, response) => {
    console.log("New PUT to /national-parks");
    return response.status(405).send({error: "Método no permitido. No se puede hacer un PUT a un conjunto de recursos"});
});

//c- PUT a api/v1/national-parks/Teide
app.put(BASE_API + "/national-parks/:name", (request, response) => {
    console.log("New PUT to /national-parks/:name");
    let parkName = request.params.name;

    
    let park = datosD.find(p => p.national_park === parkName);
    //Si no existe el parque, devuelvo un error 404
    if(park.length === 0){
        return response.status(404).send({error: "Parque no encontrado. No puedo actualizarlo"});
    }
    let park_body = request.body;
    //Si el body del request no existe o está vacío, devuelvo un error 400
    if(!park_body|| Object.keys(park_body).length === 0){
        return response.status(400).send({error: "Petición mal formada: No hay datos en el array de la solicitud"});
    }

    // Comprobar si está intentando cambiar el nombre de un parque a uno que ya existe:
    /*
    park_body.national_park: ver si el campo del nombre del parque "national_park" está presente en el body de la petición
    park_body.national_park !== parkName: si el campo del nombre del parque es diferente al nombre del parque que se quiere actualizar
        (por ejemplo: en mi PUT indico en la URL Teide, pero en el array del body he puesto "Sierra de las Nieves")


    */
    if (park_body.national_park && park_body.national_park !== parkName) {
        // Verificar si el nuevo nombre ya existe en otro parque
        let existingPark = datosD.find(p => p.national_park === park_body.national_park);
        if (existingPark) {
            return response.status(409).send({
                error: "Conflicto: Ya existe otro parque con el nombre proporcionado"
            });
        }
    }

    //En cualquier otro caso, actualizo los datos del parque (todo bien)
    Object.assign(park, park_body);
    response.status(200).send({message: "Parque actualizado correctamente", data: park});


});

//d- DELETE a api/v1/national-parks
app.delete(BASE_API + "/national-parks", (request, response) => {
    console.log("New DELETE to /national-parks");

    //Comprobar que todos los recursos que se quieren eliminar, existen ya en el array de datos
    if(datosD.length === 0){
        return response.status(404).send({error: "No hay parques para eliminar"});
    }

    //En cualquier otro caso, sí hay datos, y borramos todo
    datosD = [];
    response.status(200).send({message: "Todos los parques han sido eliminados correctamente"});
});

//d- DELETE a api/v1/national-parks/Teide
app.delete(BASE_API + "/national-parks/:name", (request, response) => {
    console.log("New DELETE to /national-parks/:name");
    let parkName = request.params.name;
    let park = datosD.find(p => p.national_park === parkName);
    if (!park) {
        return response.status(404).send({error: "Parque no encontrado. No puedo eliminarlo"});
    }

    //Si el parque existe, lo borro
    datosD = datosD.filter(p => p.national_park !== parkName);
    response.status(200).send({message: "Parque eliminado correctamente", data: park});
}
);


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


