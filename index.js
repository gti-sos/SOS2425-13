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

let datosB = require("./index-BGA.js");

//L04
app.get("/samples/BGA", (req, res) => {
    let resultado = "<h2> MEDIA DE PROYECTOS POR COMUNIDAD</h2>";
    const comunidades = ["andalucia", "aragon", "asturias", "baleares", "canarias", "cantabria", "castilla y leon", "castilla-La mancha", "catalunia", "valencia", "extremadura", "galicia", "madrid", "murcia", "pais vasco"];
    comunidades.forEach(autonomous_community => {
        resultado += `<p> <h4>Media de project_count en ${autonomous_community}:</h4> ${calcularMediaProyectos(autonomous_community)} </p>`;
    });

    res.send(resultado);
});



function calcularMediaProyectos(autonomous_community) {
    let datosFiltrados = datosB.filter(d => d.autonomous_community === autonomous_community);
    let totalAmount = datosFiltrados.reduce((acc, d) => acc + d.project_count, 0);
    let media = totalAmount / datosFiltrados.length;
    return media.toFixed(2);
}

//L05

/*
  13.-El recurso debe contener una ruta /api/v1/FFFFF/loadInitialData 
  que al hacer un GET cree 10 o más datos en el array de NodeJS si está vacío.
*/

// Ruta para cargar los datos iniciales de mejoras en el suministro de agua// Ruta para cargar los datos iniciales de mejoras en el suministro de agua
app.get(BASE_API + "/water-supply-improvements/loadInitialData", (req, res) => {
    console.log("Devolviendo 10 datos iniciales");

    // Verificar si el array 'datosB' está vacío
    if (datosB.length === 0) {
        // Si está vacío, agregar 10 datos de ejemplo
        let nuevosDatos = [
            {year: 2009, autonomous_community: "galicia", amount: 9874563, benefited_population: 21456, project_count: 100 },
            { year: 2010, autonomous_community: "andalucia", amount: 5447744, benefited_population: 13599, project_count: 60 },
            { year: 2011, autonomous_community: "aragon", amount: 4827353, benefited_population: 12135, project_count: 55 },
            { year: 2012, autonomous_community: "asturias", amount: 3325841, benefited_population: 10347, project_count: 45 },
            { year: 2013, autonomous_community: "baleares", amount: 2389652, benefited_population: 7500, project_count: 30 },
            { year: 2014, autonomous_community: "canarias", amount: 4996435, benefited_population: 11230, project_count: 40 },
            { year: 2015, autonomous_community: "cantabria", amount: 1812394, benefited_population: 4500, project_count: 20 },
            { year: 2016, autonomous_community: "castilla y leon", amount: 6567891, benefited_population: 15780, project_count: 70 },
            { year: 2017, autonomous_community: "castilla-la mancha", amount: 4087325, benefited_population: 10540, project_count: 50 },
            { year: 2018, autonomous_community: "catalunya", amount: 7021578, benefited_population: 17560, project_count: 85 },
            { year: 2019, autonomous_community: "comunidad de madrid", amount: 9871234, benefited_population: 24200, project_count: 90 }
        ];

        // Usamos el operador spread para agregar los nuevos datos al array 'datosB'
        datosB.push(...nuevosDatos);

        console.log("Datos iniciales cargados correctamente");
        res.status(200).send({ message: "Datos iniciales cargados correctamente", data: datosB });
    } else {
        console.log("Ya existen datos en el array. No se sobreescriben");
        res.status(200).send({ message: "Ya existen datos en el array", data: datosB });
    }
});


