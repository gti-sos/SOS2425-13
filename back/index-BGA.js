import dataStore from "@seald-io/nedb";
const BASE_API = "/api/v1";
let db = new dataStore();

const datosInicialesB = [
    { year: 2015, autonomous_community: "andalucia", amount: 12604168, benefited_population: 25208, project_count: 45 },
    { year: 2015, autonomous_community: "aragon", amount: 5494284, benefited_population: 10988, project_count: 18 },
    { year: 2015, autonomous_community: "asturias", amount: 2319946, benefited_population: 4640, project_count: 8 },
    { year: 2015, autonomous_community: "baleares", amount: 2658926, benefited_population: 5318, project_count: 10 },
    { year: 2015, autonomous_community: "canarias", amount: 5743835, benefited_population: 11488, project_count: 20 },
    { year: 2015, autonomous_community: "cantabria", amount: 5447744, benefited_population: 10895, project_count: 20 },
    { year: 2015, autonomous_community: "castilla y leon", amount: 7984325, benefited_population: 15969, project_count: 30 },
    { year: 2015, autonomous_community: "castilla-La mancha", amount: 10880000, benefited_population: 21760, project_count: 40 },
    { year: 2015, autonomous_community: "catalunia", amount: 10075812, benefited_population: 20152, project_count: 38 },
    { year: 2015, autonomous_community: "valencia", amount: 7017390, benefited_population: 14053, project_count: 27 },
    { year: 2015, autonomous_community: "extremadura", amount: 8591952, benefited_population: 17184, project_count: 32 },
    { year: 2015, autonomous_community: "galicia", amount: 6799527, benefited_population: 13599, project_count: 25 },
    { year: 2015, autonomous_community: "madrid", amount: 2901139, benefited_population: 4164, project_count: 11 },
    { year: 2015, autonomous_community: "murcia", amount: 2082060, benefited_population: 4164, project_count: 9 },
    { year: 2015, autonomous_community: "pais vasco", amount: 3153155, benefited_population: 6306, project_count: 14 },

    { year: 2016, autonomous_community: "andalucia", amount: 12646637, benefited_population: 157577, project_count: 50 },
    { year: 2016, autonomous_community: "aragon", amount: 5528413, benefited_population: 29024, project_count: 19 },
    { year: 2016, autonomous_community: "asturias", amount: 2336099, benefited_population: 5162, project_count: 9 },
    { year: 2016, autonomous_community: "baleares", amount: 2663141, benefited_population: 7004, project_count: 12 },
    { year: 2016, autonomous_community: "canarias", amount: 5654386, benefited_population: 32399, project_count: 24 },
    { year: 2016, autonomous_community: "cantabria", amount: 5528871, benefited_population: 28971, project_count: 22 },
    { year: 2016, autonomous_community: "castilla y leon", amount: 8039214, benefited_population: 66162, project_count: 33 },
    { year: 2016, autonomous_community: "castilla-La mancha", amount: 10693386, benefited_population: 119017, project_count: 42 },
    { year: 2016, autonomous_community: "catalunia", amount: 9888014, benefited_population: 99077, project_count: 40 },
    { year: 2016, autonomous_community: "valencia", amount: 7092068, benefited_population: 17784, project_count: 28 },
    { year: 2016, autonomous_community: "extremadura", amount: 8583097, benefited_population: 71153, project_count: 34 },
    { year: 2016, autonomous_community: "galicia", amount: 6684255, benefited_population: 46188, project_count: 27 },
    { year: 2016, autonomous_community: "madrid", amount: 2889852, benefited_population: 28899, project_count: 12 },
    { year: 2016, autonomous_community: "murcia", amount: 2054142, benefited_population: 4108, project_count: 10 },
    { year: 2016, autonomous_community: "pais vasco", amount: 3169746, benefited_population: 9699, project_count: 16 },

    { year: 2017, autonomous_community: "andalucia", amount: 12670092, benefited_population: 165978, project_count: 55 },
    { year: 2017, autonomous_community: "aragon", amount: 5411728, benefited_population: 29548, project_count: 20 },
    { year: 2017, autonomous_community: "asturias", amount: 2299811, benefited_population: 5243, project_count: 10 },
    { year: 2017, autonomous_community: "baleares", amount: 2654119, benefited_population: 7378, project_count: 13 },
    { year: 2017, autonomous_community: "canarias", amount: 5807226, benefited_population: 32539, project_count: 26 },
    { year: 2017, autonomous_community: "cantabria", amount: 5479462, benefited_population: 31088, project_count: 24 },
    { year: 2017, autonomous_community: "castilla y leon", amount: 7874978, benefited_population: 56558, project_count: 36 },
    { year: 2017, autonomous_community: "castilla-La mancha", amount: 10947818, benefited_population: 120047, project_count: 45 },
    { year: 2017, autonomous_community: "catalunia", amount: 9922517, benefited_population: 36088, project_count: 42 },
    { year: 2017, autonomous_community: "valencia", amount: 7002918, benefited_population: 22084, project_count: 30 },
    { year: 2017, autonomous_community: "extremadura", amount: 8664820, benefited_population: 71153, project_count: 36 },
    { year: 2017, autonomous_community: "galicia", amount: 6727106, benefited_population: 42292, project_count: 29 },
    { year: 2017, autonomous_community: "madrid", amount: 2923797, benefited_population: 27998, project_count: 13 },
    { year: 2017, autonomous_community: "murcia", amount: 2045301, benefited_population: 4458, project_count: 11 },
    { year: 2017, autonomous_community: "pais vasco", amount: 3194418, benefited_population: 10317, project_count: 18 }
];

