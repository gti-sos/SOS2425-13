//Funcion que imprime por consola
function log(m) {
    console.log(m);
}

//Declaracion del array
let myArray = [15, 15, 9, 19, 8, 6, 17, 50, 10, 0];

//Operacion de reduccion y media
let sumaGrandesIncendios = myArray.reduce( (acumulador, numero) => { return acumulador + numero; }, 0);
let mediaGrandesIncendios = sumaGrandesIncendios / myArray.length;


//Usar JSON para imprimir el array
log("Imprimiendo el array: " +JSON.stringify(myArray, null,2));

//Imprimiendo la media
log("Imprimiendo media de los Grandes Incendios en España: " +mediaGrandesIncendios);