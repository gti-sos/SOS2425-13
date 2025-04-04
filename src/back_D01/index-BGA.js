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


export function loadBackend(app) {
    // LoadInitialData
    app.get(BASE_API + "/water-supply-improvements/loadInitialData", (req, res) => {
        db.find({}, (err, datosB) => {
            if (datosB.length === 0) {
                db.insert(initialData);
                res.status(200).send({ message: "Datos iniciales cargados correctamente", data: initialData });
            } else {
                res.status(200).send({ message: "Ya existen datos en el array", data: initialData });
            }
        });
    });

    // GET genérico
    app.get(BASE_API + RESOURCE, (req, res) => {
        let query = {};
        let fromYear = req.query.from ? parseInt(req.query.from) : null;
        let toYear = req.query.to ? parseInt(req.query.to) : null;

        for (let key in req.query) {
            if (["from", "to"].includes(key)) continue;
            query[key] = ["year", "amount", "benefited_population", "project_count"].includes(key) ? parseInt(req.query[key]) : req.query[key].toLowerCase();
        }

        if (fromYear !== null) query.year = { $gte: fromYear };
        if (toYear !== null) query.year = Object.assign(query.year || {}, { $lte: toYear });

        db.find(query, (err, data) => {
            if (data.length === 0) {
                res.status(404).send({
                    error: "ERROR 404: No se encontraron mejoras de suministro",
                    message: `No se encontraron datos para las fechas de ${fromYear || 'cualquier'} a ${toYear || 'cualquier'}`
                });
            } else {
                res.status(200).send(data.map(({ _id, ...rest }) => rest));
            }
        });
    });

    // GET específico por año y comunidad
    app.get(BASE_API + RESOURCE + "/:year/:autonomous_community", (req, res) => {
        let year = parseInt(req.params.year);
        let community = req.params.autonomous_community.toLowerCase();
        db.findOne({ year: year, autonomous_community: community }, (err, data) => {
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

    // POST general
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

    // POST a recurso específico
    app.post(BASE_API + RESOURCE + "/:year", (req, res) => {
        res.status(405).send({
            error: "ERROR 405: Métodod no permitido. No se pueden hacer POST a recursos especificos"
        });
    });

    // PUT conjunto
    app.put(BASE_API + RESOURCE, (req, res) => {
        res.status(405).send({
            error: "ERROR 405: No se puede hacer PUT a un conjunto de recursos"
        });
    });

    // PUT específico
    app.put(BASE_API + RESOURCE + "/:year/:autonomous_community", (req, res) => {
        let year = parseInt(req.params.year);
        let community = req.params.autonomous_community.toLowerCase();

        db.update({ year: year, autonomous_community: community }, { $set: req.body }, {}, (err, numReplaced) => {
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

    // DELETE todo
    app.delete(BASE_API + RESOURCE, (req, res) => {
        db.remove({}, { multi: true }, (err, numRemoved) => {
            if(numRemoved === 0){
                res.status(404).send({
                    error: "ERROR 404: No hay mejoras de suministro para eliminar",
                    message: "No hay datos cargados en el sistema"
                });
            } else{
                res.status(200).send({message: "Todas las mejoras de suministro han sido eliminadas correctamente"});
            }
        });
    });

    // DELETE específico por año y comunidad
    app.delete(BASE_API + RESOURCE + "/:year/:autonomous_community", (req, res) => {
        let year = parseInt(req.params.year);
        let community = req.params.autonomous_community.toLowerCase();

        db.remove({ year: year, autonomous_community: community }, {}, (err, numRemoved) => {
            if (numRemoved === 0) {
                res.status(404).send({
                    error: "ERROR 404: Mejoras de suministro no encontradas",
                    message: `No se encontró ninguna mejora de suministro de agua para la comunidad autónoma ${community} en el año ${year}`
                });
            } else {
                res.status(200).send({message: `Mejoras eliminadas correctamente`});
            }
        });
    });

    app.get(BASE_API + RESOURCE +"/docs",(req,res)=>{
        res.redirect("https://documenter.getpostman.com/view/42334859/2sB2cUAhnf");
    });
}