// GET 1.- Petición GET por parámetros (comunidad autónoma o año)
app.get(BASE_API + "/water-supply-improvements", (req, res) => {
    console.log("New GET to /water-supply-improvements");

    if (datosB.length === 0) {
        return res.status(404).send({
            error: "No hay datos cargados",
            message: "Hacer GET a loadInitialData para cargar datos de prueba"
        });
    }

    // Creación de copia para no machacar datos
    let filterDataB = [...datosB];

    // Parámetros especiales
    const fromYearB = req.query.from ? parseInt(req.query.from) : null;
    const toYearB = req.query.to ? parseInt(req.query.to) : null;

    // Log para verificar los valores de los parámetros
    console.log(`Parametros recibidos: from = ${fromYearB}, to = ${toYearB}`);

    // Verificar que los parámetros 'from' y 'to' sean válidos
    if (fromYearB && isNaN(fromYearB)) {
        return res.status(400).send({
            error: "Parámetro 'from' inválido",
            message: "El parámetro 'from' debe ser un número válido para el año"
        });
    }

    if (toYearB && isNaN(toYearB)) {
        return res.status(400).send({
            error: "Parámetro 'to' inválido",
            message: "El parámetro 'to' debe ser un número válido para el año"
        });
    }

    // Aplicar filtros de rango si están presentes
    if (fromYearB !== null && !isNaN(fromYearB)) {
        console.log(`Filtrando por desde el año: ${fromYearB}`);
        filterDataB = filterDataB.filter(improvements => improvements.year >= fromYearB);
    }

    if (toYearB !== null && !isNaN(toYearB)) {
        console.log(`Filtrando por hasta el año: ${toYearB}`);
        filterDataB = filterDataB.filter(improvements => improvements.year <= toYearB);
    }

    // Eliminar from y to de los query params para procesarlos separadamente
    const { from, to, ...otherParams } = req.query;

    // Procesar el resto de parámetros de consulta
    if (Object.keys(otherParams).length > 0) {
        console.log("Otros parámetros recibidos:", otherParams);

        for (const [key, value] of Object.entries(otherParams)) {
            console.log(`Filtrando por ${key}: ${value}`);
            if (filterDataB.length > 0 && key in filterDataB[0]) {
                // Si el campo es numérico, comparar con valores numéricos
                if (typeof filterDataB[0][key] === 'number') {
                    filterDataB = filterDataB.filter(improvements => improvements[key] === parseInt(value));
                } else {
                    // Para campos de texto, hacer búsqueda exacta
                    filterDataB = filterDataB.filter(improvements => improvements[key].toLowerCase() === value.toLowerCase());
                }
            }
        }
    }

    // Verificar si no se encuentran mejoras dentro del rango de fechas solicitado
    if (filterDataB.length === 0) {
        return res.status(404).send({
            error: "No se encontraron mejoras de suministro",
            message: `No se encontraron datos para las fechas de ${fromYearB || 'cualquier'} a ${toYearB || 'cualquier'}`
        });
    }

    // Enviar datos filtrados (array vacío si no hay coincidencias)
    console.log("Datos filtrados:", filterDataB);
    return res.status(200).send(filterDataB);
});


// GET 2.- Petición GET por parámetros
app.get(BASE_API + "/water-supply-improvements/:param", (req, res) => {
    console.log("New GET to /water-supply-improvements/:param");
    const param = req.params.param;

    // 1. Verificar si es una comunidad autónoma
    const improvementsComunidad = datosB.filter(i => i.autonomous_community.toLowerCase() === param.toLowerCase());

    // Si es una comunidad, devolver las mejoras correspondientes
    if (improvementsComunidad.length > 0) {
        return res.status(200).send(improvementsComunidad);
    }

    // 2. Verificar si es una fecha (año)
    const yearParamB = parseInt(param);
    if (!isNaN(yearParamB)) {
        const improvementsByYear = datosB.filter(i => i.year === yearParamB);

        if (improvementsByYear.length > 0) {
            return res.status(200).send(improvementsByYear);
        } else {
            return res.status(404).send({
                error: "No se encontraron mejoras en el suministro de agua para el año proporcionado",
                message: `No se encontraron datos de mejoras en el año ${yearParamB}`
            });
        }
    }

    // 3. Si no es ni comunidad ni fecha, devolver 404
    return res.status(404).send({
        error: "Recurso no encontrado",
        message: `No se encontró una comunidad autónoma o año con el nombre '${param}'`
    });
});

