import dataStore from "nedb";
const BASE_API = "/api/v1";
let db = new dataStore();

const datosInicialesB = [/* ... (mismo contenido que ya tenías en tu array de datos) ... */];

function loadBackend(app) {
    // Carga de datos iniciales (nuevo endpoint específico)
    app.get(BASE_API + "/water-supply-improvements/loadInitialData", (req, res) => {
        db.count({}, (err, count) => {
            if (err) return res.status(500).send("Error al acceder a la base de datos.");
            if (count > 0) return res.status(405).send("Ya existen datos.");
            db.insert(datosInicialesB, (err, newDocs) => {
                if (err) return res.status(500).send("Error al insertar.");
                const transformed = newDocs.map(({ _id, ...rest }) => rest);
                return res.status(200).json(transformed);
            });
        });
    });

    // GET con filtros y paginación
    app.get(BASE_API + "/water-supply-improvements", (req, res) => {
        let query = {};
        const from = parseInt(req.query.from);
        const to = parseInt(req.query.to);
        const offset = parseInt(req.query.offset) || 0;
        const limit = parseInt(req.query.limit) || 0;

        if (!isNaN(from)) query.year = { ...query.year, $gte: from };
        if (!isNaN(to)) query.year = { ...query.year, $lte: to };

        const { from: _f, to: _t, offset: _o, limit: _l, ...otherParams } = req.query;
        for (const [key, value] of Object.entries(otherParams)) {
            const num = parseInt(value);
            query[key] = isNaN(num) ? value.toLowerCase() : num;
        }

        db.find(query).sort({ autonomous_community: 1 }).skip(offset).limit(limit).exec((err, docs) => {
            if (err) return res.status(500).send({ error: "Error en la consulta" });
            if (docs.length === 0) {
                return res.status(404).send({
                    error: "No se encontraron datos",
                    message: "Utiliza otros filtros o carga datos iniciales",
                    data: []
                });
            }
            const transformed = docs.map(({ _id, ...rest }) => rest);
            return res.status(200).json(transformed);
        });
    });

    // GET por parámetro único (año o comunidad)
    app.get(BASE_API + "/water-supply-improvements/:param", (req, res) => {
        const param = req.params.param.toLowerCase();
        const year = parseInt(param);
        const search = isNaN(year) ? { autonomous_community: param } : { year };

        db.find(search, (err, docs) => {
            if (err) return res.status(500).send({ error: "Error en la búsqueda" });
            if (docs.length === 0) return res.status(404).send({ error: "Recurso no encontrado" });
            const transformed = docs.map(({ _id, ...rest }) => rest);
            return res.status(200).json(transformed);
        });
    });

    // GET por año y comunidad
    app.get(BASE_API + "/water-supply-improvements/:year/:autonomous_community", (req, res) => {
        const year = parseInt(req.params.year);
        const community = req.params.autonomous_community.toLowerCase();
        if (isNaN(year)) return res.status(400).send({ error: "Año inválido" });

        db.find({ year, autonomous_community: community }, (err, docs) => {
            if (err) return res.status(500).send({ error: "Error en la consulta" });
            if (docs.length === 0) return res.status(404).send({ error: "No se encontraron datos" });
            const transformed = docs.map(({ _id, ...rest }) => rest);
            return res.status(200).json(transformed.length === 1 ? transformed[0] : transformed);
        });
    });

    // POST nuevo recurso
    app.post(BASE_API + "/water-supply-improvements", (req, res) => {
        const newEntry = req.body;
        const allowedFields = ["year", "autonomous_community", "amount", "benefited_population", "project_count"];

        const hasExtraFields = Object.keys(newEntry).some(f => !allowedFields.includes(f));
        const missing = allowedFields.filter(f => newEntry[f] === undefined || newEntry[f] === null);

        if (missing.length > 0 || hasExtraFields) {
            return res.status(400).send({ error: "Campos inválidos o faltantes", missing });
        }

        db.findOne({
            year: newEntry.year,
            autonomous_community: newEntry.autonomous_community.toLowerCase()
        }, (err, doc) => {
            if (err) return res.status(500).send({ error: "Error en la búsqueda" });
            if (doc) return res.status(409).send({ error: "Ya existe un recurso para esa comunidad y año" });

            db.insert(newEntry, (err) => {
                if (err) return res.status(500).send({ error: "Error al insertar el dato" });
                return res.sendStatus(201);
            });
        });
    });

    // POST inválido
    app.post(BASE_API + "/water-supply-improvements/:year", (req, res) => {
        return res.status(405).send({ error: "No se permite POST a un recurso específico" });
    });

    // PUT inválido
    app.put(BASE_API + "/water-supply-improvements", (req, res) => {
        return res.status(405).send({ error: "No se permite PUT a un conjunto de recursos" });
    });

    // PUT por año y comunidad
    app.put(BASE_API + "/water-supply-improvements/:year/:autonomous_community", (req, res) => {
        const year = parseInt(req.params.year);
        const community = req.params.autonomous_community.toLowerCase();
        const update = req.body;

        if (isNaN(year)) return res.status(400).send({ error: "Año inválido. Debe ser un número." });
        if (!update || Object.keys(update).length === 0) return res.status(400).send({ error: "Petición mal formada: No hay datos en el cuerpo" });

        if ((update.year && parseInt(update.year) !== year) || (update.autonomous_community && update.autonomous_community.toLowerCase() !== community)) {
            return res.status(400).send({ error: "Los datos no coinciden con los parámetros de la URL" });
        }

        db.update({ year, autonomous_community: community }, { $set: update }, {}, (err, numUpdated) => {
            if (err) return res.status(500).send({ error: "Error al actualizar" });
            if (numUpdated === 0) return res.status(404).send({ error: "Recurso no encontrado" });
            return res.sendStatus(200);
        });
    });

    // DELETE general
    app.delete(BASE_API + "/water-supply-improvements", (req, res) => {
        db.count({}, (err, count) => {
            if (err) return res.status(500).send({ error: "Error al consultar base de datos" });
            if (count === 0) return res.status(404).send({ error: "No hay datos para eliminar" });

            db.remove({}, { multi: true }, (err, removed) => {
                if (err) return res.status(500).send({ error: "Error al eliminar" });
                return res.status(200).send({ message: "Todos los datos eliminados", count: removed });
            });
        });
    });

    // DELETE por año y comunidad
    app.delete(BASE_API + "/water-supply-improvements/:year/:autonomous_community", (req, res) => {
        const year = parseInt(req.params.year);
        const community = req.params.autonomous_community.toLowerCase();
        if (isNaN(year)) return res.status(400).send({ error: "Año inválido" });

        db.remove({ year, autonomous_community: community }, {}, (err, numRemoved) => {
            if (err) return res.status(500).send({ error: "Error al eliminar" });
            if (numRemoved === 0) return res.status(404).send({ error: "Recurso no encontrado" });
            return res.status(200).send({ message: "Recurso eliminado correctamente" });
        });
    });

    // DELETE por año
    app.delete(BASE_API + "/water-supply-improvements/:year", (req, res) => {
        const year = parseInt(req.params.year);
        if (isNaN(year)) return res.status(400).send({ error: "Año inválido" });

        db.remove({ year }, { multi: true }, (err, numRemoved) => {
            if (err) return res.status(500).send({ error: "Error al eliminar" });
            if (numRemoved === 0) return res.status(404).send({ error: "No se encontraron datos para ese año" });
            return res.status(200).send({ message: `Se eliminaron ${numRemoved} registros para el año ${year}` });
        });
    });

    // Documentación
    app.get(BASE_API + "/water-supply-improvements/docs", (req, res) => {
        res.redirect("https://documenter.getpostman.com/view/42334859/2sB2cUC3V9");
    });
}

export { loadBackendB };


