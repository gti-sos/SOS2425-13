// Función que imprime por consola
function log(m) {
    console.log(m);
}

// Declaración del array con los datos
const datos = [
    { year: 2015, comunidad: "Andalucía", amount: 12604168 },
    { year: 2015, comunidad: "Aragón", amount: 5494284 },
    { year: 2015, comunidad: "Asturias", amount: 2319946 },
    { year: 2015, comunidad: "Baleares", amount: 2658926 },
    { year: 2015, comunidad: "Canarias", amount: 5743835 },
    { year: 2015, comunidad: "Cantabria", amount: 5447744 },
    { year: 2015, comunidad: "Castilla y León", amount: 7984325 },
    { year: 2015, comunidad: "Castilla-La Mancha", amount: 10880000 },
    { year: 2015, comunidad: "Cataluña", amount: 10075812 },
    { year: 2015, comunidad: "C. Valenciana", amount: 7017390 },
    { year: 2015, comunidad: "Extremadura", amount: 8591952 },
    { year: 2015, comunidad: "Galicia", amount: 6799527 },
    { year: 2015, comunidad: "Comunidad de Madrid", amount: 2901139 },
    { year: 2015, comunidad: "Murcia", amount: 2082060 },
    { year: 2015, comunidad: "País Vasco", amount: 3153155 },

    { year: 2016, comunidad: "Andalucía", amount: 12646637 },
    { year: 2016, comunidad: "Aragón", amount: 5528413 },
    { year: 2016, comunidad: "Asturias", amount: 2336099 },
    { year: 2016, comunidad: "Baleares", amount: 2663141 },
    { year: 2016, comunidad: "Canarias", amount: 5654386 },
    { year: 2016, comunidad: "Cantabria", amount: 5528871 },
    { year: 2016, comunidad: "Castilla y León", amount: 8039214 },
    { year: 2016, comunidad: "Castilla-La Mancha", amount: 10693386 },
    { year: 2016, comunidad: "Cataluña", amount: 9888014 },
    { year: 2016, comunidad: "C. Valenciana", amount: 7092068 },
    { year: 2016, comunidad: "Extremadura", amount: 8583097 },
    { year: 2016, comunidad: "Galicia", amount: 6684255 },
    { year: 2016, comunidad: "Comunidad de Madrid", amount: 2889852 },
    { year: 2016, comunidad: "Murcia", amount: 2054142 },
    { year: 2016, comunidad: "País Vasco", amount: 3169746 },

    { year: 2017, comunidad: "Andalucía", amount: 12670092 },
    { year: 2017, comunidad: "Aragón", amount: 5411728 },
    { year: 2017, comunidad: "Asturias", amount: 2299811 },
    { year: 2017, comunidad: "Baleares", amount: 2654119 },
    { year: 2017, comunidad: "Canarias", amount: 5807226 },
    { year: 2017, comunidad: "Cantabria", amount: 5479462 },
    { year: 2017, comunidad: "Castilla y León", amount: 7874978 },
    { year: 2017, comunidad: "Castilla-La Mancha", amount: 10947818 },
    { year: 2017, comunidad: "Cataluña", amount: 9922517 },
    { year: 2017, comunidad: "C. Valenciana", amount: 7002918 },
    { year: 2017, comunidad: "Extremadura", amount: 8664820 },
    { year: 2017, comunidad: "Galicia", amount: 6727106 },
    { year: 2017, comunidad: "Comunidad de Madrid", amount: 2923797 },
    { year: 2017, comunidad: "Murcia", amount: 2045301 },
    { year: 2017, comunidad: "País Vasco", amount: 3194418 }
];

// Función para calcular la media del amount por comunidad (sin distinguir por año)
function calcularMediaPorComunidad() {
    let comunidadMap = {};

    datos.forEach(d => {
        if (!comunidadMap[d.comunidad]) {
            comunidadMap[d.comunidad] = { total: 0, count: 0 };
        }
        comunidadMap[d.comunidad].total += d.amount;
        comunidadMap[d.comunidad].count += 1;
    });

    let mediaPorComunidad = Object.keys(comunidadMap).map(comunidad => ({
        comunidad: comunidad,
        media_amount: (comunidadMap[comunidad].total / comunidadMap[comunidad].count).toFixed(2)
    }));

    return mediaPorComunidad;
}


// Función para calcular la media del amount por comunidad y año
function calcularMediaAmount(year) {
    let datosFiltrados = datos.filter(d => d.year === year);
    let totalAmount = datosFiltrados.reduce((acc, d) => acc + d.amount, 0);
    let media = totalAmount / datosFiltrados.length;
    return media.toFixed(2);
}

// Imprimir los datos
//log("Imprimiendo los datos: " + JSON.stringify(datos, null, 2));

// Calcular e imprimir la media por comunidad
let medias = calcularMediaPorComunidad();
log("\n MEDIA DE CANTIDAD DE AGUA POR COMUNIDAD AUTÓNOMA \n");
medias.forEach(m =>  {
    log(`Media del amount en ${m.comunidad}: ${m.media_amount}`);
});


// Calcular e imprimir la media por año
log("\n MEDIA DE CANTIDAD DE AGUA POR AÑO \n");
[2015, 2016, 2017].forEach(year => {
    log(`Media del amount en ${year}: ${calcularMediaAmount(year)}`);
});