// GET 3.- Búsqueda por 2 parámetros: Fecha:Comunidad
app.get(BASE_API + "/water-supply-improvements/:year/:autonomous_community", (req, res) => {
    console.log("New GET to /water-supply-improvements/:year/:autonomous_community");

    const year = parseInt(req.params.year);
    const community = req.params.autonomous_community;

    // Verificar si la fecha (año) es válida
    if (isNaN(year)) {
        return res.status(400).send({
            error: "Año inválido",
            message: "El primer parámetro debe ser un número válido para el año"
        });
    }

    // Filtrar los datos según el año y la comunidad autónoma
    const filteredImprovements = datosB.filter(improvement =>
        improvement.year === year &&
        improvement.autonomous_community.toLowerCase() === community.toLowerCase()
    );

    // Si no se encuentran mejoras para ese año y comunidad
    if (filteredImprovements.length === 0) {
        return res.status(404).send({
            error: "No se encontraron mejoras",
            message: `No hay mejoras en ${community} para el año ${year}`
        });
    } else if (filteredImprovements.length === 1) {
        // Si solo hay un resultado, devolver el objeto directamente
        return res.status(200).send(filteredImprovements[0]);
    } else {
        // Si hay múltiples resultados, devolver el array
        return res.status(200).send(filteredImprovements);
    }
});

//POST 1.- Si falta algún campo -> error 

app.post(BASE_API+ "/water-supply-improvements",(req,res)=>{
    let newImprovements = req.body;
    const missingFieldsB=[];
    if(!newImprovements.year) missingFieldsB.push("year");
    if(!newImprovements.autonomous_community) missingFieldsB.push("autonomous_comunity");
    if(!newImprovements.amount) missingFieldsB.push("amount");
    if(!newImprovements.benefited_population) missingFieldsB.push("benefited_population");
    if(!newImprovements.project_count) missingFieldsB.push("project_count");
 
    if(missingFieldsB.length>0){
        return res.status(400).send({
            error: "Faltan campos",
            missing_fields:missingFieldsB

        });
    }
    
//POST 2.- Si está repetido el campo -> error

let improvementsExist= datosB.find(i => i.year === newImprovements.year 
    && i.autonomous_community === newImprovements.autonomous_community);
    if(improvementsExist){
        return res.status(409).send({error:"Ya existe una ayuda para esa comunidad en ese año"})
    }

    datosB.push(newImprovements);
    res.sendStatus(201);
});

//POST 3.- Error para recurso especifico
app.post(BASE_API+ "/water-supply-improvements/:year",(req,res)=>{
    console.log("New POST to /water-supply-improvements:year");

    return res.status(405).send({
        error: "Métodod no permitido. No se pueden hacer POST a recursos especificos"
    });
});


//PUT 1.- Cambiar todo el dato

app.put(BASE_API +"/water-supply-improvements", (req,res) =>{
    console.log("New PUT to /water-supply-improvements");
    return res.status(405).send({
        error:"No se puede hacer PUT a un conjunto de recursos"
    })
})

//PUT 2.- Cambiar un recurso

app.put(BASE_API + "/water-supply-improvements/:year/:autonomous_community", (req, res) => {
    console.log("New PUT to /water-supply-improvements/:year/:autonomous_community");

    let yearParam = parseInt(req.params.year);  // Año de la mejora
    let communityParam = req.params.autonomous_community.toLowerCase();  // Comunidad autónoma

    // Intentar encontrar el recurso en datosB
    let improvement = datosB.find(i => i.year === yearParam && i.autonomous_community.toLowerCase() === communityParam);

    // Si no existe el recurso, devolver error 404
    if (!improvement) {
        return res.status(404).send({
            error: "Mejora de suministro no encontrada",
            message: `No se encontró una mejora de suministro de agua para la comunidad autónoma ${communityParam} en el año ${yearParam}`
        });
    }

    // Obtener el body de la petición
    let improvement_body = req.body;

    // Si el body de la petición está vacío, devolver error 400
    if (!improvement_body || Object.keys(improvement_body).length === 0) {
        return res.status(400).send({
            error: "Petición mal formada",
            message: "No hay datos en el body de la solicitud"
        });
    }

    // Comprobar si se intenta cambiar la comunidad autónoma o el año
    if (improvement_body.year && improvement_body.year !== yearParam) {
        // Verificar si ya existe una mejora con el nuevo año y comunidad autónoma
        let existingImprovement = datosB.find(i => i.year === improvement_body.year && i.autonomous_community === improvement_body.autonomous_community);
        if (existingImprovement) {
            return res.status(409).send({
                error: "Conflicto: Ya existe una mejora de suministro para esa comunidad en ese año"
            });
        }
    }

    // Actualizar el recurso con los nuevos datos
    Object.assign(improvement, improvement_body);
    return res.sendStatus(200);
});


