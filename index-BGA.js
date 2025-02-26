// Función que imprime por consola
function log(m) {
    console.log(m);
}

// Declaración del array con los datos
const datos = [
    { year: 2015, comunidad: "Andalucía", amount: 12604168, project_count: 45 },
    { year: 2015, comunidad: "Aragón", amount: 5494284, project_count: 18 },
    { year: 2015, comunidad: "Asturias", amount: 2319946, project_count: 8 },
    { year: 2015, comunidad: "Baleares", amount: 2658926, project_count: 10 },
    { year: 2015, comunidad: "Canarias", amount: 5743835, project_count: 22 },
    { year: 2015, comunidad: "Cantabria", amount: 5447744, project_count: 20 },
    { year: 2015, comunidad: "Castilla y León", amount: 7984325, project_count: 30 },
    { year: 2015, comunidad: "Castilla-La Mancha", amount: 10880000, project_count: 40 },
    { year: 2015, comunidad: "Cataluña", amount: 10075812, project_count: 38 },
    { year: 2015, comunidad: "C. Valenciana", amount: 7017390, project_count: 27 },
    { year: 2015, comunidad: "Extremadura", amount: 8591952, project_count: 32 },
    { year: 2015, comunidad: "Galicia", amount: 6799527, project_count: 25 },
    { year: 2015, comunidad: "Comunidad de Madrid", amount: 2901139, project_count: 11 },
    { year: 2015, comunidad: "Murcia", amount: 2082060, project_count: 9 },
    { year: 2015, comunidad: "País Vasco", amount: 3153155, project_count: 14 },

    { year: 2016, comunidad: "Andalucía", amount: 12646637, project_count: 50 },
    { year: 2016, comunidad: "Aragón", amount: 5528413, project_count: 19 },
    { year: 2016, comunidad: "Asturias", amount: 2336099, project_count: 9 },
    { year: 2016, comunidad: "Baleares", amount: 2663141, project_count: 12 },
    { year: 2016, comunidad: "Canarias", amount: 5654386, project_count: 24 },
    { year: 2016, comunidad: "Cantabria", amount: 5528871, project_count: 22 },
    { year: 2016, comunidad: "Castilla y León", amount: 8039214, project_count: 33 },
    { year: 2016, comunidad: "Castilla-La Mancha", amount: 10693386, project_count: 42 },
    { year: 2016, comunidad: "Cataluña", amount: 9888014, project_count: 40 },
    { year: 2016, comunidad: "C. Valenciana", amount: 7092068, project_count: 28 },
    { year: 2016, comunidad: "Extremadura", amount: 8583097, project_count: 34 },
    { year: 2016, comunidad: "Galicia", amount: 6684255, project_count: 27 },
    { year: 2016, comunidad: "Comunidad de Madrid", amount: 2889852, project_count: 12 },
    { year: 2016, comunidad: "Murcia", amount: 2054142, project_count: 10 },
    { year: 2016, comunidad: "País Vasco", amount: 3169746, project_count: 16 },

    { year: 2017, comunidad: "Andalucía", amount: 12670092, project_count: 55 },
    { year: 2017, comunidad: "Aragón", amount: 5411728, project_count: 20 },
    { year: 2017, comunidad: "Asturias", amount: 2299811, project_count: 10 },
    { year: 2017, comunidad: "Baleares", amount: 2654119, project_count: 13 },
    { year: 2017, comunidad: "Canarias", amount: 5807226, project_count: 26 },
    { year: 2017, comunidad: "Cantabria", amount: 5479462, project_count: 24 },
    { year: 2017, comunidad: "Castilla y León", amount: 7874978, project_count: 36 },
    { year: 2017, comunidad: "Castilla-La Mancha", amount: 10947818, project_count: 45 },
    { year: 2017, comunidad: "Cataluña", amount: 9922517, project_count: 42 },
    { year: 2017, comunidad: "C. Valenciana", amount: 7002918, project_count: 30 },
    { year: 2017, comunidad: "Extremadura", amount: 8664820, project_count: 36 },
    { year: 2017, comunidad: "Galicia", amount: 6727106, project_count: 29 },
    { year: 2017, comunidad: "Comunidad de Madrid", amount: 2923797, project_count: 13 },
    { year: 2017, comunidad: "Murcia", amount: 2045301, project_count: 11 },
    { year: 2017, comunidad: "País Vasco", amount: 3194418, project_count: 18 }
];




// Función para calcular la media del amount por comunidad y año
function calcularMediaAmount(year) {
    let datosFiltrados = datos.filter(d => d.year === year);
    let totalAmount = datosFiltrados.reduce((acc, d) => acc + d.amount, 0);
    let media = totalAmount / datosFiltrados.length;
    return media.toFixed(2);
}


// Calcular e imprimir la media por año
log("\n MEDIA DE CANTIDAD DE AGUA POR AÑO \n");
[2015, 2016, 2017].forEach(year => {
    log(`Media del amount en ${year}: ${calcularMediaAmount(year)}`);
});