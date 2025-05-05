<script lang="ts">
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';
  
    interface Water {
      year: number;
      autonomous_community: string;
      project_count: number;
    }
  
    interface Traffic {
      year: number;
      autonomous_community: string;
      vehicles_without_mot: number;
    }
  
    let waterData: Water[] = [];
    let trafficData: Traffic[] = [];
    let communities: string[] = [];
  
    let chart: Chart;
    let canvasEl: HTMLCanvasElement;
  
    // Normalización de nombres
    function normalizeName(s: string) {
      return s
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ñ/g, 'n');
    }
  
    // Función para cargar los datos de ambas APIs
    async function fetchAll() {
      const [waterRes, trafficRes] = await Promise.all([
        fetch('/api/v1/water-supply-improvements'),
        fetch('https://sos2425-20.onrender.com/api/v1/traffic-accidents')
      ]);
  
      const waterJson = await waterRes.json();
      const trafficJson = await trafficRes.json();
  
      // Normalizamos los datos
      waterData = waterJson.map((w: Water) => ({
        ...w,
        autonomous_community: normalizeName(w.autonomous_community)
      }));
  
      trafficData = trafficJson.map((t: Traffic) => ({
        ...t,
        autonomous_community: normalizeName(t.autonomous_community)
      }));
  
      const commSet = new Set<string>();
      waterData.forEach(w => commSet.add(w.autonomous_community));
      trafficData.forEach(t => commSet.add(t.autonomous_community));
  
      communities = Array.from(commSet).sort();
    }
  
    // Inicializa el gráfico de líneas
    function initChart() {
      chart = new Chart(canvasEl, {
        type: 'line',
        data: {
          labels: communities,
          datasets: [
            {
              label: 'Proyectos de Agua',
              backgroundColor: '#7cb5ec',
              borderColor: '#7cb5ec',
              data: [],
              fill: false
            },
            {
              label: 'Vehículos sin MOT',
              backgroundColor: '#f15c80',
              borderColor: '#f15c80',
              data: [],
              fill: false
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
  
    // Actualiza el gráfico con los datos sumados por comunidad
    function updateChart() {
      const waterTotals = communities.map(c =>
        waterData.reduce((sum, w) => {
          if (w.autonomous_community === c) {
            return sum + w.project_count;
          }
          return sum;
        }, 0)
      );
  
      const vehicleTotals = communities.map(c =>
        trafficData.reduce((sum, t) => {
          if (t.autonomous_community === c) {
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
  
  
  </main>
  
  <style>
    main {
      font-family: sans-serif;
      margin: 20px auto;
      max-width: 900px;
    }
  </style>
  