import dataStore from "nedb";
let db = new dataStore();
const BASE_API = "/api/v1";

//loadInitialData
// Datos iniciales para cargar en la API
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

// Datos iniciales
const datosIniciales = [
    { national_park: "Teide", declaration_date: 1954, autonomous_community: "Canarias", initial_area: 13571, current_area: 18990 },
    { national_park: "Cabañeros", declaration_date: 1995, autonomous_community: "Castilla-La Mancha", initial_area: 3984, current_area: 3984 },
    { national_park: "Doñana", declaration_date: 1957, autonomous_community: "Andalucía", initial_area: 54252, current_area: 74279 },
    { national_park: "Garajonay", declaration_date: 1981, autonomous_community: "Canarias", initial_area: 3984, current_area: 3984 },
    { national_park: "Picos de Europa", declaration_date: 1918, autonomous_community: "Asturias, Cantabria, Castilla y León", initial_area: 17000, current_area: 67455 },
    { national_park: "Tablas de Daimiel", declaration_date: 1973, autonomous_community: "Castilla-La Mancha", initial_area: 1928, current_area: 5410 },
    { national_park: "Caldera de Taburiente", declaration_date: 1954, autonomous_community: "Canarias", initial_area: 4690, current_area: 5956 },
    { national_park: "Ordesa y Monte Perdido", declaration_date: 1916, autonomous_community: "Aragón", initial_area: 2100, current_area: 15608 },
    { national_park: "Aiguas Tortas y Lago de San Mauricio", declaration_date: 1955, autonomous_community: "Cataluña", initial_area: 10230, current_area: 14119 },
    { national_park: "Archipiélago de Cabrera", declaration_date: 1991, autonomous_community: "Baleares", initial_area: 10021, current_area: 10021 },
];