// DELETE 1.- Borrar todos los datos
app.delete(BASE_API + "/water-supply-improvements", (req, res) => {
    console.log("New DELETE to /water-supply-improvements");

    // Comprobar que hay datos para eliminar
    if (datosB.length === 0) {
        return res.status(404).send({
            error: "No hay mejoras de suministro para eliminar",
            message: "No hay datos cargados en el sistema"
        });
    }

    // Eliminar todos los datos
    datosB = [];
    return res.status(200).send({
        message: "Todas las mejoras de suministro han sido eliminadas correctamente"
    });
});

// DELETE 2.- Eliminar por comunidad autónoma en una fecha específica
app.delete(BASE_API + "/water-supply-improvements/:year/:autonomous_community", (req, res) => {
    console.log("New DELETE to /water-supply-improvements/:year/:autonomous_community");

    const yearParam = parseInt(req.params.year);  // Año recibido
    const communityParam = req.params.autonomous_community.toLowerCase();  // Comunidad autónoma recibida

    // Verificar que el año es un número válido
    if (isNaN(yearParam)) {
        return res.status(400).send({
            error: "Año inválido",
            message: "El parámetro 'year' debe ser un número válido"
        });
    }

    // Verificar que la comunidad autónoma no esté vacía
    if (!communityParam || communityParam.trim() === "") {
        return res.status(400).send({
            error: "Comunidad autónoma inválida",
            message: "El parámetro 'autonomous_community' no puede estar vacío"
        });
    }

    // Filtrar los datos que coinciden con el año y la comunidad autónoma
    let improvementsToDelete = datosB.filter(i => i.year === yearParam && i.autonomous_community.toLowerCase() === communityParam);

    // Si no se encuentra el recurso, devolver error 404
    if (improvementsToDelete.length === 0) {
        return res.status(404).send({
            error: "Mejoras de suministro no encontradas",
            message: `No se encontró ninguna mejora de suministro de agua para la comunidad autónoma ${communityParam} en el año ${yearParam}`
        });
    }

    // Eliminar el recurso de datosB
    datosB = datosB.filter(i => !(i.year === yearParam && i.autonomous_community.toLowerCase() === communityParam));

    return res.status(200).send({
        message: `Mejoras de suministro para la comunidad autónoma ${communityParam} en el año ${yearParam} han sido eliminadas correctamente`,
        data: improvementsToDelete
    });
});

// DELETE 3.- Eliminar todos los datos de un año específico
app.delete(BASE_API + "/water-supply-improvements/:year", (req, res) => {
    console.log("New DELETE to /water-supply-improvements/:year");

    const yearParam = parseInt(req.params.year);  // Año recibido

    // Verificar que el año es un número válido
    if (isNaN(yearParam)) {
        return res.status(400).send({
            error: "Año inválido",
            message: "El parámetro 'year' debe ser un número válido"
        });
    }

    // Buscar el recurso por año
    let improvementsToDelete = datosB.filter(i => i.year === yearParam);

    // Si no se encuentra el recurso, devolver error 404
    if (improvementsToDelete.length === 0) {
        return res.status(404).send({
            error: "Mejoras de suministro no encontradas",
            message: `No se encontraron mejoras de suministro para el año ${yearParam}`
        });
    }

    // Eliminar el recurso de datosB
    datosB = datosB.filter(i => i.year !== yearParam);

    return res.status(200).send({
        message: `Todas las mejoras de suministro para el año ${yearParam} han sido eliminadas correctamente`,
        data: improvementsToDelete
    });
});








                            /*  -----------------------------------     PARTE DARÍO     ----------------------------------------  */


const datos_darlopvil = require("./index-DLV.js");
let datosD = datos_darlopvil;   //datosD es el array de datos que se usará en la API
    
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


//GET a /national-parks y también GET a /national-parks?from=1950&to=1980
/*
Si se hace una petición GET a /national-parks, se devolverá un array con todos los parques nacionales
pero si no hay datos (por ejemplo, luego de hacer un DELETE a /national-parks), se devolverá un error 404
indicando que no hay datos para devolver

*/

