//Funcion que imprime por consola
function log(m) {
    console.log(m);
}

//Declaracion del array
let myArray = [1954, 1954, 1918, 1916, 1955, 1957, 1973, 1981, 1991, 1995];

//Operacion de reduccion y media
let sumaFechas = myArray.reduce( (acumulador, numero) => { return acumulador + numero; }, 0);
let mediaFechas = sumaFechas / myArray.length;


//Usar JSON para imprimir el array
log("Imprimiendo el array: " +JSON.stringify(myArray, null,2));

//Imprimiendo la media
log("Imprimiendo media de las fechas: " +mediaFechas);