function loadBackend(app) {


   

//loadInitialData
app.get(BASE_API + "/national-parks/loadInitialData", (request, response) => {
    console.log("New GET to /national-parks/loadInitialData");

    // Verificar si ya hay datos en la base de datos
    db.count({}, (err, count) => {
        if (err) {
            return response.status(500).send({ error: "Error interno del servidor al consultar la base de datos" });
        }
        
        // Si la base de datos está vacía, insertar los datos iniciales
        if (count === 0) {
            db.insert(datosIniciales, (err, insertedDocs) => {
                if (err) {
                    return response.status(500).send({ error: "Error al cargar datos iniciales" });
                }
                console.log("Datos iniciales cargados correctamente");
                
                // Transformar los documentos para eliminar el campo _id
                const transformedDocs = insertedDocs.map(doc => {
                    const { _id, ...rest } = doc;
                    return rest;
                });
                
                response.status(200).send({ 
                    message: "Datos iniciales cargados correctamente", 
                    data: transformedDocs
                });
            });
        } else {
            response.status(405).send({ 
                message: "No se permite volver a cargar los datos iniciales", 
            });
        }
    });
});

///GET a /national-parks con soporte para filtros y rangos de años
app.get(BASE_API + "/national-parks", (request, response) => {
    console.log("New GET to /national-parks");

    // Construir la consulta para la base de datos
    let query = {};
    
    // Procesar parámetros especiales from y to
    const fromYear = request.query.from ? parseInt(request.query.from) : null;
    const toYear = request.query.to ? parseInt(request.query.to) : null;
    
    if (fromYear !== null && !isNaN(fromYear)) {
        query.declaration_date = query.declaration_date || {};
        query.declaration_date.$gte = fromYear;
    }
    
    if (toYear !== null && !isNaN(toYear)) {
        query.declaration_date = query.declaration_date || {};
        query.declaration_date.$lte = toYear;
    }
    
    // Procesar el resto de parámetros de consulta
    const { from, to, ...otherParams } = request.query;
    
    for (const [key, value] of Object.entries(otherParams)) {
        // Convertir valores numéricos
        const numValue = parseInt(value);
        if (!isNaN(numValue) && String(numValue) === String(value)) {
            query[key] = numValue;
        } else {
            query[key] = value;
        }
    }
    
    // Ejecutar la consulta en la base de datos
    db.find(query, (err, docs) => {
        if (err) {
            return response.status(500).send({ error: "Error al consultar la base de datos" });
        }
        
        // Si no hay datos y no hay query params, devolver 404
        if (docs.length === 0 && Object.keys(request.query).length === 0) {
            return response.status(404).send({
                error: "No hay datos que mostrar",
                message: "Utiliza GET /api/v1/national-parks/loadInitialData para cargar datos iniciales",
                data: []
            });
        }
        
        // Si no hay datos que coincidan con la búsqueda, devolver 200 y array vacío
        if (docs.length === 0) {
            return response.status(200).send([]);
        }
        
        // Transformar los documentos para eliminar el campo _id
        const transformedDocs = docs.map(doc => {
            const { _id, ...rest } = doc;
            return rest;
        });
        
        // Siempre enviar un array (vacío si no hay resultados)
        return response.status(200).send(transformedDocs);
    });
});

// GET avanzado para diferenciar parque por nombre o comunidad
// TAMBIEN ES EL GET que devuelve un parque en específico (GET normal)
app.get(BASE_API + "/national-parks/:param", (request, response) => {
    console.log("New GET to /national-parks/:param");
    const param = request.params.param;

    // 1. Verificar si es un nombre de parque
    db.findOne({ national_park: param }, (err, park) => {
        if (err) {
            return response.status(500).send({ error: "Error al consultar la base de datos" });
        }

        // Si encontramos un parque con ese nombre, lo devolvemos
        if (park) {
            // Transformar el documento para eliminar el campo _id
            const { _id, ...rest } = park;
            return response.status(200).send(rest);
        }

        // 2. Si no es un parque, buscamos por comunidad autónoma
        const fromYear = request.query.from ? parseInt(request.query.from) : null;
        const toYear = request.query.to ? parseInt(request.query.to) : null;

        // Construir consulta para filtrar por comunidad y posiblemente por años
        let query = { autonomous_community: param };

        if (fromYear !== null && !isNaN(fromYear)) {
            query.declaration_date = query.declaration_date || {};
            query.declaration_date.$gte = fromYear;
        }

        if (toYear !== null && !isNaN(toYear)) {
            query.declaration_date = query.declaration_date || {};
            query.declaration_date.$lte = toYear;
        }

        db.find(query, (err, parks) => {
            if (err) {
                return response.status(500).send({ error: "Error al consultar la base de datos" });
            }

            if (parks.length > 0) {
                // Transformar los documentos para eliminar el campo _id
                const transformedParks = parks.map(park => {
                    const { _id, ...rest } = park;
                    return rest;
                });
                return response.status(200).send(transformedParks);
            }

            // 3. Si no es ni parque ni comunidad, devolver 404
            return response.status(404).send({
                error: "Recurso no encontrado",
                message: `No se encontró un parque o comunidad autónoma con el nombre '${param}'`
            });
        });
    });
});


// GET por comunidad y año específico
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
    
    // Consultar la base de datos
    db.find({ 
        autonomous_community: community,
        declaration_date: year
    }, (err, parks) => {
        if (err) {
            return response.status(500).send({ error: "Error al consultar la base de datos" });
        }
        
        if (parks.length === 0) {
            return response.status(404).send({
                error: "No se encontraron parques",
                message: `No hay parques en ${community} declarados en ${year}`
            });
        } else if (parks.length === 1) {
            // Si solo hay un resultado, devolver el objeto directamente
            return response.status(200).send(parks[0]);
        } else {
            // Si hay múltiples resultados, devolver el array
            return response.status(200).send(parks);
        }
    });
});


// POST para crear un nuevo parque
app.post(BASE_API + "/national-parks", (request, response) => {
    console.log("New POST to /national-parks");
    let newPark = request.body;

    // Validar campos obligatorios
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

    // Verificar que no exista ya un parque con el mismo nombre
    db.findOne({ national_park: newPark.national_park }, (err, existingPark) => {
        if (err) {
            return response.status(500).send({ error: "Error al consultar la base de datos" });
        }
        
        if (existingPark) {
            return response.status(409).send({ error: "Ya existe un parque con ese nombre" });
        }
        
        // Insertar el nuevo parque
        db.insert(newPark, (err, insertedPark) => {
            if (err) {
                return response.status(500).send({ error: "Error al guardar el parque en la base de datos" });
            }
            
            response.sendStatus(201);
        });
    });
});

