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


//Calcular la media por comunidad autónoma (autonomous_community)
function calcularMediaPorComunidad(comunidad) {
    let datosFiltradosPorComunidadAutonoma = datosD.filter(x => x.comunidad === comunidad);
    let cantidadTotal = datosFiltradosPorComunidadAutonoma.reduce((acc, d) => acc + d.current_area, 0);
    let media = cantidadTotal / datosFiltradosPorComunidadAutonoma.length;
    return media.toFixed(2);
}


log("\n MEDIA DE TODAS LAS ÁREAS DE PARQUES NATURALES POR COMUNIDAD AUTÓNOMA \n");
["andalucia","aragon","asturias","baleares","canarias","cantabria","castilla y leon","castilla-La mancha","catalunia","valencia","extremadura","galicia","madrid","murcia","pais vasco"].forEach(comunidad => {
    log(`Media de current_area en ${comunidad}: ${calcularMediaPorComunidad(comunidad)}`);
});




