// Función que imprime por consola
function log(m) {
    console.log(m);
}

// Declaración del array con los datos
const datosAlvaro = [
    { year: 2006, comunidad: "Andalucía", number_of_accidents: 8034, percentage_of_large_fires: 0.19 },
    { year: 2006, comunidad: "Aragón", number_of_accidents: 3877, percentage_of_large_fires: 0.39 },
    { year: 2006, comunidad: "Asturias", number_of_accidents: 17003, percentage_of_large_fires: 0.05 },
    { year: 2006, comunidad: "Comunidad Valenciana", number_of_accidents: 3982, percentage_of_large_fires: 0.48 },
    { year: 2006, comunidad: "Canarias", number_of_accidents: 1113, percentage_of_large_fires: 0.72 },
    { year: 2006, comunidad: "Cantabria", number_of_accidents: 6316, percentage_of_large_fires: 0.09 },
    { year: 2006, comunidad: "Castilla La Mancha", number_of_accidents: 7864, percentage_of_large_fires: 0.22 },
    { year: 2006, comunidad: "Castilla y León", number_of_accidents: 18343, percentage_of_large_firest: 0.27 },
    { year: 2006, comunidad: "Cataluña", number_of_accidents: 5756, percentage_of_large_fires: 0.17 },
    { year: 2006, comunidad: "Ceuta", number_of_accidents: 5, percentage_of_large_fires: 0 },
    { year: 2006, comunidad: "Madrid", number_of_accidents: 4390, percentage_of_large_fires: 0.28 },

    { year: 2016, comunidad: "Andalucía", number_of_accidents: 8347, percentage_of_large_fires: 0.17 },
    { year: 2016, comunidad: "Aragón", number_of_accidents: 3567, percentage_of_large_firest: 0.37 },
    { year: 2016, comunidad: "Asturias", number_of_accidents: 16200, percentage_of_large_fires: 0.04 },
    { year: 2016, comunidad: "Comunidad Valenciana", number_of_accidents: 3802, percentage_of_large_fires: 0.46},
    { year: 2016, comunidad: "Canarias", number_of_accidents: 1056, percentage_of_large_fires: 0.7 },
    { year: 2016, comunidad: "Cantabria", number_of_accidents: 6269, percentage_of_large_firest: 0.09 },
    { year: 2016, comunidad: "Castilla La Mancha", number_of_accidents: 7390, percentage_of_large_fires: 0.2 },
    { year: 2016, comunidad: "Castilla y León", number_of_accidents: 19100, percentage_of_large_fires: 0.23 },
    { year: 2016, comunidad: "Cataluña", number_of_accidents: 5345, percentage_of_large_fires: 0.17 },
    { year: 2016, comunidad: "Ceuta", number_of_accidents: 4, percentage_of_large_fires: 0 },
    { year: 2016, comunidad: "Madrid", number_of_accidents: 4909, percentage_of_large_fires: 0.3 },

];

module.exports = datosAlvaro;

// Función para calcular la media de numero de incendios por comunidad (sin distinguir por año)
function calcularMediaPorComunidad() {
    let comunidadMap = {};

    datosAlvaro.forEach(d => {
        if (!comunidadMap[d.comunidad]) {
            comunidadMap[d.comunidad] = { total: 0, count: 0 };
        }
        comunidadMap[d.comunidad].total += d.number_of_accidents;
        comunidadMap[d.comunidad].count += 1;
    });

    let mediaPorComunidad = Object.keys(comunidadMap).map(comunidad => ({
        comunidad: comunidad,
        media_number_of_accidents: (comunidadMap[comunidad].total / comunidadMap[comunidad].count).toFixed(2)
    }));

    return mediaPorComunidad;
}


// Función para calcular la media de numero de incendios por comunidad y año
function calcularMediaNumberOfAccidents(year) {
    let datosFiltrados = datos.filter(d => d.year === year);
    let totalNumberOfAccidents = datosFiltrados.reduce((acc, d) => acc + d.number_of_accidents, 0);
    let media = totalNumberOfAccidents / datosFiltrados.length;
    return media.toFixed(2);
}


// Calcular e imprimir la media por comunidad
let medias = calcularMediaPorComunidad();
log("\n MEDIA DE CANTIDAD DE NUMERO DE ACCIDENTES FORESTALES POR COMUNIDAD AUTÓNOMA \n");
medias.forEach(m =>  {
    log(`Media de numero de accidentes en ${m.comunidad}: ${m.media_number_of_accidents}`);
});


// Calcular e imprimir la media por año
log("\n MEDIA DE NUMERO DE ACCIDENTES FORESTALES POR AÑO \n");
[2006, 2016].forEach(year => {
    log(`Media de numero de accidentes forestales en ${year}: ${calcularMediaNumberOfAccidents(year)}`);
});