// POST a un recurso específico (no permitido)
app.post(BASE_API + "/national-parks/:name", (request, response) => {
    console.log("New POST to /national-parks/:name");
    return response.status(405).send({error: "Método no permitido. No se puede hacer un POST a un recurso específico"});
});


// PUT al conjunto de recursos (no permitido)
app.put(BASE_API + "/national-parks", (request, response) => {
    console.log("New PUT to /national-parks");
    return response.status(405).send({error: "Método no permitido. No se puede hacer un PUT a un conjunto de recursos"});
});

// PUT a un parque específico
app.put(BASE_API + "/national-parks/:name", (request, response) => {
    console.log("New PUT to /national-parks/:name");
    let parkName = request.params.name;
    let park_body = request.body;
    
    // Validar que hay datos en el cuerpo
    if(!park_body || Object.keys(park_body).length === 0){
        return response.status(400).send({error: "Petición mal formada: No hay datos en el array de la solicitud"});
    }
    
    // Verificar que el parque existe
    db.findOne({ national_park: parkName }, (err, park) => {
        if (err) {
            return response.status(500).send({ error: "Error al consultar la base de datos" });
        }
        
        if (!park) {
            return response.status(404).send({ error: "Parque no encontrado. No puedo actualizarlo" });
        }
        
        // Comprobar si está intentando cambiar el nombre a uno existente
        if (park_body.national_park && park_body.national_park !== parkName) {
            db.findOne({ national_park: park_body.national_park }, (err, existingPark) => {
                if (err) {
                    return response.status(500).send({ error: "Error al consultar la base de datos" });
                }
                
                if (existingPark) {
                    return response.status(409).send({
                        error: "Conflicto: Ya existe otro parque con el nombre proporcionado"
                    });
                }
                
                // No hay conflicto, actualizar el parque
                updatePark();
            });
        } else {
            // No hay cambio de nombre o el nombre no está en el body, actualizar directamente
            updatePark();
        }
        
        function updatePark() {
            db.update({ national_park: parkName }, { $set: park_body }, {}, (err, numUpdated) => {
                if (err) {
                    return response.status(500).send({ error: "Error al actualizar el parque en la base de datos" });
                }
                
                response.sendStatus(200);
            });
        }
    });
});

// DELETE para eliminar todos los parques
app.delete(BASE_API + "/national-parks", (request, response) => {
    console.log("New DELETE to /national-parks");

    // Verificar que hay datos para eliminar
    db.count({}, (err, count) => {
        if (err) {
            return response.status(500).send({ error: "Error al consultar la base de datos" });
        }
        
        if (count === 0) {
            return response.status(404).send({ error: "No hay parques para eliminar" });
        }
        
        // Eliminar todos los documentos
        db.remove({}, { multi: true }, (err, numRemoved) => {
            if (err) {
                return response.status(500).send({ error: "Error al eliminar los parques" });
            }
            
            response.status(200).send({ 
                message: "Todos los parques han sido eliminados correctamente",
                count: numRemoved
            });
        });
    });
});

// DELETE para eliminar un parque específico
app.delete(BASE_API + "/national-parks/:name", (request, response) => {
    console.log("New DELETE to /national-parks/:name");
    let parkName = request.params.name;
    
    // Buscar el parque antes de eliminarlo
    db.findOne({ national_park: parkName }, (err, park) => {
        if (err) {
            return response.status(500).send({ error: "Error al consultar la base de datos" });
        }
        
        if (!park) {
            return response.status(404).send({ error: "Parque no encontrado. No puedo eliminarlo" });
        }
        
        // Eliminar el parque
        db.remove({ national_park: parkName }, {}, (err, numRemoved) => {
            if (err) {
                return response.status(500).send({ error: "Error al eliminar el parque" });
            }
            
            // Transformar el documento para eliminar el campo _id
            const { _id, ...rest } = park;
            
            response.status(200).send({
                message: "Parque eliminado correctamente", 
                data: rest
            });
        });
    });
});

}

export { loadBackend };