function loadBackend(app) {

    // Docs
    app.get(BASE_API + "/water-supply-improvements/docs", (req, res) => {
        res.redirect("https://documenter.getpostman.com/view/42334859/2sB2cVe2Fy");
    });




    // Load Initial Data
    app.get(BASE_API + "/water-supply-improvements/loadInitialData", (req, res) => {
        db.count({}, (err, count) => {
            if (err) return res.status(500).send({ error: "Error al acceder a la base de datos" });
            if (count > 0) return res.status(405).send({ message: "Ya existen datos. No se sobreescriben." });
            db.insert(datosInicialesB, (err, newDocs) => {
                if (err) return res.status(500).send({ error: "Error al insertar los datos" });
                const transformed = newDocs.map(({ _id, ...rest }) => rest);
                return res.status(200).send({ message: "Datos iniciales cargados correctamente", data: transformed });
            });
        });
    });


    // GET con filtros (from, to y otros campos)
    ///GET a /water-supply-improvements con filtros, rangos de años y paginación
    app.get(BASE_API + "/water-supply-improvements", (req, res) => {
        console.log("New GET to /water-supply-improvements");

        let query = {};

        // Filtros por año
        const from = req.query.from ? parseInt(req.query.from) : null;
        const to = req.query.to ? parseInt(req.query.to) : null;

        if (from !== null && !isNaN(from)) {
            query.year = query.year || {};
            query.year.$gte = from;
        }

        if (to !== null && !isNaN(to)) {
            query.year = query.year || {};
            query.year.$lte = to;
        }

        // Paginación
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        const offset = req.query.offset ? parseInt(req.query.offset) : 0;

        // Otros parámetros
        const { from: _f, to: _t, limit: _l, offset: _o, ...otherParams } = req.query;

        for (const [key, value] of Object.entries(otherParams)) {
            const numValue = parseInt(value);
            if (!isNaN(numValue) && String(numValue) === String(value)) {
                query[key] = numValue;
            } else {
                query[key] = value.toLowerCase?.() || value;
            }
        }

        let dbQuery = db.find(query);

        if (offset !== null && !isNaN(offset)) {
            dbQuery = dbQuery.skip(offset);
        }

        if (limit !== null && !isNaN(limit)) {
            dbQuery = dbQuery.limit(limit);
        }

        dbQuery.exec((err, docs) => {
            if (err) {
                return res.status(500).send({ error: "Error al consultar la base de datos" });
            }

            // Verificar si no hay datos y se usaron filtros de fecha
            const hasDateFilters = req.query.from || req.query.to;
            if (docs.length === 0 && hasDateFilters) {
                return res.status(404).send({
                    error: "No se encontraron datos para el rango de fechas especificado",
                    message: "Asegúrate de que las fechas estén dentro del rango de los datos disponibles",
                    data: []
                });
            }

            // Verificar si no hay datos y no se usaron parámetros de consulta (excepto limit y offset)
            const hasQueryParams = Object.keys(req.query)
                .filter(key => !['limit', 'offset'].includes(key)).length > 0;
            if (docs.length === 0 && !hasQueryParams) {
                return res.status(404).send({
                    error: "No hay datos que mostrar",
                    message: "Utiliza GET /api/v1/water-supply-improvements/loadInitialData para cargar datos iniciales",
                    data: []
                });
            }

            // Si hay datos, transformarlos para eliminar el campo _id
            const transformedDocs = docs.map(doc => {
                const { _id, ...rest } = doc;
                return rest;
            });

            // Devolver los datos transformados
            return res.status(200).send(transformedDocs);
        });
    });




    // GET por parámetro (año o comunidad)
    app.get(BASE_API + "/water-supply-improvements/:param", (req, res) => {
        const param = req.params.param.toLowerCase();
        const year = parseInt(param);

        const search = isNaN(year)
            ? { autonomous_community: param }
            : { year: year };

        db.find(search, (err, docs) => {
            if (err) return res.status(500).send({ error: "Error en la búsqueda" });
            if (docs.length === 0) return res.status(404).send({ error: "Recurso no encontrado", message: "No se encontraron resultados para los parámetros proporcionados" });
            const transformed = docs.map(({ _id, ...rest }) => rest);
            return res.status(200).send(transformed);
        });
    });

    // GET por año y comunidad
    app.get(BASE_API + "/water-supply-improvements/:year/:autonomous_community", (req, res) => {
        const year = parseInt(req.params.year);
        const community = req.params.autonomous_community.toLowerCase();
        if (isNaN(year)) return res.status(400).send({ error: "Año inválido" });
        db.find({ year: year, autonomous_community: community }, (err, docs) => {
            if (err) return res.status(500).send({ error: "Error en la consulta" });
            if (docs.length === 0) return res.status(404).send({ error: "No se encontraron datos" });
            const transformed = docs.map(({ _id, ...rest }) => rest);
            return res.status(200).send(transformed.length === 1 ? transformed[0] : transformed);
        });
    });

    // F08 fix - Improper Type Validation - POST
    /*
        El código antiguo:
         app.post(BASE_API + "/water-supply-improvements", (req, res) => {
        const newEntry = req.body;
        const requiredFields = ["year", "autonomous_community", "amount", "benefited_population", "project_count"];
        const missing = requiredFields.filter(f => !newEntry[f]);
        if (missing.length > 0) return res.status(400).send({ error: "Faltan campos", missing });

        db.findOne({ year: newEntry.year, autonomous_community: newEntry.autonomous_community.toLowerCase() }, (err, doc) => {
            if (err) return res.status(500).send({ error: "Error en la búsqueda" });
            if (doc) return res.status(409).send({ error: "Ya existe un recurso para esa comunidad y año" });
            db.insert(newEntry, (err) => {
                if (err) return res.status(500).send({ error: "Error al insertar el dato" });
                return res.sendStatus(201);
            });
        });
    });

    app.post(BASE_API + "/water-supply-improvements/:year", (req, res) => {
        return res.status(405).send({ error: "No se permite POST a un recurso específico" });
    });
     contenía esta línea:
     db.findOne({ year: newEntry.year, autonomous_community: newEntry.autonomous_community.toLowerCase() }, (err, doc) => { ... })
     
     y era vulnerable a ataques de este tipo porque asume que newEntry.autonomous_community es siempre una cadena de texto. 
     Si un atacante envía un valor que no es una cadena, la llamada a toLowerCase() fallará y 
     podría causar un error o comportamiento inesperado en la aplicación. 

     Beneficios de esta solución:
        -Seguridad mejorada: Valida los tipos de datos antes de procesarlos
        -Prevención de errores: Evita excepciones causadas por tipos de datos inesperados
        -Mensajes claros: Proporciona mensajes específicos sobre qué campo tiene un tipo incorrecto
        -Datos consistentes: Asegura que los datos almacenados siempre tengan el formato esperado
        -Mantiene la funcionalidad: El comportamiento para usuarios legítimos sigue siendo el mismo

    */
    // POST
    app.post(BASE_API + "/water-supply-improvements", (req, res) => {
        const newEntry = req.body;
        const requiredFields = ["year", "autonomous_community", "amount", "benefited_population", "project_count"];
        const missing = requiredFields.filter(f => !newEntry[f]);
        if (missing.length > 0) return res.status(400).send({ error: "Faltan campos", missing });

        // Validación de tipos
        if (typeof newEntry.autonomous_community !== 'string') {
            return res.status(400).send({ error: "El campo autonomous_community debe ser una cadena de texto" });
        }

        if (typeof newEntry.year !== 'number' || isNaN(newEntry.year)) {
            return res.status(400).send({ error: "El campo year debe ser un número" });
        }

        if (typeof newEntry.amount !== 'number' || isNaN(newEntry.amount)) {
            return res.status(400).send({ error: "El campo amount debe ser un número" });
        }

        if (typeof newEntry.benefited_population !== 'number' || isNaN(newEntry.benefited_population)) {
            return res.status(400).send({ error: "El campo benefited_population debe ser un número" });
        }

        if (typeof newEntry.project_count !== 'number' || isNaN(newEntry.project_count)) {
            return res.status(400).send({ error: "El campo project_count debe ser un número" });
        }

        // Ahora podemos usar toLowerCase() de forma segura
        db.findOne({ year: newEntry.year, autonomous_community: newEntry.autonomous_community.toLowerCase() }, (err, doc) => {
            if (err) return res.status(500).send({ error: "Error en la búsqueda" });
            if (doc) return res.status(409).send({ error: "Ya existe un recurso para esa comunidad y año" });

            // Asegurar que se guarda en minúsculas
            newEntry.autonomous_community = newEntry.autonomous_community.toLowerCase();

            db.insert(newEntry, (err) => {
                if (err) return res.status(500).send({ error: "Error al insertar el dato" });
                return res.sendStatus(201);
            });
        });
    });


    //POST a recursos específicos
    app.post(BASE_API + "/water-supply-improvements/:param", (req, res) => {
        return res.status(405).send({
            error: "Método no permitido",
            message: "No se permite POST a un recurso específico"
        });
    });



    // PUT
    // PUT a un conjunto de recursos: no permitido
    app.put(BASE_API + "/water-supply-improvements", (req, res) => {
        return res.status(405).send({ error: "No se permite PUT a un conjunto de recursos" });
    });

    // PUT para actualizar un recurso específico identificado por año y comunidad autónoma
    app.put(BASE_API + "/water-supply-improvements/:year/:autonomous_community", (req, res) => {
        const year = parseInt(req.params.year);
        const community = req.params.autonomous_community.toLowerCase();

        if (isNaN(year)) {
            return res.status(400).send({ error: "Año inválido. Debe ser un número." });
        }

        const update = req.body;
        if (!update || Object.keys(update).length === 0) {
            return res.status(400).send({ error: "Petición mal formada: No hay datos en el cuerpo" });
        }

        // F08 FIX -Validación de tipos para los campos en el cuerpo
        if (update.autonomous_community !== undefined && typeof update.autonomous_community !== 'string') {
            return res.status(400).send({ error: "El campo autonomous_community debe ser una cadena de texto" });
        }

        if (update.year !== undefined && (typeof update.year !== 'number' || isNaN(update.year))) {
            return res.status(400).send({ error: "El campo year debe ser un número" });
        }

        if (update.amount !== undefined && (typeof update.amount !== 'number' || isNaN(update.amount))) {
            return res.status(400).send({ error: "El campo amount debe ser un número" });
        }

        if (update.benefited_population !== undefined && (typeof update.benefited_population !== 'number' || isNaN(update.benefited_population))) {
            return res.status(400).send({ error: "El campo benefited_population debe ser un número" });
        }

        if (update.project_count !== undefined && (typeof update.project_count !== 'number' || isNaN(update.project_count))) {
            return res.status(400).send({ error: "El campo project_count debe ser un número" });
        }


        // Buscar primero el recurso a actualizar
        db.findOne({ year, autonomous_community: community }, (err, existing) => {
            if (err) return res.status(500).send({ error: "Error en la búsqueda" });
            if (!existing) return res.status(404).send({ error: "Recurso no encontrado" });

            /* F08 fix - Improper Type Validation - PUT
           El código este:
           if ((update.year && update.year !== year) || 
       (update.autonomous_community && update.autonomous_community.toLowerCase() !== community)) {
   
          llama al método toLowerCase() en update.autonomous_community sin verificar si realmente es una cadena de texto, 
           lo que puede provocar errores si un atacante envía otros tipos de datos.
   
            Se ha agregado un campo de validación más arriba para verificar que el tipo de dato es correcto antes de llamar a toLowerCase().
   
   */

            // Si se intenta modificar 'year' o 'autonomous_community' se debe verificar que no cree duplicados
            if ((update.year && update.year !== year) ||
                (update.autonomous_community && update.autonomous_community.toLowerCase() !== community)) {
                db.findOne({
                    year: update.year,
                    autonomous_community: update.autonomous_community ? update.autonomous_community.toLowerCase() : community
                }, (err, dup) => {
                    if (err) return res.status(500).send({ error: "Error en la búsqueda de duplicados" });
                    if (dup) return res.status(409).send({ error: "Conflicto con recurso existente" });
                    doUpdate();
                });
            } else {
                doUpdate();
            }

            function doUpdate() {
                // Se realiza la actualización: se utiliza el operador $set para modificar solo los campos enviados
                db.update({ year, autonomous_community: community }, { $set: update }, {}, (err, numUpdated) => {
                    if (err) return res.status(500).send({ error: "Error al actualizar" });
                    if (numUpdated === 0) return res.status(404).send({ error: "Recurso no encontrado" });
                    return res.sendStatus(200);
                });
            }
        });
    });


    // DELETE general
    app.delete(BASE_API + "/water-supply-improvements", (req, res) => {
        db.count({}, (err, count) => {
            if (err) return res.status(500).send({ error: "Error al consultar base de datos" });
            if (count === 0) return res.status(404).send({ error: "No hay datos para eliminar" });
            db.remove({}, { multi: true }, (err, removed) => {
                if (err) return res.status(500).send({ error: "Error al eliminar" });
                res.status(200).send({ message: "Todos los datos eliminados", count: removed });
            });
        });
    });

    // DELETE por año y comunidad
    app.delete(BASE_API + "/water-supply-improvements/:year/:autonomous_community", (req, res) => {
        const year = parseInt(req.params.year);
        if (isNaN(year)) return res.status(400).send({ error: "Año inválido" });

        const community = req.params.autonomous_community.toLowerCase();

        // Buscar si el recurso existe
        db.findOne({ year, autonomous_community: community }, (err, doc) => {
            if (err) return res.status(500).send({ error: "Error al buscar el recurso antes de eliminarlo" });
            if (!doc) return res.status(404).send({ error: "Recurso no encontrado" });

            // Eliminar el recurso
            db.remove({ year, autonomous_community: community }, {}, (err, numRemoved) => {
                if (err) return res.status(500).send({ error: "Error al eliminar" });
                if (numRemoved === 0) return res.status(404).send({ error: "Recurso no encontrado" });

                // Retornar los datos eliminados
                const { _id, ...rest } = doc;
                res.status(200).send({ message: "Recurso eliminado correctamente", data: rest });
            });
        });
    });

    // DELETE por año
    app.delete(BASE_API + "/water-supply-improvements/:year", (req, res) => {
        const year = parseInt(req.params.year);
        if (isNaN(year)) return res.status(400).send({ error: "Año inválido" });
        db.remove({ year }, { multi: true }, (err, numRemoved) => {
            if (err) return res.status(500).send({ error: "Error al eliminar" });
            if (numRemoved === 0) return res.status(404).send({ error: "No se encontraron datos para ese año" });
            res.status(200).send({ message: `Se eliminaron ${numRemoved} registros para el año ${year}` });
        });
    });


}

export { loadBackend };