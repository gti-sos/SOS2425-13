<script>
    // @ts-nocheck
    import { onMount } from 'svelte';
    import { dev } from '$app/environment';
    import * as Highcharts from 'highcharts';
    
    // Variables para almacenar datos
    let spanishParks = [];
    let weatherForecasts = {};
    let processedForecasts = {};
    let loading = true;
    let error = null;
    let chartContainer;

    // Mapeo de códigos de CCAA a nombres completos (ampliado)
    const ccaaMapping = {
        'and': 'Andalucía',
        'arn': 'Aragón',
        'ast': 'Asturias',
        'bal': 'Illes Balears',
        'bal': 'Baleares',
        'bal': 'Islas Baleares',
        'coo': 'Canarias',
        'coo': 'Islas Canarias',
        'can': 'Cantabria',
        'cle': 'Castilla y León',
        'clm': 'Castilla - La Mancha',
        'clm': 'Castilla-La Mancha',
        'cat': 'Cataluña',
        'val': 'Comunitat Valenciana',
        'val': 'Comunidad Valenciana',
        'ext': 'Extremadura',
        'gal': 'Galicia',
        'mad': 'Comunidad de Madrid',
        'mad': 'Madrid',
        'mur': 'Región de Murcia',
        'mur': 'Murcia',
        'nav': 'Comunidad Foral de Navarra',
        'nav': 'Navarra',
        'pva': 'País Vasco',
        'rio': 'La Rioja',
        'rio': 'Rioja'
    };

    // Mapeo inverso para convertir nombres completos a códigos
    const reverseCcaaMapping = {
        'andalucía': 'and',
        'aragón': 'arn',
        'asturias': 'ast',
        'illes balears': 'bal',
        'baleares': 'bal',
        'islas baleares': 'bal',
        'canarias': 'coo',
        'islas canarias': 'coo',
        'cantabria': 'can',
        'castilla y león': 'cle',
        'castilla - la mancha': 'clm',
        'castilla-la mancha': 'clm',
        'cataluña': 'cat',
        'comunitat valenciana': 'val',
        'comunidad valenciana': 'val',
        'extremadura': 'ext',
        'galicia': 'gal',
        'comunidad de madrid': 'mad',
        'madrid': 'mad',
        'región de murcia': 'mur',
        'murcia': 'mur',
        'comunidad foral de navarra': 'nav',
        'navarra': 'nav',
        'país vasco': 'pva',
        'la rioja': 'rio',
        'rioja': 'rio'
    };

    // URLs para las APIs
    const PARKS_API = dev
        ? 'http://localhost:16078/api/v2/national-parks'
        : 'https://sos2425-13.onrender.com/api/v2/national-parks';
    const AEMET_API = dev
        ? 'http://localhost:16078/api/v2/proxy/aemet'
        : 'https://sos2425-13.onrender.com/api/v2/proxy/aemet';

    // Función para obtener datos de parques españoles
    async function fetchSpanishParks() {
        try {
            const response = await fetch(PARKS_API);
            if (!response.ok) {
                throw new Error(`Error obteniendo parques españoles: ${response.status}`);
            }
            const data = await response.json();
            console.log('Datos de parques españoles:', data);
            spanishParks = data;
        } catch (err) {
            console.error('Error al cargar datos de parques españoles:', err);
            error = err.message;
        }
    }

    // Función para obtener predicciones meteorológicas de AEMET para una CCAA
    async function fetchWeatherForecast(ccaa) {
        try {
            // Ahora el proxy maneja ambas peticiones
            const response = await fetch(`${AEMET_API}/prediccion/ccaa/hoy/${ccaa}`);
            
            if (!response.ok) {
                throw new Error(`Error obteniendo predicción para ${ccaa}: ${response.status}`);
            }
            
            // Los datos ya vienen procesados por el proxy
            const forecastData = await response.json();
            console.log(`Datos meteorológicos para ${ccaa}:`, forecastData);
            
            // Guardamos los datos
            weatherForecasts[ccaa] = forecastData;
            
            // Procesamos la información para simplificarla
            processWeatherData(ccaa, forecastData);
            
        } catch (err) {
            console.error(`Error al cargar predicción para ${ccaa}:`, err);
            error = error || err.message;
        }
    }

    // Función para procesar y simplificar los datos meteorológicos
    function processWeatherData(ccaa, forecastData) {
        try {
            // AEMET devuelve un array con un único objeto que contiene la predicción
            if (!forecastData || forecastData.length === 0) {
                console.warn(`No hay datos para ${ccaa}`);
                return;
            }
            
            const forecast = forecastData[0];
            
            // Extraemos información relevante
            processedForecasts[ccaa] = {
                fecha: forecast.fecha,
                prediccion: forecast.prediccion || 'No disponible',
                temperaturas: {
                    min: extractTemperature(forecast.prediccion, 'mínima'),
                    max: extractTemperature(forecast.prediccion, 'máxima')
                },
                precipitation: extractPrecipitationProbability(forecast.prediccion)
            };
            
            console.log(`Datos procesados para ${ccaa}:`, processedForecasts[ccaa]);
        } catch (err) {
            console.error(`Error procesando datos para ${ccaa}:`, err);
        }
    }

    // Función auxiliar para extraer temperatura de la predicción textual
    function extractTemperature(text, type) {
        if (!text) return null;
        
        // Buscamos patrones como "temperaturas mínimas de 10" o "máximas de 25 grados"
        const regex = new RegExp(`temperatura[s]? ${type}[s]? (?:de |entre |)([0-9]+)`, 'i');
        const match = text.match(regex);
        
        return match ? parseInt(match[1]) : null;
    }

    // Función auxiliar para extraer probabilidad de precipitación
    function extractPrecipitationProbability(text) {
        if (!text) return 0;
        
        if (text.match(/sin precipitaciones|sin lluvia/i)) {
            return 0;
        }
        if (text.match(/probabilidad (?:de precipitación |)(?:muy |)baja/i)) {
            return 20;
        }
        if (text.match(/probabilidad (?:de precipitación |)(?:medio |media |)baja/i)) {
            return 30;
        }
        if (text.match(/probabilidad (?:de precipitación |)media/i)) {
            return 50;
        }
        if (text.match(/probabilidad (?:de precipitación |)alta/i)) {
            return 70;
        }
        if (text.match(/precipitaciones|lluvias|chubascos/i)) {
            return 60;
        }
        
        return 0;
    }

    // Función para obtener código AEMET de una comunidad autónoma
    function getCcaaCode(autonomousCommunity) {
        if (!autonomousCommunity) return null;
        
        // Si hay múltiples comunidades separadas por comas, devolvemos el código de la primera
        if (autonomousCommunity.includes(',')) {
            const firstCommunity = autonomousCommunity.split(',')[0].trim();
            return reverseCcaaMapping[firstCommunity.toLowerCase()] || null;
        }
        
        return reverseCcaaMapping[autonomousCommunity.toLowerCase()] || null;
    }

    // Función para obtener las comunidades autónomas únicas con parques
    function getUniqueCcaaWithParks() {
        const uniqueCcaaSet = new Set();
        
        spanishParks.forEach(park => {
            if (park.autonomous_community) {
                // Si hay múltiples comunidades, las procesamos por separado
                const communities = park.autonomous_community.split(',').map(c => c.trim());
                
                communities.forEach(community => {
                    uniqueCcaaSet.add(community);
                });
            }
        });
        
        return Array.from(uniqueCcaaSet);
    }

    // Función para obtener parques en una comunidad específica
    function getParksInCommunity(community) {
        return spanishParks.filter(park => {
            if (!park.autonomous_community) return false;
            
            const communities = park.autonomous_community.split(',').map(c => c.trim());
            return communities.includes(community);
        });
    }

    // Inicializar al montar el componente
    onMount(async () => {
        loading = true;
        try {
            // Primero obtenemos los parques
            await fetchSpanishParks();
            
            // Obtenemos las CCAA únicas con parques
            const uniqueCcaaList = getUniqueCcaaWithParks();
            
            // Para cada CCAA, obtenemos su predicción meteorológica
            const fetchPromises = [];
            uniqueCcaaList.forEach(ccaa => {
                const ccaaCode = getCcaaCode(ccaa);
                if (ccaaCode) {
                    fetchPromises.push(fetchWeatherForecast(ccaaCode));
                } else {
                    console.warn(`No se pudo encontrar código para: ${ccaa}`);
                }
            });
            
            // Esperamos que todas las peticiones terminen
            if (fetchPromises.length > 0) {
                await Promise.all(fetchPromises);
            } else {
                console.warn("No se encontraron comunidades autónomas para consultar");
            }
            
            loading = false;
            
            // Inicializar gráfico cuando los datos estén disponibles
            setTimeout(initChart, 100);
        } catch (err) {
            loading = false;
            error = err.message;
            console.error('Error general:', err);
        }
    });

    // Función para inicializar el gráfico usando Highcharts
    function initChart() {
        if (!chartContainer) return;
        
        // Obtenemos las CCAA únicas con parques
        const uniqueCcaaList = getUniqueCcaaWithParks();
        
        // Preparamos los datos para el gráfico
        const seriesData = [];
        
        uniqueCcaaList.forEach(ccaa => {
            const ccaaCode = getCcaaCode(ccaa);
            if (ccaaCode && processedForecasts[ccaaCode]) {
                // Contamos cuántos parques hay en esta CCAA
                const parksCount = getParksInCommunity(ccaa).length;
                
                // Obtenemos datos meteorológicos
                const forecast = processedForecasts[ccaaCode];
                
                // Añadimos punto al gráfico
                seriesData.push({
                    name: ccaa,
                    temp_max: forecast.temperaturas.max || 0,
                    temp_min: forecast.temperaturas.min || 0,
                    precipitation: forecast.precipitation || 0,
                    parks: parksCount
                });
            }
        });
        
        // Crear gráfico de tipo SCATTER (que no está en la lista de prohibidos)
        Highcharts.chart(chartContainer, {
            chart: {
                type: 'scatter',
                zoomType: 'xy'
            },
            title: {
                text: 'Relación entre Parques Nacionales y Predicción Meteorológica',
                align: 'center'
            },
            subtitle: {
                text: 'Temperatura máxima y probabilidad de precipitación por comunidad autónoma',
                align: 'center'
            },
            xAxis: {
                title: {
                    text: 'Temperatura Máxima (°C)'
                }
            },
            yAxis: {
                title: {
                    text: 'Probabilidad de Precipitación (%)'
                }
            },
            plotOptions: {
                scatter: {
                    marker: {
                        radius: 5,
                        states: {
                            hover: {
                                enabled: true,
                                lineColor: 'rgb(100,100,100)'
                            }
                        }
                    },
                    tooltip: {
                        headerFormat: '<b>{point.key}</b><br>',
                        pointFormat: '{point.parks} parque(s)<br>Temperatura: {point.x}°C<br>Precipitación: {point.y}%'
                    }
                }
            },
            series: [{
                name: 'Comunidades Autónomas',
                color: 'rgba(58, 150, 71, 0.8)',
                data: seriesData.map(item => ({
                    x: item.temp_max,
                    y: item.precipitation,
                    parks: item.parks,
                    name: item.name,
                    key: item.name,
                    marker: {
                        radius: 4 + (item.parks / 2), // Tamaño proporcional a número de parques
                        fillColor: `rgba(58, 150, 71, ${0.3 + (item.parks / 12)})`
                    }
                }))
            }]
        });
    }
