import dataStore from "nedb";
let db = new dataStore();
const BASE_API = "/api/v2";

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
    { national_park: "Timanfaya", declaration_date: 1974, autonomous_community: "Canarias", initial_area: 5107, current_area: 5107 },
    { national_park: "Sierra Nevada", declaration_date: 1995, autonomous_community: "Andalucía", initial_area: 70953, current_area: 70953 },
    { national_park: "Islas Atlánticas de Galicia", declaration_date: 2002, autonomous_community: "Galicia", initial_area: 8400, current_area: 1200 },
    { national_park: "Monfragüe", declaration_date: 2007, autonomous_community: "Extremadura", initial_area: 17852, current_area: 17852 },
    { national_park: "Sierra de Guadarrama", declaration_date: 2013, autonomous_community: "Madrid, Castilla y León", initial_area: 33960, current_area: 33960 },
    { national_park: "Sierra de las Nieves", declaration_date: 2021, autonomous_community: "Andalucía", initial_area: 33960, current_area: 33960 },
];


function loadBackend(app) {

    app.get(BASE_API + "/national-parks/docs", (request, response) => {
        response.redirect("https://documenter.getpostman.com/view/14944672/2sB2cUBNyt");

    });


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

    ///GET a /national-parks con soporte para filtros, rangos de años y paginación
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

        // Procesar parámetros de áreas como rangos
        const initialAreaMin = request.query.initial_area_min ? parseInt(request.query.initial_area_min) : null;
        const initialAreaMax = request.query.initial_area_max ? parseInt(request.query.initial_area_max) : null;
        const currentAreaMin = request.query.current_area_min ? parseInt(request.query.current_area_min) : null;
        const currentAreaMax = request.query.current_area_max ? parseInt(request.query.current_area_max) : null;

        if (initialAreaMin !== null && !isNaN(initialAreaMin)) {
            query.initial_area = query.initial_area || {};
            query.initial_area.$gte = initialAreaMin;
        }

        if (initialAreaMax !== null && !isNaN(initialAreaMax)) {
            query.initial_area = query.initial_area || {};
            query.initial_area.$lte = initialAreaMax;
        }

        if (currentAreaMin !== null && !isNaN(currentAreaMin)) {
            query.current_area = query.current_area || {};
            query.current_area.$gte = currentAreaMin;
        }

        if (currentAreaMax !== null && !isNaN(currentAreaMax)) {
            query.current_area = query.current_area || {};
            query.current_area.$lte = currentAreaMax;
        }

        // Extraer parámetros de paginación
        const limit = request.query.limit ? parseInt(request.query.limit) : null;
        const offset = request.query.offset ? parseInt(request.query.offset) : 0;

        // Procesar el resto de parámetros de consulta (excluyendo parámetros especiales)
        const { from, to, limit: limitParam, offset: offsetParam,
            initial_area_min, initial_area_max, current_area_min, current_area_max,
            ...otherParams } = request.query;

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
        let dbQuery = db.find(query);

        // Aplicar paginación si está especificada
        if (offset !== null && !isNaN(offset)) {
            dbQuery = dbQuery.skip(offset);
        }

        if (limit !== null && !isNaN(limit)) {
            dbQuery = dbQuery.limit(limit);
        }

        dbQuery.exec((err, docs) => {
            if (err) {
                return response.status(500).send({ error: "Error al consultar la base de datos" });
            }

            // Si no hay datos y no hay query params (excepto limit y offset), devolver 404
            const hasQueryParams = Object.keys(request.query)
                .filter(key => key !== 'limit' && key !== 'offset').length > 0;

            if (docs.length === 0 && !hasQueryParams) {
                return response.status(404).send({
                    error: "No hay datos que mostrar",
                    message: "Utiliza GET /api/v2/national-parks/loadInitialData para cargar datos iniciales",
                    data: []
                });
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

    /* Implementación de F08 */
    // Sanitizar el parámetro para evitar ataques ReDoS
    function sanitizeRegex(input) {
        return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }


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

            // F08 - Construir consulta para filtrar por comunidad y posiblemente por años
            let sanitizedParam = sanitizeRegex(param);
            let query = { autonomous_community: { $regex: new RegExp(sanitizedParam, "i") } };

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
            autonomous_community: { $regex: new RegExp(community, "i") },
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
                // Si solo hay un resultado, devolver el objeto directamente sin _id
                const { _id, ...parkData } = parks[0];
                return response.status(200).send(parkData);
            } else {
                // Si hay múltiples resultados, transformar cada uno para eliminar _id
                const transformedParks = parks.map(park => {
                    const { _id, ...rest } = park;
                    return rest;
                });
                return response.status(200).send(transformedParks);
            }
        });
    });


    // POST para crear un nuevo parque
    app.post(BASE_API + "/national-parks", (request, response) => {
        console.log("New POST to /national-parks");
        let newPark = request.body;

        // Validar que hay datos
        if (!newPark || Object.keys(newPark).length === 0) {
            return response.status(400).send({ error: "Petición mal formada: No hay datos en la solicitud" });
        }

        // Definir campos esperados
        const expectedFields = ["national_park", "declaration_date", "autonomous_community", "initial_area", "current_area"];

        // Validar campos obligatorios
        const missingFields = [];
        expectedFields.forEach(field => {
            if (!newPark[field]) missingFields.push(field);
        });

        // Validar campos extra
        const extraFields = [];
        Object.keys(newPark).forEach(field => {
            if (!expectedFields.includes(field)) extraFields.push(field);
        });

        // Si hay campos faltantes o extra, devolver 400
        if (missingFields.length > 0 || extraFields.length > 0) {
            const error = { error: "Estructura JSON incorrecta" };
            if (missingFields.length > 0) error.missing_fields = missingFields;
            if (extraFields.length > 0) error.extra_fields = extraFields;
            return response.status(400).send(error);
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
        return response.status(405).send({ error: "Método no permitido. No se puede hacer un POST a un recurso específico" });
    });


    // PUT para actualizar específicamente la fecha de declaración de un parque
    app.put(BASE_API + "/national-parks/:name/:declaration_date", (request, response) => {
        console.log("New PUT to /national-parks/:name/:declaration_date");
        const parkName = request.params.name;
        const newDeclarationDate = parseInt(request.params.declaration_date);

        // Validar que el año es un número válido
        if (isNaN(newDeclarationDate)) {
            return response.status(400).send({
                error: "Año inválido",
                message: "El año debe ser un número válido"
            });
        }

        // Verificar que no se envían datos adicionales en el cuerpo de la petición
        if (request.body && Object.keys(request.body).length > 0) {
            return response.status(400).send({
                error: "Estructura JSON incorrecta",
                message: "Este endpoint no espera datos en el cuerpo de la petición"
            });
        }

        // Verificar que el parque existe
        db.findOne({ national_park: parkName }, (err, park) => {
            if (err) {
                return response.status(500).send({ error: "Error al consultar la base de datos" });
            }

            if (!park) {
                return response.status(404).send({
                    error: "Parque no encontrado",
                    message: `No existe un parque con el nombre '${parkName}'`
                });
            }

            // Actualizar solo el campo declaration_date
            db.update(
                { national_park: parkName },
                { $set: { declaration_date: newDeclarationDate } },
                {},
                (err, numUpdated) => {
                    if (err) {
                        return response.status(500).send({ error: "Error al actualizar el parque" });
                    }

                    // Si se actualizó correctamente, devolver 200
                    if (numUpdated > 0) {
                        return response.sendStatus(200);
                    } else {
                        return response.status(500).send({
                            error: "No se pudo actualizar el parque",
                            message: "La operación no modificó ningún registro"
                        });
                    }
                }
            );
        });
    });

    // PUT al conjunto de recursos (no permitido)
    app.put(BASE_API + "/national-parks", (request, response) => {
        console.log("New PUT to /national-parks");
        return response.status(405).send({ error: "Método no permitido. No se puede hacer un PUT a un conjunto de recursos" });
    });

    // PUT a un parque específico
    app.put(BASE_API + "/national-parks/:name", (request, response) => {
        console.log("New PUT to /national-parks/:name");
        let parkName = request.params.name;
        let park_body = request.body;

        // Validar que hay datos en el cuerpo
        if (!park_body || Object.keys(park_body).length === 0) {
            return response.status(400).send({ error: "Petición mal formada: No hay datos en la solicitud" });
        }

        // Definir campos permitidos
        const allowedFields = ["national_park", "declaration_date", "autonomous_community", "initial_area", "current_area"];

        // Verificar campos no permitidos
        const extraFields = [];
        Object.keys(park_body).forEach(field => {
            if (!allowedFields.includes(field)) extraFields.push(field);
        });

        // Si hay campos extra, devolver 400
        if (extraFields.length > 0) {
            return response.status(400).send({
                error: "Estructura JSON incorrecta",
                extra_fields: extraFields
            });
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

    // DELETE para eliminar un parque específico por nombre y año
    app.delete(BASE_API + "/national-parks/:name/:declaration_date", (request, response) => {
        console.log("New DELETE to /national-parks/:name/:declaration_date");
        const parkName = request.params.name;
        const year = parseInt(request.params.declaration_date);

        // Validar que el año es un número válido
        if (isNaN(year)) {
            return response.status(400).send({
                error: "Año inválido",
                message: "El segundo parámetro debe ser un número válido"
            });
        }

        // Buscar el parque antes de eliminarlo
        db.findOne({
            national_park: parkName,
            declaration_date: year
        }, (err, park) => {
            if (err) {
                return response.status(500).send({ error: "Error al consultar la base de datos" });
            }

            if (!park) {
                return response.status(404).send({
                    error: "Parque no encontrado",
                    message: `No existe un parque con el nombre '${parkName}' declarado en ${year}`
                });
            }

            // Eliminar el parque
            db.remove({
                national_park: parkName,
                declaration_date: year
            }, {}, (err, numRemoved) => {
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