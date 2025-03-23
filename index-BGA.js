// Función que imprime por consola
function log(m) {
    console.log(m);
}

// Declaración del array con los datos
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


module.exports = datosB;

/*

// Función para calcular la media del amount por comunidad y año
function calcularMediaProyectos(comunidad) {
    let datosFiltrados = datosB.filter(d => d.comunidad === comunidad);
    let totalAmount = datosFiltrados.reduce((acc, d) => acc + d.project_count, 0);
    let media = totalAmount / datosFiltrados.length;
    return media.toFixed(2);
}



log("\n MEDIA DE PROYECTOS POR COMUNIDAD \n");
["andalucia","aragon","asturias","baleares","canarias","cantabria","castilla y leon","castilla-La mancha","catalunia","valencia","extremadura","galicia","madrid","murcia","pais vasco"].forEach(comunidad => {
    log(`Media de project_count en ${comunidad}: ${calcularMediaProyectos(comunidad)}`);
});

*/

function calcularMediaProyectos(autonomous_community) {
    let datosFiltrados = datosB.filter(d => d.autonomous_community === autonomous_community);
    
    // Comprobar si hay datos filtrados
    if (datosFiltrados.length === 0) {
        return "No hay datos disponibles para esta comunidad";
    }

    // Calcular la suma de project_count solo si es un número válido
    let totalAmount = datosFiltrados.reduce((acc, d) => {
        if (typeof d.project_count === 'number' && !isNaN(d.project_count)) {
            return acc + d.project_count;
        } else {
            console.log(`Valor no válido para project_count en ${autonomous_community}:`, d.project_count);
            return acc;
        }
    }, 0);

    // Calcular la media
    let media = totalAmount / datosFiltrados.length;
    return media.toFixed(2);


    
}

log("\n MEDIA DE PROYECTOS POR COMUNIDAD \n");
["andalucia","aragon","asturias","baleares","canarias","cantabria","castilla y leon","castilla-La mancha","catalunia","valencia","extremadura","galicia","madrid","murcia","pais vasco"].forEach(comunidad => {
    log(`Media de project_count en ${comunidad}: ${calcularMediaProyectos(comunidad)}`);
});