</script>

<main>
    <h2>Integración con AEMET</h2>

    <div class="button-group">
        <a href="/graficos/national-parks">
            <button>Volver a Parques Nacionales</button>
        </a>
    </div>

    {#if loading}
        <div class="loading-container">
            <div class="loading">Cargando datos meteorológicos y de parques...</div>
        </div>
    {:else if error}
        <div class="error-container">
            <div class="error">Error: {error}</div>
        </div>
    {:else}
        <div class="explanation">
            <p>
                Esta visualización muestra la relación entre el número de parques nacionales en cada comunidad autónoma
                y su predicción meteorológica de hoy según AEMET. El tamaño de cada punto representa el número de 
                parques nacionales en esa comunidad.
            </p>
        </div>

        <div class="chart-container" bind:this={chartContainer}>
            <!-- El gráfico se renderizará aquí -->
        </div>

        <div class="weather-summary">
            <h3>Resumen meteorológico por comunidad autónoma con parques nacionales</h3>
            <div class="summary-table-container">
                <table class="summary-table">
                    <thead>
                        <tr>
                            <th>Comunidad Autónoma</th>
                            <th>Parques</th>
                            <th>Temp. Máx</th>
                            <th>Temp. Mín</th>
                            <th>Prob. Precipitación</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each getUniqueCcaaWithParks() as ccaa}
                            {@const ccaaCode = getCcaaCode(ccaa)}
                            {@const parksCount = getParksInCommunity(ccaa).length}
                            {@const forecast = ccaaCode && processedForecasts[ccaaCode] ? processedForecasts[ccaaCode] : null}
                            <tr>
                                <td>{ccaa}</td>
                                <td>{parksCount}</td>
                                <td>{forecast?.temperaturas?.max !== null ? `${forecast.temperaturas.max}°C` : 'N/D'}</td>
                                <td>{forecast?.temperaturas?.min !== null ? `${forecast.temperaturas.min}°C` : 'N/D'}</td>
                                <td>{forecast?.precipitation !== null ? `${forecast.precipitation}%` : 'N/D'}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="data-sources">
            <h4>Fuentes de datos:</h4>
            <ul>
                <li>Parques Nacionales: <a href="https://sos2425-13.onrender.com/api/v2/national-parks" target="_blank">API del Grupo 13 (SOS2425-13)</a></li>
                <li>Predicciones Meteorológicas: <a href="https://opendata.aemet.es/" target="_blank">AEMET OpenData</a></li>
            </ul>
        </div>
    {/if}
