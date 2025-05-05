<script lang="ts">
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';
  
    interface Traffic {
      year: number;
      autonomous_community: string;
      vehicles_without_mot: number;
    }
  
    interface Water {
      year: number;
      autonomous_community: string;
      project_count: number;
    }
  
    let trafficData: Traffic[] = [];
    let waterData: Water[] = [];
    let communities: string[] = [];
  
    let chart: Chart;
    let canvasEl: HTMLCanvasElement;
  
    // Fechas predeterminadas para el rango
    let startDate: string = '2022-01-01';
    let endDate: string = '2023-12-31';
  
    // Normalización de nombres para asegurar consistencia
    function normalizeName(s: string) {
      return s
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ñ/g, 'n');
    }
  
    // Función para obtener los datos de las APIs
    async function fetchAll() {
      const [trafficRes, waterRes] = await Promise.all([
        fetch('/api/v1/traffic-accidents'),
        fetch('/api/v1/water-supply-improvements')
      ]);
  
      const traffic = await trafficRes.json() as Traffic[];
      const water = await waterRes.json() as Water[];
  
      // Normalizar los datos y preparar las comunidades
      trafficData = traffic.map(t => ({
        ...t,
        autonomous_community: normalizeName(t.autonomous_community)
      }));
  
      waterData = water.map(w => ({
        ...w,
        autonomous_community: normalizeName(w.autonomous_community)
      }));
  
      // Identificar todas las comunidades autónomas
      const commSet = new Set<string>();
      trafficData.forEach(t => commSet.add(t.autonomous_community));
      waterData.forEach(w => commSet.add(w.autonomous_community));
      communities = Array.from(commSet).sort();
    }
  
    // Inicializar el gráfico
    function initChart() {
      chart = new Chart(canvasEl, {
        type: 'bar',
        data: {
          labels: communities,
          datasets: [
            {
              label: 'Proyectos de Agua',
              backgroundColor: '#7cb5ec',
              data: []
            },
            {
              label: 'Vehículos sin MOT',
              backgroundColor: '#f15c80',
              data: []
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Proyectos de Agua vs Vehículos sin MOT por Comunidad Autónoma',
              font: { size: 18 }
            },
            legend: {
              labels: { font: { size: 12 } }
            }
          },
          scales: {
            x: {
              title: { display: true, text: 'Comunidad Autónoma', font: { size: 14 } },
              ticks: { font: { size: 12 } }
            },
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Valor acumulado', font: { size: 14 } },
              ticks: { font: { size: 12 } }
            }
          }
        }
      });
    }
  
    // Actualizar el gráfico
    function updateChart() {
      const waterTotals = communities.map(c =>
        waterData.reduce((sum, w) => {
          if (w.autonomous_community === c && w.year >= parseInt(startDate.split('-')[0]) && w.year <= parseInt(endDate.split('-')[0])) {
            return sum + w.project_count;
          }
          return sum;
        }, 0)
      );
  
      const vehicleTotals = communities.map(c =>
        trafficData.reduce((sum, t) => {
          if (t.autonomous_community === c && t.year >= parseInt(startDate.split('-')[0]) && t.year <= parseInt(endDate.split('-')[0])) {
            return sum + t.vehicles_without_mot;
          }
          return sum;
        }, 0)
      );
  
      chart.data.datasets[0].data = waterTotals;
      chart.data.datasets[1].data = vehicleTotals;
      chart.update();
    }
  
    onMount(async () => {
      await fetchAll();
      initChart();
      updateChart();
    });
  </script>
  
  <main>
    <h2 style="text-align:center; font-weight:bold;">
      Proyectos de Agua vs Vehículos sin MOT por Comunidad Autónoma
    </h2>
    <canvas
      bind:this={canvasEl}
      style="display:block; margin:0 auto; width:75%; height:350px;"
    ></canvas>
  
   

  
    <!-- Selección de Rango de Fechas -->
    <div style="text-align:center; margin-top: 1rem;">
      <label>Desde:
        <input type="date" bind:value={startDate} />
      </label>
      <label>Hasta:
        <input type="date" bind:value={endDate} />
      </label>
      <button on:click={updateChart} style="padding: 0.5rem 1rem; background-color: #a8c686; border: none; border-radius: 8px; cursor: pointer;">
        Actualizar Gráfico
      </button>
    </div>
  </main>
  
  <style>
    main {
      font-family: sans-serif;
      margin: 20px auto;
      max-width: 900px;
    }
  </style>
  