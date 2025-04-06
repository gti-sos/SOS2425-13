import dataStore from "nedb";
const BASE_API = "/api/v1";
let db = new dataStore();

const datosInicialesB = [
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

    { year: 2016, autonomous_community: "andalucia", amount: 12646637, benefited_population: 157577, project_count: 50},
    { year: 2016, autonomous_community: "aragon", amount: 5528413, benefited_population: 29024, project_count: 19},
    { year: 2016, autonomous_community: "asturias", amount: 2336099, benefited_population: 5162, project_count: 9},
    { year: 2016, autonomous_community: "baleares", amount: 2663141, benefited_population: 7004, project_count: 12},
    { year: 2016, autonomous_community: "canarias", amount: 5654386, benefited_population: 32399, project_count: 24},
    { year: 2016, autonomous_community: "cantabria", amount: 5528871, benefited_population: 28971, project_count: 22},
    { year: 2016, autonomous_community: "castilla y leon", amount: 8039214, benefited_population: 66162, project_count: 33},
    { year: 2016, autonomous_community: "castilla-La mancha", amount: 10693386, benefited_population: 119017, project_count: 42},
    { year: 2016, autonomous_community: "catalunia", amount: 9888014, benefited_population: 99077, project_count: 40},
    { year: 2016, autonomous_community: "valencia", amount: 7092068, benefited_population: 17784, project_count: 28},
    { year: 2016, autonomous_community: "extremadura", amount: 8583097, benefited_population: 71153, project_count: 34},
    { year: 2016, autonomous_community: "galicia", amount: 6684255, benefited_population: 46188, project_count: 27},
    { year: 2016, autonomous_community: "madrid", amount: 2889852, benefited_population: 28899, project_count: 12},
    { year: 2016, autonomous_community: "murcia", amount: 2054142, benefited_population: 4108, project_count: 10},
    { year: 2016, autonomous_community: "pais vasco", amount: 3169746, benefited_population: 9699, project_count: 16},

    { year: 2017, autonomous_community: "andalucia", amount: 12670092, benefited_population: 165978, project_count: 55},
    { year: 2017, autonomous_community: "aragon", amount: 5411728, benefited_population: 29548, project_count: 20},
    { year: 2017, autonomous_community: "asturias", amount: 2299811, benefited_population: 5243, project_count: 10},
    { year: 2017, autonomous_community: "baleares", amount: 2654119, benefited_population: 7378, project_count: 13},
    { year: 2017, autonomous_community: "canarias", amount: 5807226, benefited_population: 32539, project_count: 26},
    { year: 2017, autonomous_community: "cantabria", amount: 5479462, benefited_population: 31088, project_count: 24},
    { year: 2017, autonomous_community: "castilla y leon", amount: 7874978, benefited_population: 56558, project_count: 36},
    { year: 2017, autonomous_community: "castilla-La mancha", amount: 10947818, benefited_population: 120047, project_count: 45},
    { year: 2017, autonomous_community: "catalunia", amount: 9922517, benefited_population: 36088, project_count: 42},
    { year: 2017, autonomous_community: "valencia", amount: 7002918, benefited_population: 22084, project_count: 30},
    { year: 2017, autonomous_community: "extremadura", amount: 8664820, benefited_population: 71153, project_count: 36},
    { year: 2017, autonomous_community: "galicia", amount: 6727106, benefited_population: 42292, project_count: 29},
    { year: 2017, autonomous_community: "madrid", amount: 2923797, benefited_population: 27998, project_count: 13},
    { year: 2017, autonomous_community: "murcia", amount: 2045301, benefited_population: 4458, project_count: 11},
    { year: 2017, autonomous_community: "pais vasco", amount: 3194418, benefited_population: 10317, project_count: 18}
];

function loadBackendB(app) {
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
    app.get(BASE_API + "/water-supply-improvements", (req, res) => {
        let query = {};
        const from = req.query.from ? parseInt(req.query.from) : null;
        const to = req.query.to ? parseInt(req.query.to) : null;
        if (!isNaN(from)) query.year = { ...query.year, $gte: from };
        if (!isNaN(to)) query.year = { ...query.year, $lte: to };
        const { from: _f, to: _t, ...otherParams } = req.query;
        for (const [key, value] of Object.entries(otherParams)) {
            const num = parseInt(value);
            query[key] = isNaN(num) ? value.toLowerCase() : num;
        }
        db.find(query, (err, docs) => {
            if (err) return res.status(500).send({ error: "Error en la consulta" });
            if (docs.length === 0) {
            return res.status(404).send({
                error: "No se encontraron datos",
                message: "Utiliza otros filtros o carga datos iniciales",
                data: []
            });
        }
            const transformed = docs.map(({ _id, ...rest }) => rest);
            return res.status(200).send(transformed);
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
            if (docs.length === 0) return res.status(404).send({ error: "Recurso no encontrado" });
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

    // POST
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

    // PUT
    app.put(BASE_API + "/water-supply-improvements", (req, res) => {
        return res.status(405).send({ error: "No se permite PUT a un conjunto de recursos" });
    });

    app.put(BASE_API + "/water-supply-improvements/:year/:autonomous_community", (req, res) => {
        const year = parseInt(req.params.year);
        const community = req.params.autonomous_community.toLowerCase();
        if (isNaN(year)) return res.status(400).send({ error: "Año inválido. Debe ser un número." });
        const update = req.body;

        if (!update || Object.keys(update).length === 0) return res.status(400).send({ error: "Petición mal formada: No hay datos en el cuerpo" });

        db.findOne({ year, autonomous_community: community }, (err, existing) => {
            if (err) return res.status(500).send({ error: "Error en la búsqueda" });
            if (!existing) return res.status(404).send({ error: "Recurso no encontrado" });

            if ((update.year && update.year !== year) || (update.autonomous_community && update.autonomous_community.toLowerCase() !== community)) {
                db.findOne({ year: update.year, autonomous_community: update.autonomous_community?.toLowerCase() }, (err, dup) => {
                    if (dup) return res.status(409).send({ error: "Conflicto con recurso existente" });
                    doUpdate();
                });
            } else doUpdate();

            function doUpdate() {
                db.update({ year, autonomous_community: community }, { $set: update }, {}, (err) => {
                    if (err) return res.status(500).send({ error: "Error al actualizar" });
                    res.sendStatus(200);
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
        db.findOne({ year, autonomous_community: community }, (err, doc) => {
        if (err) return res.status(500).send({ error: "Error al buscar el recurso antes de eliminarlo" });
        if (!doc) return res.status(404).send({ error: "Recurso no encontrado" });

        db.remove({ year, autonomous_community: community }, {}, (err) => {
                if (err) return res.status(500).send({ error: "Error al eliminar" });
                const { _id, ...rest } = doc;
                res.status(200).send({ message: "Recurso eliminado correctamente", data: rest });
            });
            if (numRemoved === 0) return res.status(404).send({ error: "Recurso no encontrado" });
            res.status(200).send({ message: "Recurso eliminado correctamente" });
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

    // Docs
    app.get(BASE_API + "/water-supply-improvements/docs", (req, res) => {
        res.redirect("https://documenter.getpostman.com/view/42334859/2sB2cUC3V9");
    });
}

export { loadBackendB };

