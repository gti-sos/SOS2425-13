<script>
  // @ts-nocheck
  import { onMount, tick } from 'svelte';
  import * as Highcharts from 'highcharts';
  import { dev } from '$app/environment';

  let DEVEL_HOST = 'http://localhost:16078';
  let PRODUCTION_HOST = 'https://sos2425-13.onrender.com';

  let API = '/api/v2/national-parks';
  if (dev) {
    API = DEVEL_HOST + API;
  } else {
    API = PRODUCTION_HOST + API;
  }

  let parks = [];
  let treemapEl;
  let treemapChart;
  
  const colorPalette = [
    '#7cb5ec', '#434348', '#90ed7d', '#f7a35c',
    '#8085e9', '#f15c80', '#e4d354', '#84e1d7',
    '#8d4653', '#91e8e1', '#2b908f', '#f45b5b',
    '#91e8e1', '#4572A7', '#AA4643', '#89A54E'
  ];
  
  async function fetchData() {
    try {
      const resp = await fetch(API);
      if (!resp.ok) {
        console.error('Error al cargar datos:', await resp.text());
        return;
      }
      parks = await resp.json();
      console.log(`Cargados ${parks.length} parques nacionales`);
    } catch (error) {
      console.error('Error en fetchData:', error);
    }
  }
  
  function initTreemap() {
    if (!parks || parks.length === 0) {
      console.error('No hay datos para mostrar');
      return;
    }
    
    // Agrupar parques por comunidad autónoma
    const communitiesMap = {};
    parks.forEach(park => {
      if (!communitiesMap[park.autonomous_community]) {
        communitiesMap[park.autonomous_community] = [];
      }
      communitiesMap[park.autonomous_community].push(park);
    });
    
    // Crear datos para el treemap
    const treemapData = Object.entries(communitiesMap).map(([community, parksInCommunity], idx) => {
      return {
        id: `id_${community.replace(/\s+/g, '_')}`,
        name: community,
        color: colorPalette[idx % colorPalette.length],
        children: parksInCommunity.map(park => ({
          name: park.national_park,
          value: park.current_area, // Tamaño basado en área actual
          colorValue: park.declaration_date, // Color basado en año de declaración
          declaration_date: park.declaration_date,
          initial_area: park.initial_area,
          current_area: park.current_area,
          growth: ((park.current_area - park.initial_area) / park.initial_area * 100).toFixed(1)
        }))
      };
    });
    
    // Configuración mejorada del treemap
    const treemapOptions = {
      chart: {
        type: 'treemap',
        renderTo: treemapEl,
        height: 700 // Más altura para el único gráfico
      },
      title: {
        text: 'Distribución de Parques Nacionales por Comunidad Autónoma'
      },
      subtitle: {
        text: 'Tamaño: Área Actual (ha) | Color: Antigüedad (años más claros = más recientes)'
      },
      colorAxis: {
        minColor: '#EEEEFF',
        maxColor: '#000077',
        reversed: true
      },
      legend: {
        align: 'right',
        layout: 'vertical',
        verticalAlign: 'middle'
      },
      tooltip: {
        useHTML: true,
        formatter: function() {
          const point = this.point;
          if (point.isLeaf) {
            const growthText = point.growth > 0 
              ? `<span style="color:green">+${point.growth}%</span>` 
              : (point.growth < 0 
                ? `<span style="color:red">${point.growth}%</span>` 
                : `<span>0%</span>`);
            
            return `<div style="max-width:250px">
              <h4 style="margin:0">${point.name}</h4>
              <hr style="margin:3px 0"/>
              <b>Año de declaración:</b> ${point.declaration_date}<br/>
              <b>Área inicial:</b> ${Highcharts.numberFormat(point.initial_area, 0)} ha<br/>
              <b>Área actual:</b> ${Highcharts.numberFormat(point.current_area, 0)} ha<br/>
              <b>Cambio:</b> ${growthText}
            </div>`;
          } else {
            return `<b>${point.name}</b><br>
              <b>Número de parques:</b> ${point.children.length}<br>
              <b>Área total:</b> ${Highcharts.numberFormat(point.value, 0)} ha`;
          }
        }
      },
      series: [{
        type: 'treemap',
        layoutAlgorithm: 'squarified',
        allowTraversingTree: true, // Permite navegar dentro del árbol
        data: treemapData,
        levels: [{
          level: 1,
          borderWidth: 3,
          dataLabels: {
            enabled: true,
            style: {
              fontSize: '16px',
              fontWeight: 'bold',
              textOutline: '1px contrast'
            }
          }
        }, {
          level: 2,
          borderWidth: 1,
          dataLabels: {
            enabled: true,
            style: {
              fontSize: '12px',
              textOutline: '1px contrast'
            }
          }
        }]
      }]
    };
    
    treemapChart = new Highcharts.Chart(treemapOptions);
  }
  
  onMount(async () => {
    try {
      // Cargar módulo treemap
      const treemapModule = await import('highcharts/modules/treemap');
      if (treemapModule.default) {
        treemapModule.default(Highcharts);
      } else {
        console.error('No se pudo cargar el módulo treemap');
      }
      
      // Cargar módulo exporting para exportar gráficos
      const exportingModule = await import('highcharts/modules/exporting');
      if (exportingModule.default) {
        exportingModule.default(Highcharts);
      } else {
        console.error('No se pudo cargar el módulo exporting');
      }
    } catch (error) {
      console.error('Error al cargar módulos de Highcharts:', error);
    }
    
    await fetchData();
    await tick();
    
    if (parks.length) {
      initTreemap();
    }
  });
</script>

<main>
  <h2>Visualización de Parques Nacionales de España</h2>
  
  <div class="button-group">
    <a href="/national-parks">
      <button>Volver a Parques Nacionales</button>
    </a>
  </div>
  
  {#if parks.length}
    <div class="chart-container">
      <div bind:this={treemapEl} class="chart-box"></div>
    </div>
  {:else}
    <p class="loading">Cargando datos de parques nacionales...</p>
  {/if}
</main>

<style>
  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }
  
  h2 {
    text-align: center;
    margin: 2rem 0;
    color: #2c3e50;
  }
  
  .button-group {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  .button-group button {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    cursor: pointer;
    border: none;
    border-radius: 4px;
    background-color: #a8c686;
    color: #000;
    transition: background-color 0.3s;
  }
  
  .button-group button:hover {
    background-color: #8ab061;
  }
  
  .chart-container {
    margin: 0 auto;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  
  .chart-box {
    width: 100%;
    height: 700px;
  }
  
  .loading {
    text-align: center;
    font-size: 1.2rem;
    color: #666;
    padding: 2rem;
  }
</style>
