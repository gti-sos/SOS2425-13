<script>
  // @ts-nocheck
  import { onMount } from 'svelte';
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
  let chartContainer;
  
  const colorPalette = [
    '#7cb5ec', '#434348', '#90ed7d', '#f7a35c',
    '#8085e9', '#f15c80', '#e4d354', '#84e1d7',
    '#8d4653', '#91e8e1', '#2b908f', '#f45b5b'
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
  
  function initChart() {
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
    
    // Preparar datos para el gráfico
    const communities = Object.keys(communitiesMap);
    const series = [];
    
    // Serie para área inicial
    const initialAreaData = communities.map(community => {
      const parksInCommunity = communitiesMap[community];
      return {
        name: community,
        y: parksInCommunity.reduce((sum, park) => sum + park.initial_area, 0),
        color: colorPalette[communities.indexOf(community) % colorPalette.length],
        parksCount: parksInCommunity.length,
        parks: parksInCommunity.map(p => ({
          name: p.national_park,
          year: p.declaration_date,
          initial: p.initial_area,
          current: p.current_area
        }))
      };
    });
    
    // Serie para área actual
    const currentAreaData = communities.map(community => {
      const parksInCommunity = communitiesMap[community];
      return {
        name: community,
        y: parksInCommunity.reduce((sum, park) => sum + park.current_area, 0),
        color: colorPalette[communities.indexOf(community) % colorPalette.length],
        parksCount: parksInCommunity.length,
        parks: parksInCommunity.map(p => ({
          name: p.national_park,
          year: p.declaration_date,
          initial: p.initial_area,
          current: p.current_area
        }))
      };
    });
    
    // Crear gráfico de columnas
    Highcharts.chart(chartContainer, {
      chart: {
        type: 'column',
        height: 700
      },
      title: {
        text: 'Áreas de Parques Nacionales por Comunidad Autónoma'
      },
      subtitle: {
        text: 'Comparativa entre áreas iniciales y actuales'
      },
      xAxis: {
        categories: communities,
        crosshair: true,
        labels: {
          rotation: -45,
          style: {
            fontSize: '12px'
          }
        }
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Área (hectáreas)'
        }
      },
      tooltip: {
        useHTML: true,
        formatter: function() {
          const point = this.point;
          const seriesName = this.series.name;
          let tooltip = `<div style="max-width:300px">
            <h4 style="margin:0">${point.name}</h4>
            <hr style="margin:3px 0"/>
            <b>${seriesName}:</b> ${Highcharts.numberFormat(point.y, 0)} ha<br/>
            <b>Número de parques:</b> ${point.parksCount}<br/><br/>
            <b>Parques en esta comunidad:</b><br/>`;
          
          point.parks.forEach(park => {
            tooltip += `• ${park.name} (${park.year}): ${Highcharts.numberFormat(seriesName === 'Área Inicial' ? park.initial : park.current, 0)} ha<br/>`;
          });
          
          tooltip += '</div>';
          return tooltip;
        }
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0,
          grouping: true
        }
      },
      series: [{
        name: 'Área Inicial',
        data: initialAreaData
      }, {
        name: 'Área Actual',
        data: currentAreaData
      }]
    });
  }
  
  onMount(async () => {
    await fetchData();
    
    if (parks.length) {
      setTimeout(() => {
        console.log("Inicializando gráfico...");
        initChart();
      }, 100);
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
  
  <div class="chart-container">
    <div bind:this={chartContainer} class="chart-box"></div>
  </div>
  
  {#if parks.length === 0}
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
