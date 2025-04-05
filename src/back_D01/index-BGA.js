import dataStore from 'nedb';
let db = new dataStore();

const BASE_API = "/api/v1";
const RESOURCE = "/water-supply-improvements";

let initialData = [
    { year: 2009, autonomous_community: "galicia", amount: 9874563, benefited_population: 21456, project_count: 100 },
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

let datosB = [
    { year: 2015, autonomous_community: "andalucia", amount: 12604168, benefited_population: 25208, project_count: 45},
    { year: 2015, autonomous_community: "aragon", amount: 5494284, benefited_population: 10988, project_count: 18},
    { year: 2015, autonomous_community: "asturias", amount: 2319946, benefited_population: 4640, project_count: 8},
    { year: 2015, autonomous_community: "baleares", amount: 2658926, benefited_population: 5318, project_count: 10},
    { year: 2015, autonomous_community: "canarias", amount: 5743835, benefited_population: 11488, project_count: 20},
    { year: 2015, autonomous_community: "cantabria", amount: 5447744, benefited_population: 10895, project_count: 20},
    { year: 2015, autonomous_community: "castilla y leon", amount: 7984325, benefited_population: 15969, project_count: 30},
    { year: 2015, autonomous_community: "castilla-La mancha", amount: 10880000, benefited_population: 21760, project_count: 40},
    { year: 2015, autonomous_community: "catalunia", amount: 10075812, benefited_population: 20152, project_count: 38},
    { year: 2015, autonomous_community: "valencia", amount: 7017390, benefited_population: 14053, project_count: 27},
    { year: 2015, autonomous_community: "extremadura", amount: 8591952, benefited_population: 17184, project_count: 32},
    { year: 2015, autonomous_community: "galicia", amount: 6799527, benefited_population: 13599, project_count: 25},
    { year: 2015, autonomous_community: "madrid", amount: 2901139, benefited_population: 4164, project_count: 11},
    { year: 2015, autonomous_community: "murcia", amount: 2082060, benefited_population: 4164, project_count: 9},
    { year: 2015, autonomous_community: "pais vasco", amount: 3153155, benefited_population: 6306, project_count: 14},
    
    // Datos adicionales...
];

export function loadBackend(app) {
    app.use((req, res, next) => {
        if (["POST", "PUT"].includes(req.method) && req.headers['content-type'] !== 'application/json') {
            return res.status(415).send({ error: 'Tipo de contenido no permitido, solo application/json' });
        }
        next();
    });

    // Verifica y carga datos iniciales si no existen datosB
    app.get(BASE_API + RESOURCE + "/loadInitialData", (req, res) => {
        db.find({}, (err, docs) => {
            if (docs.length === 0) {
                db.insert(initialData);
                res.status(200).send({ message: "Datos iniciales cargados correctamente", data: initialData });
            } else if (datosB.length === 0) {
                db.insert(initialData); // Solo se carga si datosB está vacío
                res.status(200).send({ message: "Datos iniciales cargados correctamente", data: initialData });
            } else {
                db.insert(datosB); // Si datosB tiene datos, los carga
                res.status(200).send({ message: "Datos B cargados correctamente", data: datosB });
            }
        });
    });

    // El resto de las rutas y lógica se mantiene igual

    // GET genérico con búsqueda, filtros y paginación
    app.get(BASE_API + RESOURCE, (req, res) => {
        let query = {};
        let fromYear = req.query.from ? parseInt(req.query.from) : null;
        let toYear = req.query.to ? parseInt(req.query.to) : null;
        let limit = parseInt(req.query.limit);
        let offset = parseInt(req.query.offset);

        for (let key in req.query) {
            if (["from", "to", "limit", "offset"].includes(key)) continue;
            query[key] = ["year", "amount", "benefited_population", "project_count"].includes(key)
                ? parseInt(req.query[key])
                : req.query[key].toLowerCase();
        }

        if (fromYear !== null) query.year = { $gte: fromYear };
        if (toYear !== null) query.year = Object.assign(query.year || {}, { $lte: toYear });

        db.find(query, (err, data) => {
            if (err) return res.status(500).send({ error: "Error interno del servidor" });

            if (data.length === 0) {
                return res.status(404).send({
                    error: "ERROR 404: No se encontraron mejoras de suministro",
                    message: `No se encontraron datos para las fechas de ${fromYear || 'cualquier'} a ${toYear || 'cualquier'}`
                });
            }

            const total = data.length;
            if (isNaN(limit) || limit < 1) limit = total;
            if (isNaN(offset) || offset < 0) offset = 0;

            const paginatedData = data.slice(offset, offset + limit);
            const cleanData = paginatedData.map(({ _id, ...rest }) => rest);

            res.status(200).send({
                total,
                limit,
                offset,
                count: cleanData.length,
                results: cleanData
            });
        });
    });

    app.get(BASE_API + RESOURCE + "/:year/:autonomous_community", (req, res) => {
        let year = parseInt(req.params.year);
        let community = req.params.autonomous_community.toLowerCase();
        db.findOne({ year, autonomous_community: community }, (err, data) => {
            if (!data) {
                res.status(404).send({
                    error: "ERROR 404: No se encontraron mejoras",
                    message: `No hay mejoras en ${community} para el año ${year}`
                });
            } else {
                delete data._id;
                res.status(200).send(data);
            }
        });
    });

    app.post(BASE_API + RESOURCE, (req, res) => {
        const newData = req.body;
        const requiredFields = ["year", "autonomous_community", "amount", "benefited_population", "project_count"];
        let missingFields = requiredFields.filter(f => !newData[f]);

        if (missingFields.length > 0) {
            return res.status(400).send({ error: "Faltan campos", missing_fields: missingFields });
        }

        db.findOne({ year: newData.year, autonomous_community: newData.autonomous_community }, (err, existing) => {
            if (existing) {
                res.status(409).send({ error: "ERROR 409: Ya existe una ayuda para esa comunidad en ese año" });
            } else {
                db.insert(newData);
                res.sendStatus(201);
            }
        });
    });

    app.post(BASE_API + RESOURCE + "/:year", (req, res) => {
        res.status(405).send({
            error: "ERROR 405: Método no permitido. No se pueden hacer POST a recursos específicos"
        });
    });

    app.put(BASE_API + RESOURCE, (req, res) => {
        res.status(405).send({
            error: "ERROR 405: No se puede hacer PUT a un conjunto de recursos"
        });
    });

    app.put(BASE_API + RESOURCE + "/:year/:autonomous_community", (req, res) => {
        let year = parseInt(req.params.year);
        let community = req.params.autonomous_community.toLowerCase();

        const newData = req.body;
        const requiredFields = ["year", "autonomous_community", "amount", "benefited_population", "project_count"];
        const keys = Object.keys(newData);

        if (keys.length !== requiredFields.length || !requiredFields.every(field => keys.includes(field))) {
            return res.status(400).send({
                error: "ERROR 400: Estructura incorrecta",
                message: "El cuerpo del PUT debe tener exactamente los campos: " + requiredFields.join(", ")
            });
        }

        db.update({ year, autonomous_community: community }, { $set: newData }, {}, (err, numReplaced) => {
            if (numReplaced === 0) {
                res.status(404).send({
                    error: "ERROR 404: Mejora de suministro no encontrada",
                    message: `No se encontró una mejora de suministro de agua para la comunidad autónoma ${community} en el año ${year}`
                });
            } else {
                res.sendStatus(200);
            }
        });
    });

    app.delete(BASE_API + RESOURCE, (req, res) => {
        db.remove({}, { multi: true }, (err, numRemoved) => {
            if (numRemoved === 0) {
                res.status(404).send({
                    error: "ERROR 404: No hay mejoras de suministro para eliminar",
                    message: "No hay datos cargados en el sistema"
                });
            } else {
                res.status(200).send({ message: "Todas las mejoras de suministro han sido eliminadas correctamente" });
            }
        });
    });

    app.delete(BASE_API + RESOURCE + "/:year/:autonomous_community", (req, res) => {
        let year = parseInt(req.params.year);
        let community = req.params.autonomous_community.toLowerCase();

        db.remove({ year, autonomous_community: community }, {}, (err, numRemoved) => {
            if (numRemoved === 0) {
                res.status(404).send({
                    error: "ERROR 404: Mejoras de suministro no encontradas",
                    message: `No se encontró ninguna mejora de suministro de agua para la comunidad autónoma ${community} en el año ${year}`
                });
            } else {
                res.status(200).send({ message: `Mejoras eliminadas correctamente` });
            }
        });
    });
}


