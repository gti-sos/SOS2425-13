import dataStore from 'nedb';
let db = new dataStore();


const BASE_API = "/api/v1";
const RESOURCE = "/forest-fires";

const nuevosAccidentesForestales = [
    { year: 2024, autonomous_comunity: "Andalucia", number_of_accidents: 10034, percentage_of_large_fires: 0.39 },
    { year: 2024, autonomous_comunity: "Aragon", number_of_accidents: 5877, percentage_of_large_fires: 0.59 },
    { year: 2024, autonomous_comunity: "Asturias", number_of_accidents: 19003, percentage_of_large_fires: 0.25 },
    { year: 2024, autonomous_comunity: "Comunidad Valenciana", number_of_accidents: 6982, percentage_of_large_fires: 0.68 },
    { year: 2024, autonomous_comunity: "Canarias", number_of_accidents: 1313, percentage_of_large_fires: 0.82 },
    { year: 2024, autonomous_comunity: "Cantabria", number_of_accidents: 8316, percentage_of_large_fires: 0.29 },
    { year: 2024, autonomous_comunity: "Castilla La Mancha", number_of_accidents: 9864, percentage_of_large_fires: 0.42 },
    { year: 2024, autonomous_comunity: "Castilla y Leon", number_of_accidents: 20343, percentage_of_large_fires: 0.47 },
    { year: 2024, autonomous_comunity: "Cataluña", number_of_accidents: 7756, percentage_of_large_fires: 0.37 },
    { year: 2024, autonomous_comunity: "Ceuta", number_of_accidents: 7, percentage_of_large_fires: 0 },
    { year: 2024, autonomous_comunity: "Comunidad de Madrid", number_of_accidents: 6390, percentage_of_large_fires: 0.48 },
];

const datosAlvaro = [
    { year: 2006, autonomous_comunity: "Andalucia", number_of_accidents: 8034, percentage_of_large_fires: 0.19 },
    { year: 2006, autonomous_comunity: "Aragon", number_of_accidents: 3877, percentage_of_large_fires: 0.39 },
    { year: 2006, autonomous_comunity: "Asturias", number_of_accidents: 17003, percentage_of_large_fires: 0.05 },
    { year: 2006, autonomous_comunity: "Comunidad Valenciana", number_of_accidents: 3982, percentage_of_large_fires: 0.48 },
    { year: 2006, autonomous_comunity: "Canarias", number_of_accidents: 1113, percentage_of_large_fires: 0.72 },
    { year: 2006, autonomous_comunity: "Cantabria", number_of_accidents: 6316, percentage_of_large_fires: 0.09 },
    { year: 2006, autonomous_comunity: "Castilla La Mancha", number_of_accidents: 7864, percentage_of_large_fires: 0.22 },
    { year: 2006, autonomous_comunity: "Castilla y Leon", number_of_accidents: 18343, percentage_of_large_fires: 0.27 },
    { year: 2006, autonomous_comunity: "Cataluña", number_of_accidents: 5756, percentage_of_large_fires: 0.17 },
    { year: 2006, autonomous_comunity: "Ceuta", number_of_accidents: 5, percentage_of_large_fires: 0 },
    { year: 2006, autonomous_comunity: "Comunidad de Madrid", number_of_accidents: 4390, percentage_of_large_fires: 0.28 },

    { year: 2016, autonomous_comunity: "Andalucia", number_of_accidents: 8347, percentage_of_large_fires: 0.17 },
    { year: 2016, autonomous_comunity: "Aragon", number_of_accidents: 3567, percentage_of_large_fires: 0.37 },
    { year: 2016, autonomous_comunity: "Asturias", number_of_accidents: 16200, percentage_of_large_fires: 0.04 },
    { year: 2016, autonomous_comunity: "Comunidad Valenciana", number_of_accidents: 3802, percentage_of_large_fires: 0.46},
    { year: 2016, autonomous_comunity: "Canarias", number_of_accidents: 1056, percentage_of_large_fires: 0.7 },
    { year: 2016, autonomous_comunity: "Cantabria", number_of_accidents: 6269, percentage_of_large_fires: 0.09 },
    { year: 2016, autonomous_comunity: "Castilla La Mancha", number_of_accidents: 7390, percentage_of_large_fires: 0.2 },
    { year: 2016, autonomous_comunity: "Castilla y Leon", number_of_accidents: 19100, percentage_of_large_fires: 0.23 },
    { year: 2016, autonomous_comunity: "Cataluña", number_of_accidents: 5345, percentage_of_large_fires: 0.17 },
    { year: 2016, autonomous_comunity: "Ceuta", number_of_accidents: 4, percentage_of_large_fires: 0 },
    { year: 2016, autonomous_comunity: "Comunidad de Madrid", number_of_accidents: 4909, percentage_of_large_fires: 0.3 },

];


