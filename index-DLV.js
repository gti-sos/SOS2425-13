//Funcion que imprime por consola
function log(m) {
    console.log(m);
}

//Declaracion del array
const datosD = [
    { national_park: "Teide", declaration_date: 1954, autonomous_community: "Canarias", initial_area: 13571, current_area: 18990 },
    { national_park: "Cabañeros", declaration_date: 1995, autonomous_community: "Castilla-La Mancha", initial_area: 3984, current_area: 3984 },
    { national_park: "Doñana", declaration_date: 1957, autonomous_community: "Andalucía", initial_area: 54252, current_area: 74279 },
    { national_park: "Garajonay", declaration_date: 1981, autonomous_community: "Canarias", initial_area: 3984, current_area: 3984 },
    { national_park: "Picos de Europa", declaration_date: 1918, autonomous_community: "Asturias, Cantabria, Castilla y León", initial_area: 17000, current_area: 67455 },
    { national_park: "Tablas de Daimiel", declaration_date: 1973, autonomous_community: "Castilla-La Mancha", initial_area: 1928, current_area: 5410 },
    { national_park: "Caldera de Taburiente", declaration_date: 1954, autonomous_community: "Canarias", initial_area: 4690, current_area: 5956 },
    { national_park: "Ordesa y Monte Perdido", declaration_date: 1916, autonomous_community: "Aragón", initial_area: 2100, current_area: 15608 },
    { national_park: "Aiguas Tortas y Lago de San Mauricio", declaration_date: 1955, autonomous_community: "Cataluña", initial_area: 10230, current_area: 14119 },
    { national_park: "Archipiélago de Cabrera", declaration_date: 1991, autonomous_community: "Baleares", initial_area: 10021, current_area: 10021 },
  
];


//Funcion para calcular la extensión promedio de todos los parques naturales por comunidad autónoma
function mediaParquesPorComunidad (){
    let mapDeComunidades = {};
    datosD.forEach(d => {
        /*si no existe la comunidad en el mapa, la creamos con sus valores a 0
            total: acumulado de todas las areas de todos los parques de esa comunidad 'd'
            count: numero de parques de esa comunidad 'd'
        */
        if (!mapDeComunidades[d.autonomous_community]) {
            mapDeComunidades[d.autonomous_community] = { total: 0, count: 0 };
        }
        /*Si ya ha aparecido esa comunidad autónoma en el map, actualizamos los valores
         total: suma de las areas anteriores y la nueva que viene
         count: incrementamos en 1 el contador de parques de esa comunidad
        */
         mapDeComunidades[d.autonomous_community].total += d.current_area;
         mapDeComunidades[d.autonomous_community].count += 1;
    });
    let mediaPorComunidad = Object.keys(mapDeComunidades).map(comunidad => ({
        comunidad: comunidad,
        media_current_area: (mapDeComunidades[comunidad].total / mapDeComunidades[comunidad].count).toFixed(2)
    }));
    return mediaPorComunidad;
}

//Funcion para calcular la extensión promedio de los parques naturales de una comunidad autónoma específica en un año en particular
function mediaParquesPorComunidadYAnio(comunidad, year){
    let datosFiltrados = datosD.filter(d => d.autonomous_community === comunidad && d.declaration_date === year);
    let totalArea = datosFiltrados.reduce((acc, d) => acc + d.current_area, 0);
    let media = totalArea / datosFiltrados.length;
    return media.toFixed(2);
}


// Calcular e imprimir la media por comunidad
let medias = mediaParquesPorComunidad();
log("\n MEDIA DE TODAS LAS ÁREAS DE LOS PARQUES NATURALES POR COMUNIDAD AUTÓNOMA \n");
medias.forEach(m =>  {
    log(`Media de todas las áreas de todos los parques naturales en ${m.comunidad}: ${m.media_current_area}`);
});

// Calcular e imprimir la media por comunidad y año
log("\n MEDIA DE TODAS LAS ÁREAS DE LOS PARQUES NATURALES DE UNA COMUNIDAD AUTÓNOMA EN UN AÑO EN PARTICULAR \n");
["Canarias","Castilla-La Mancha","Andalucía","Asturias, Cantabria, Castilla y León","Aragón","Cataluña","Baleares"].forEach(comunidad => {
    log(`Media de todas las áreas de los parques naturales en ${comunidad} en 1954: ${mediaParquesPorComunidadYAnio(comunidad, 1954)}`);
});