</main>

<style>
    main {
        max-width: 1000px;
        margin: 0 auto;
        padding: 20px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        box-sizing: border-box;
        width: 100%;
        overflow-x: hidden;
    }

    h2 {
        color: #2c5e2e;
        text-align: center;
        margin-bottom: 1.2rem;
        font-size: 1.8rem;
    }

    .button-group {
        display: flex;
        justify-content: center;
        margin-bottom: 25px;
    }

    .button-group button {
        padding: 10px 18px;
        background-color: #3a9647;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s ease;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }

    .button-group button:hover {
        background-color: #2e7639;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .explanation {
        background-color: #f7fbf7;
        padding: 20px;
        border-radius: 10px;
        border-left: 5px solid #3a9647;
        margin-bottom: 30px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
    }

    .chart-container {
        height: 450px;
        margin: 30px 0;
        background-color: white;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        padding: 20px;
        overflow: hidden;
        max-width: 100%;
    }

    .loading-container,
    .error-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 300px;
    }

    .loading {
        font-size: 18px;
        color: #3a9647;
    }

    .error {
        font-size: 18px;
        color: #e74c3c;
        text-align: center;
        padding: 20px;
    }

    .weather-summary {
        background-color: #f9f9f9;
        border-radius: 8px;
        padding: 20px;
        margin: 30px 0;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    .weather-summary h3 {
        color: #2c5e2e;
        text-align: center;
        margin-bottom: 20px;
    }

    .summary-table-container {
        overflow-x: auto;
    }

    .summary-table {
        width: 100%;
        border-collapse: collapse;
        margin: 0 auto;
    }

    .summary-table th,
    .summary-table td {
        padding: 10px;
        text-align: center;
        border: 1px solid #ddd;
    }

    .summary-table th {
        background-color: #f2f9f2;
        color: #2c5e2e;
        font-weight: 600;
    }

    .summary-table tr:nth-child(odd) {
        background-color: #f9f9f9;
    }

    .summary-table tr:hover {
        background-color: #edf7ed;
    }

    .data-sources {
        background-color: #f5f5f5;
        padding: 20px;
        border-radius: 8px;
        margin: 30px 0;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .data-sources h4 {
        margin-top: 0;
        color: #2c5e2e;
        border-bottom: 2px solid #ddd;
        padding-bottom: 10px;
        margin-bottom: 15px;
    }

    .data-sources ul {
        list-style-type: none;
        padding-left: 0;
    }

    .data-sources li {
        margin-bottom: 10px;
        padding-left: 20px;
        position: relative;
    }

    .data-sources li:before {
        content: "•";
        color: #3a9647;
        font-weight: bold;
        position: absolute;
        left: 0;
    }

    .data-sources a {
        color: #0066cc;
        text-decoration: none;
    }

    .data-sources a:hover {
        text-decoration: underline;
    }

    /* Estilos para Highcharts */
    :global(.highcharts-container) {
        width: 100% !important;
        height: 100% !important;
    }

    :global(.highcharts-root) {
        width: 100% !important;
        height: 100% !important;
    }
</style>