export function loadBackendA(app) {

    // Cargar datos iniciales
    app.get(`${BASE_API}${RESOURCE}/loadInitialData`, (req, res) => {
        db.find({}, (err, data) => {
            if (data.length === 0) {
                db.insert(initialData, () => {
                    res.status(200).json({ message: "Datos cargados correctamente", data: initialData });
                });
            } else {
                res.status(409).json({ message: "Ya hay datos cargados", data });
            }
        });
    });

    // GET general con filtros y paginación
    app.get(`${BASE_API}${RESOURCE}`, (req, res) => {
        let query = {};
        let { from, to, offset, limit, ...filters } = req.query;

        Object.keys(filters).forEach(key => {
            query[key] = isNaN(filters[key]) ? filters[key].toLowerCase() : parseFloat(filters[key]);
        });

        if (from) query.year = { ...query.year, $gte: parseInt(from) };
        if (to) query.year = { ...query.year, $lte: parseInt(to) };

        db.find(query)
            .skip(parseInt(offset) || 0)
            .limit(parseInt(limit) || 0)
            .exec((err, data) => {
                if (data.length === 0) {
                    res.status(404).json({ message: "No se encontraron datos" });
                } else {
                    res.status(200).json(data.map(({ _id, ...rest }) => rest));
                }
            });
    });

    // GET por año y comunidad
    app.get(`${BASE_API}${RESOURCE}/:year/:autonomous_community`, (req, res) => {
        const { year, autonomous_community } = req.params;

        db.findOne({ year: parseInt(year), autonomous_community: autonomous_community.toLowerCase() }, (err, data) => {
            if (!data) {
                res.status(404).json({ message: "Dato no encontrado" });
            } else {
                delete data._id;
                res.status(200).json(data);
            }
        });
    });

    // POST nuevo recurso
    app.post(`${BASE_API}${RESOURCE}`, (req, res) => {
        const newEntry = req.body;
        const required = ["year", "autonomous_community", "number_of_accidents", "percentage_of_large_fires"];

        if (required.some(field => newEntry[field] === undefined)) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }

        newEntry.autonomous_community = newEntry.autonomous_community.toLowerCase();

        db.findOne({ year: newEntry.year, autonomous_community: newEntry.autonomous_community }, (err, existing) => {
            if (existing) {
                res.status(409).json({ error: "Ya existe ese dato" });
            } else {
                db.insert(newEntry, () => res.status(201).json({ message: "Dato insertado correctamente" }));
            }
        });
    });

    // POST a recurso específico (no permitido)
    app.post(`${BASE_API}${RESOURCE}/:year`, (req, res) => {
        res.status(405).json({ error: "POST no permitido en recurso específico" });
    });

    // PUT para recurso específico
    app.put(`${BASE_API}${RESOURCE}/:year/:autonomous_community`, (req, res) => {
        const { year, autonomous_community } = req.params;
        const updated = req.body;

        db.update({ year: parseInt(year), autonomous_community: autonomous_community.toLowerCase() }, { $set: updated }, {}, (err, count) => {
            if (count === 0) {
                res.status(404).json({ error: "Dato no encontrado" });
            } else {
                res.status(200).json({ message: "Dato actualizado" });
            }
        });
    });

    // PUT a colección completa (no permitido)
    app.put(`${BASE_API}${RESOURCE}`, (req, res) => {
        res.status(405).json({ error: "PUT no permitido en el recurso base" });
    });

    // DELETE todos los datos
    app.delete(`${BASE_API}${RESOURCE}`, (req, res) => {
        db.remove({}, { multi: true }, (err, count) => {
            if (count === 0) {
                res.status(404).json({ error: "No hay datos que eliminar" });
            } else {
                res.status(200).json({ message: `Eliminados ${count} registros` });
            }
        });
    });

    // DELETE por año y comunidad
    app.delete(`${BASE_API}${RESOURCE}/:year/:autonomous_community`, (req, res) => {
        const { year, autonomous_community } = req.params;

        db.remove({ year: parseInt(year), autonomous_community: autonomous_community.toLowerCase() }, {}, (err, count) => {
            if (count === 0) {
                res.status(404).json({ error: "Dato no encontrado" });
            } else {
                res.status(200).json({ message: "Dato eliminado correctamente" });
            }
        });
    });

    // Documentación
    app.get(`${BASE_API}${RESOURCE}/docs`, (req, res) => {
        res.redirect("https://documenter.getpostman.com/view/42116184/2sB2cUBNgF");
    });
}
