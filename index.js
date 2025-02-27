const express = require("express");
const cool = require("cool-ascii-faces");
const app = express();
const PORT = process.env.PORT || 16078;

app.use(express.static("public"));


app.get("/", (req, res) => {
    res.send(`
        <h1>Bienvenido a la API del Grupo 13</h1>
       
    `);
});

app.get("/about", (req, res) => {
    res.sendFile(__dirname + "/public/about.html");
});

app.get("/cool", (req, res) => {
    res.send(`<h1>${cool()}</h1>`);
});

app.get("/samples/BGA", (req, res) => {
    let resultado = "<h2> MEDIA DE PROYECTOS POR COMUNIDAD</h2>";
    const comunidades= ["andalucia","aragon","asturias","baleares","canarias","cantabria","castilla y leon","castilla-La mancha","catalunia","valencia","extremadura","galicia","madrid","murcia","pais vasco"];
   
    

    comunidades.forEach(comunidad => {
        resultado  += `<p> <h4>Media de project_count en ${comunidad}:</h4> ${calcularMediaProyectos(comunidad)} </p>`;
    });

    res.send(resultado);
});


//PARTE BLANCA GARCÍA ALONSO

const datosB = [
    { year: 2015, comunidad: "andalucia", amount: 12604168, project_count: 45 },
    { year: 2015, comunidad: "aragon", amount: 5494284, project_count: 18 },
    { year: 2015, comunidad: "asturias", amount: 2319946, project_count: 8 },
    { year: 2015, comunidad: "baleares", amount: 2658926, project_count: 10 },
    { year: 2015, comunidad: "canarias", amount: 5743835, project_count: 22 },
    { year: 2015, comunidad: "cantabria", amount: 5447744, project_count: 20 },
    { year: 2015, comunidad: "castilla y leon", amount: 7984325, project_count: 30 },
    { year: 2015, comunidad: "castilla-La mancha", amount: 10880000, project_count: 40 },
    { year: 2015, comunidad: "catalunia", amount: 10075812, project_count: 38 },
    { year: 2015, comunidad: "valencia", amount: 7017390, project_count: 27 },
    { year: 2015, comunidad: "extremadura", amount: 8591952, project_count: 32 },
    { year: 2015, comunidad: "galicia", amount: 6799527, project_count: 25 },
    { year: 2015, comunidad: "madrid", amount: 2901139, project_count: 11 },
    { year: 2015, comunidad: "murcia", amount: 2082060, project_count: 9 },
    { year: 2015, comunidad: "pais vasco", amount: 3153155, project_count: 14 },

    { year: 2016, comunidad: "andalucia", amount: 12646637, project_count: 50 },
    { year: 2016, comunidad: "aragon", amount: 5528413, project_count: 19 },
    { year: 2016, comunidad: "asturias", amount: 2336099, project_count: 9 },
    { year: 2016, comunidad: "baleares", amount: 2663141, project_count: 12 },
    { year: 2016, comunidad: "canarias", amount: 5654386, project_count: 24 },
    { year: 2016, comunidad: "cantabria", amount: 5528871, project_count: 22 },
    { year: 2016, comunidad: "castilla y leon", amount: 8039214, project_count: 33 },
    { year: 2016, comunidad: "castilla-La mancha", amount: 10693386, project_count: 42 },
    { year: 2016, comunidad: "catalunia", amount: 9888014, project_count: 40 },
    { year: 2016, comunidad: "valencia", amount: 7092068, project_count: 28 },
    { year: 2016, comunidad: "extremadura", amount: 8583097, project_count: 34 },
    { year: 2016, comunidad: "galicia", amount: 6684255, project_count: 27 },
    { year: 2016, comunidad: "madrid", amount: 2889852, project_count: 12 },
    { year: 2016, comunidad: "murcia", amount: 2054142, project_count: 10 },
    { year: 2016, comunidad: "pais vasco", amount: 3169746, project_count: 16 },

    { year: 2017, comunidad: "andalucia", amount: 12670092, project_count: 55 },
    { year: 2017, comunidad: "aragon", amount: 5411728, project_count: 20 },
    { year: 2017, comunidad: "asturias", amount: 2299811, project_count: 10 },
    { year: 2017, comunidad: "baleares", amount: 2654119, project_count: 13 },
    { year: 2017, comunidad: "canarias", amount: 5807226, project_count: 26 },
    { year: 2017, comunidad: "cantabria", amount: 5479462, project_count: 24 },
    { year: 2017, comunidad: "castilla y leon", amount: 7874978, project_count: 36 },
    { year: 2017, comunidad: "castilla-La mancha", amount: 10947818, project_count: 45 },
    { year: 2017, comunidad: "catalunia", amount: 9922517, project_count: 42 },
    { year: 2017, comunidad: "valencia", amount: 7002918, project_count: 30 },
    { year: 2017, comunidad: "extremadura", amount: 8664820, project_count: 36 },
    { year: 2017, comunidad: "galicia", amount: 6727106, project_count: 29 },
    { year: 2017, comunidad: "madrid", amount: 2923797, project_count: 13 },
    { year: 2017, comunidad: "murcia", amount: 2045301, project_count: 11 },
    { year: 2017, comunidad: "pais vasco", amount: 3194418, project_count: 18 }
];


function calcularMediaProyectos(comunidad) {
    let datosFiltrados = datosB.filter(d => d.comunidad === comunidad);
    let totalAmount = datosFiltrados.reduce((acc, d) => acc + d.project_count, 0);
    let media = totalAmount / datosFiltrados.length;
    return media.toFixed(2);
}

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto :${PORT}`);
});
