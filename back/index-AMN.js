import dataStore from '@seald-io/nedb';
let db = new dataStore();

const BASE_API = "/api/v1";

const nuevosAccidentesForestales = [
    { year: 2024, autonomous_community: "andalucia", number_of_accidents: 10034, percentage_of_large_fires: 0.39 },
    { year: 2024, autonomous_community: "aragon", number_of_accidents: 5877, percentage_of_large_fires: 0.59 },
    { year: 2024, autonomous_community: "asturias", number_of_accidents: 19003, percentage_of_large_fires: 0.25 },
    { year: 2024, autonomous_community: "comunidad valenciana", number_of_accidents: 6982, percentage_of_large_fires: 0.68 },
    { year: 2024, autonomous_community: "canarias", number_of_accidents: 1313, percentage_of_large_fires: 0.82 },
    { year: 2024, autonomous_community: "cantabria", number_of_accidents: 8316, percentage_of_large_fires: 0.29 },
    { year: 2024, autonomous_community: "castilla-la mancha", number_of_accidents: 9864, percentage_of_large_fires: 0.42 },
    { year: 2024, autonomous_community: "castilla y leon", number_of_accidents: 20343, percentage_of_large_fires: 0.47 },
    { year: 2024, autonomous_community: "cataluña", number_of_accidents: 7756, percentage_of_large_fires: 0.37 },
    { year: 2024, autonomous_community: "ceuta", number_of_accidents: 7, percentage_of_large_fires: 0 },
    { year: 2024, autonomous_community: "comunidad de madrid", number_of_accidents: 6390, percentage_of_large_fires: 0.48 },
];

const datosAlvaro = [
    { year: 2006, autonomous_community: "andalucia", number_of_accidents: 8034, percentage_of_large_fires: 0.19 },
    { year: 2006, autonomous_community: "aragon", number_of_accidents: 3877, percentage_of_large_fires: 0.39 },
    { year: 2006, autonomous_community: "asturias", number_of_accidents: 17003, percentage_of_large_fires: 0.05 },
    { year: 2006, autonomous_community: "comunidad valenciana", number_of_accidents: 3982, percentage_of_large_fires: 0.48 },
    { year: 2006, autonomous_community: "canarias", number_of_accidents: 1113, percentage_of_large_fires: 0.72 },
    { year: 2006, autonomous_community: "cantabria", number_of_accidents: 6316, percentage_of_large_fires: 0.09 },
    { year: 2006, autonomous_community: "castilla-la mancha", number_of_accidents: 7864, percentage_of_large_fires: 0.22 },
    { year: 2006, autonomous_community: "castilla y leon", number_of_accidents: 18343, percentage_of_large_fires: 0.27 },
    { year: 2006, autonomous_community: "cataluña", number_of_accidents: 5756, percentage_of_large_fires: 0.17 },
    { year: 2006, autonomous_community: "ceuta", number_of_accidents: 5, percentage_of_large_fires: 0 },
    { year: 2006, autonomous_community: "comunidad de madrid", number_of_accidents: 4390, percentage_of_large_fires: 0.28 },
    { year: 2016, autonomous_community: "andalucia", number_of_accidents: 8347, percentage_of_large_fires: 0.17 },
    { year: 2016, autonomous_community: "aragon", number_of_accidents: 3567, percentage_of_large_fires: 0.37 },
    { year: 2016, autonomous_community: "asturias", number_of_accidents: 16200, percentage_of_large_fires: 0.04 },
    { year: 2016, autonomous_community: "comunidad valenciana", number_of_accidents: 3802, percentage_of_large_fires: 0.46 },
    { year: 2016, autonomous_community: "canarias", number_of_accidents: 1056, percentage_of_large_fires: 0.7 },
    { year: 2016, autonomous_community: "cantabria", number_of_accidents: 6269, percentage_of_large_fires: 0.09 },
    { year: 2016, autonomous_community: "castilla-la mancha", number_of_accidents: 7390, percentage_of_large_fires: 0.2 },
    { year: 2016, autonomous_community: "castilla y leon", number_of_accidents: 19100, percentage_of_large_fires: 0.23 },
    { year: 2016, autonomous_community: "cataluña", number_of_accidents: 5345, percentage_of_large_fires: 0.17 },
    { year: 2016, autonomous_community: "ceuta", number_of_accidents: 4, percentage_of_large_fires: 0 },
    { year: 2016, autonomous_community: "comunidad de madrid", number_of_accidents: 4909, percentage_of_large_fires: 0.3 },
];