app.get(BASE_API + "/national-parks", (request, response) => {
    console.log("New GET to /national-parks");

    // Comprobar si hay datos para mostrar
    if(datosD.length === 0) {
        return response.status(404).send({
            error: "No hay datos que mostrar",
            message: "Utiliza GET /api/v1/national-parks/loadInitialData para cargar datos iniciales"
        });
    }

     // Crear una copia del array original para no modificarlo
     let filteredData = [...datosD];
    
     // Procesar parámetros especiales from y to
     const fromYear = request.query.from ? parseInt(request.query.from) : null;
     const toYear = request.query.to ? parseInt(request.query.to) : null;
     
     // Aplicar filtros de rango si están presentes
     if (fromYear !== null && !isNaN(fromYear)) {
         filteredData = filteredData.filter(park => park.declaration_date >= fromYear);
     }
     
     if (toYear !== null && !isNaN(toYear)) {
         filteredData = filteredData.filter(park => park.declaration_date <= toYear);
     }
     
     // Eliminar from y to de los query params para procesarlos separadamente
     const { from, to, ...otherParams } = request.query;
 
     // Procesar el resto de parámetros de consulta
     if(Object.keys(otherParams).length > 0) {
         for (const [key, value] of Object.entries(otherParams)) {
             if (filteredData.length > 0 && key in filteredData[0]) {
                 // Si el campo es numérico, comparar con valores numéricos
                 if (typeof filteredData[0][key] === 'number') {
                     filteredData = filteredData.filter(park => park[key] === parseInt(value));
                 } else {
                     // Para campos de texto, hacer búsqueda exacta
                     filteredData = filteredData.filter(park => park[key] === value);
                 }
             }
         }
     }
     
     // Enviar datos filtrados (array vacío si no hay coincidencias)
     return response.status(200).send(filteredData);
});

//Disenyo API REST para fuentes de datos

//GET a /national-parks/Canarias?from=1950&to=1980

app.get(BASE_API + "/national-parks/:param", (request, response) => {
    console.log("New GET to /national-parks/:param");
    const param = request.params.param;
    
    // 1. Verificar si es un nombre de parque
    const parkByName = datosD.find(p => p.national_park === param);
    
    // Si es un nombre de parque, devolver el parque
    if (parkByName) {
        return response.status(200).send(parkByName);
    }
    
    // 2. Si no es un nombre de parque, verificar si es una comunidad autónoma
    const parksByCommunity = datosD.filter(p => p.autonomous_community === param);
    
    // Si hay parques en esa comunidad, procesar posibles filtros por año
    if (parksByCommunity.length > 0) {
        let filteredParks = parksByCommunity;
        
        // Procesar filtros from y to si existen
        const fromYear = request.query.from ? parseInt(request.query.from) : null;
        const toYear = request.query.to ? parseInt(request.query.to) : null;
        
        if (fromYear !== null && !isNaN(fromYear)) {
            filteredParks = filteredParks.filter(p => p.declaration_date >= fromYear);
        }
        
        if (toYear !== null && !isNaN(toYear)) {
            filteredParks = filteredParks.filter(p => p.declaration_date <= toYear);
        }
        
        return response.status(200).send(filteredParks);
    }
    
    // 3. Si no es ni parque ni comunidad, devolver 404
    return response.status(404).send({
        error: "Recurso no encontrado",
        message: `No se encontró un parque o comunidad autónoma con el nombre '${param}'`
    });
});


// GET a /national-parks/Canarias/1954
app.get(BASE_API + "/national-parks/:autonomous_community/:declaration_date", (request, response) => {
    console.log("New GET to /national-parks/:autonomous_community/:declaration_date");
    
    const community = request.params.autonomous_community;
    const year = parseInt(request.params.declaration_date);
    
    if (isNaN(year)) {
        return response.status(400).send({
            error: "Año inválido",
            message: "El segundo parámetro debe ser un número válido"
        });
    }
    
    // Filtrar los datos según los parámetros de la URL
    const filteredParks = datosD.filter(park => 
        park.autonomous_community === community && 
        park.declaration_date === year
    );
    
    if (filteredParks.length === 0) {
        return response.status(404).send({
            error: "No se encontraron parques",
            message: `No hay parques en ${community} declarados en ${year}`
        });
    } else if (filteredParks.length === 1) {
        // Si solo hay un resultado, devolver el objeto directamente
        return response.status(200).send(filteredParks[0]);
    } else {
        // Si hay múltiples resultados, devolver el array
        return response.status(200).send(filteredParks);
    }
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
    response.sendStatus(201);
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
    if(!park){
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
    response.sendStatus(200);


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