export function loadBackend(app) {
    app.get(BASE_API + "/forest-fires/docs", (req, res) => {
        res.redirect("https://documenter.getpostman.com/view/42116184/2sB2cUBNgF");
    });

    // Cargar datos iniciales
    app.get(BASE_API + "/forest-fires/loadInitialData", (req, res) => {
        console.log("New GET to /forest-fires/loadInitialData");

        db.find({}, (err, data) => {
            if (data.length === 0) {
                db.insert(nuevosAccidentesForestales, () => {
                    res.status(200).json({ message: "Datos cargados correctamente", data: nuevosAccidentesForestales });
                });
            } else {
                res.status(409).json({ message: "Ya hay datos cargados", data });
            }
        });
    });

    // Cargar datosAlvaro

    app.get(BASE_API + "/forest-fires/loadAlvaroData", (req, res) => {
        console.log("GET to /forest-fires/loadAlvaroData");

        const datosFormateados = datosAlvaro.map(d => ({
            ...d,
            autonomous_community: d.autonomous_community.toLowerCase()
        }));

        db.insert(datosFormateados, (err, newDocs) => {
            if (err) {
                res.status(500).json({ message: "Error insertando datos", error: err });
            } else {
                res.status(200).json({ message: "Datos de Álvaro cargados correctamente", data: newDocs });
            }
        });
    });


    // GET general con filtros y paginación
    app.get(BASE_API + "/forest-fires", (req, res) => {
        console.log("New GET request to /forest-fires");

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

    // GET por parámetro único (año o comunidad autónoma)
    app.get(BASE_API + "/forest-fires/:param", (req, res) => {
        console.log("GET a /forest-fires/:param");

        const param = req.params.param.toLowerCase();

        db.find({}, (err, data) => {
            if (err) {
                return res.status(500).json({ error: "Error accediendo a la base de datos" });
            }

            if (data.length === 0) {
                return res.status(404).json({
                    error: "No hay datos disponibles",
                    message: "Realice un GET a /forest-fires/loadInitialData para cargar datos"
                });
            }

            let filteredData;

            if (!isNaN(param)) {
                // Buscar por año
                filteredData = data.filter(entry => entry.year === parseInt(param));
            } else {
                // Buscar por comunidad
                filteredData = data.filter(entry => entry.autonomous_community.toLowerCase() === param);
            }

            if (filteredData.length === 0) {
                return res.status(404).json({
                    error: "No se encontraron registros",
                    message: `No hay registros para el parámetro: ${param}`
                });
            }

            // Limpiar _id y responder
            const cleanData = filteredData.map(({ _id, ...rest }) => rest);
            res.status(200).json(cleanData);
        });
    });


    // GET por año y comunidad
    app.get(BASE_API + "/forest-fires/:year/:autonomous_community", (req, res) => {
        console.log("Received GET request to /forest-fires/:year/:autonomous_community");

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

    /* F08 fix: Improper Type Validation
    El código de antes:

    // POST nuevo recurso
    app.post(BASE_API + "/forest-fires", (req, res) => {
        const newEntry = req.body;
        const required = ["year", "autonomous_community", "number_of_accidents", "percentage_of_large_fires"];

        if (required.some(field => newEntry[field] === undefined)) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }

        newEntry.autonomous_community = newEntry.autonomous_community.toLowerCase();

        ofrecía esta vulnerabilidad:
        Se asume que autonomous_community siempre es una cadena de texto, 
        permitiendo a un atacante enviar otros tipos de datos que podrían causar errores al llamar al método toLowerCase().

        Beneficios de la mejora:
        
            -Seguridad mejorada: Valida el tipo de cada campo antes de procesarlo
            -Mensajes de error claros: Proporciona mensajes específicos sobre qué campo tiene un tipo incorrecto
            -Funcionamiento correcto: Mantiene la funcionalidad original mientras previene posibles ataques
            -Validación completa: No solo verifica la presencia de los campos, sino también su tipo correcto

        */
    // POST nuevo recurso
    app.post(BASE_API + "/forest-fires", (req, res) => {
        const newEntry = req.body;
        const required = ["year", "autonomous_community", "number_of_accidents", "percentage_of_large_fires"];

        if (required.some(field => newEntry[field] === undefined)) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }

        // Validar tipos de datos
        if (typeof newEntry.autonomous_community !== 'string') {
            return res.status(400).json({ error: "El campo autonomous_community debe ser una cadena de texto" });
        }

        if (typeof newEntry.year !== 'number' || isNaN(newEntry.year)) {
            return res.status(400).json({ error: "El campo year debe ser un número" });
        }

        if (typeof newEntry.number_of_accidents !== 'number' || isNaN(newEntry.number_of_accidents)) {
            return res.status(400).json({ error: "El campo number_of_accidents debe ser un número" });
        }

        if (typeof newEntry.percentage_of_large_fires !== 'number' || isNaN(newEntry.percentage_of_large_fires)) {
            return res.status(400).json({ error: "El campo percentage_of_large_fires debe ser un número" });
        }

        // Ahora es seguro usar toLowerCase()
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
    app.post(BASE_API + "/forest-fires/:year", (req, res) => {
        console.log(`Intento de POST a /forest-fires/${req.params.year}`);
        res.status(405).json({ error: "POST no permitido en recurso específico" });
    });

    // PUT para recurso específico con manejo de errores 400 y 409
    app.put(BASE_API + "/forest-fires/:year/:autonomous_community", (req, res) => {
        const { year, autonomous_community } = req.params;
        const updated = req.body;

        /* F08 fix: Improper Type Validation
        El código de antes:
        if (
    parseInt(year) !== parseInt(updated.year) ||
    autonomous_community.toLowerCase() !== updated.autonomous_community.toLowerCase()
)
         ofrecía esta vulnerabilidad:
        el método toLowerCase() sin verificar primero que updated.autonomous_community 
        sea realmente una cadena de texto.


 Beneficios de la mejora:
        -Seguridad mejorada: Valida el tipo de cada campo antes de procesarlo
        -Mensajes de error claros: Muestra mensajes específicos indicando qué campo tiene un tipo incorrecto
        -Prevención de errores: Evita excepciones no manejadas causadas por tipos inesperados
        -Coherencia: Mantiene un enfoque consistente con la validación que ya implementaste en el endpoint POST
*/
        // Validación básica: todos los campos deben estar presentes
        if (
            !updated ||
            !updated.year ||
            !updated.autonomous_community ||
            updated.number_of_accidents === undefined ||
            updated.percentage_of_large_fires === undefined
        ) {
            return res.status(400).json({ error: "Faltan campos obligatorios o están mal definidos" });
        }

        // Validar tipos de datos
        if (typeof updated.autonomous_community !== 'string') {
            return res.status(400).json({ error: "El campo autonomous_community debe ser una cadena de texto" });
        }

        if (typeof updated.year !== 'number' || isNaN(updated.year)) {
            return res.status(400).json({ error: "El campo year debe ser un número" });
        }

        if (typeof updated.number_of_accidents !== 'number' || isNaN(updated.number_of_accidents)) {
            return res.status(400).json({ error: "El campo number_of_accidents debe ser un número" });
        }

        if (typeof updated.percentage_of_large_fires !== 'number' || isNaN(updated.percentage_of_large_fires)) {
            return res.status(400).json({ error: "El campo percentage_of_large_fires debe ser un número" });
        }

        // Comprobar si las claves han sido modificadas (conflicto)
        if (
            parseInt(year) !== updated.year || // No necesitamos parseInt() aquí ya que validamos que es un número
            autonomous_community.toLowerCase() !== updated.autonomous_community.toLowerCase()
        ) {
            return res.status(409).json({ error: "No se puede modificar la clave primaria (año o comunidad)" });
        }

        db.update(
            { year: parseInt(year), autonomous_community: autonomous_community.toLowerCase() },
            { $set: updated },
            {},
            (err, count) => {
                if (err) {
                    return res.status(500).json({ error: "Error interno del servidor" });
                }
                if (count === 0) {
                    res.status(404).json({ error: "Dato no encontrado" });
                } else {
                    res.status(200).json({ message: "Dato actualizado correctamente" });
                }
            }
        );
    });

    // PUT a colección completa (no permitido)
    app.put(BASE_API + "/forest-fires", (req, res) => {
        console.log(`Intento de PUT a /forest-fires (no permitido)`);
        res.status(405).json({ error: "PUT no permitido en el recurso base" });
    });


    // DELETE todos los datos
    app.delete(BASE_API + "/forest-fires", (req, res) => {
        console.log("DELETE request received at /forest-fires");

        db.remove({}, { multi: true }, (err, count) => {
            if (count === 0) {
                res.status(404).json({ error: "No hay datos que eliminar" });
            } else {
                res.status(200).json({ message: `Eliminados ${count} registros` });
            }
        });
    });

    // DELETE por parámetro único (año o comunidad autónoma)
    app.delete(BASE_API + "/forest-fires/:param", (req, res) => {
        console.log("DELETE a /forest-fires/:param");

        const param = req.params.param.toLowerCase();

        db.find({}, (err, data) => {
            if (err) {
                return res.status(500).json({ error: "Error accediendo a la base de datos" });
            }

            if (data.length === 0) {
                return res.status(404).json({
                    error: "No hay datos disponibles para eliminar"
                });
            }

            let deleteQuery;

            if (!isNaN(param)) {
                // Borrar por año
                deleteQuery = { year: parseInt(param) };
            } else {
                // Borrar por comunidad
                deleteQuery = { autonomous_community: param };
            }

            db.remove(deleteQuery, { multi: true }, (err, numRemoved) => {
                if (err) {
                    return res.status(500).json({ error: "Error eliminando los datos" });
                }

                if (numRemoved === 0) {
                    return res.status(404).json({
                        error: "No se encontraron registros para eliminar",
                        message: `No hay registros que coincidan con: ${param}`
                    });
                }

                res.status(200).json({
                    message: `${numRemoved} registro(s) eliminado(s) con éxito para el parámetro '${param}'`
                });
            });
        });
    });

    // DELETE por año y comunidad
    app.delete(BASE_API + "/forest-fires/:year/:autonomous_community", (req, res) => {
        console.log(`DELETE request received at /forest-fires/${req.params.year}/${req.params.autonomous_community}`);

        const { year, autonomous_community } = req.params;

        db.remove({ year: parseInt(year), autonomous_community: autonomous_community.toLowerCase() }, {}, (err, count) => {
            if (count === 0) {
                res.status(404).json({ error: "Dato no encontrado" });
            } else {
                res.status(200).json({ message: "Dato eliminado correctamente" });
            }
        });
    });

    // Ruta catch-all para DELETE malformados en /forest-fires
    app.delete(BASE_API + "/forest-fires/:year/:autonomous_community/:extra", (req, res) => {
        return res.status(400).json({
            error: "Demasiados parámetros. Usa solo /:year/:autonomous_community"
        });
    });



}

