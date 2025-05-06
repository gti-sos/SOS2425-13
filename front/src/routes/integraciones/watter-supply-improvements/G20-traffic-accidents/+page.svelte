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
    function normalizeName(s: string): string {
      return s.trim().toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ñ/g, 'n');
    }
    
    // Carga y normalización de datos
    async function fetchAll() {
      const [waterRes, trafficRes] = await Promise.all([
        fetch('/api/v1/water-supply-improvements'),
        fetch('https://sos2425-20.onrender.com/api/v1/traffic-accidents')
      ]);
      const waterJson: Water[] = await waterRes.json();
      const trafficJson: Traffic[] = await trafficRes.json();
    
      waterData = waterJson.map(w => ({
        year: w.year,
        autonomous_community: normalizeName(w.autonomous_community),
        project_count: w.project_count
      }));
      trafficData = trafficJson.map(t => ({
        year: t.year,
        autonomous_community: normalizeName(t.autonomous_community),
        vehicles_without_mot: t.vehicles_without_mot
      }));
    
      const set = new Set<string>();
      waterData.forEach(w => set.add(w.autonomous_community));
      trafficData.forEach(t => set.add(t.autonomous_community));
      communities = Array.from(set).sort();
    }
    
    // Inicializa gráfico de burbujas
    function initChart() {
      const projectTotals = communities.map(c =>
        waterData.reduce((sum, w) => w.autonomous_community === c ? sum + w.project_count : sum, 0)
      );
      const vehicleTotals = communities.map(c =>
        trafficData.reduce((sum, t) => t.autonomous_community === c ? sum + t.vehicles_without_mot : sum, 0)
      );
    
      const bubbleData = communities.map((c, i) => ({
        x: projectTotals[i],
        y: vehicleTotals[i],
        r: 8,
        label: c
      }));
    
      chart = new Chart(canvasEl, {
        type: 'bubble',
        data: {
          datasets: [{
           
            data: bubbleData,
            backgroundColor: '#a1537b'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Proyectos de Agua vs Vehículos sin MOT'
            },
            legend: {
              position: 'bottom'
            },
            tooltip: {
              callbacks: {
                label: context => {
                  const d = context.raw as { x: number; y: number; r: number; label: string };
                  return `${d.label}: ${d.x} proyectos, ${d.y} vehículos`;
                }
              }
            }
          },
          scales: {
            x: {
              title: { display: true, text: 'Proyectos de Agua' },
              beginAtZero: true
            },
            y: {
              title: { display: true, text: 'Vehículos sin MOT' },
              beginAtZero: true
            }
          }
        }
      });
    }
    
    onMount(async () => {
      await fetchAll();
      initChart();
    });
    </script>
    
    <main>
        <div style="text-align:center; margin-bottom:30px; margin-top:30px;">
            <a href="/integraciones/watter-supply-improvements/G10-accidents-stats"
                ><button
                    style="margin:4px; padding:8px 12px; background-color:#a8c686; color:#000; border:none; border-radius:4px; cursor:pointer;"
                    >G10-accidents-stats</button
                ></a
            >
            <a href="/integraciones/watter-supply-improvements/G12-annual-retributions"
                ><button
                    style="margin:4px; padding:8px 12px; background-color:#a8c686; color:#000; border:none; border-radius:4px; cursor:pointer;"
                    >G12-annual-retributions</button
                ></a
            >
            <a href="/integraciones/watter-supply-improvements/G14-employment-data"
                ><button
                    style="margin:4px; padding:8px 12px; background-color:#a8c686; color:#000; border:none; border-radius:4px; cursor:pointer;"
                    >G14-employment-data</button
                ></a
            >
            <a href="/integraciones/watter-supply-improvements/G21-cultural-event"
                ><button
                    style="margin:4px; padding:8px 12px; background-color:#a8c686; color:#000; border:none; border-radius:4px; cursor:pointer;"
                    >G21-cultural-event</button
                ></a
            >
        </div>
      <h2 style="text-align:center;">Proyectos de Agua vs Vehículos sin MOT</h2>
      <canvas bind:this={canvasEl} style="display:block; margin:20px auto; width:75%; height:400px;"></canvas>
      <button on:click={() => window.location.href = '/graficos/watter-supply-improvements'} style="display:block; margin:20px auto; padding:8px 12px; background-color:#8fc177; color:#000; border:none; border-radius:4px; font-size:14px; cursor:pointer;">
        Volver
      </button>
    </main>
    
    <style>
      main {
        font-family: sans-serif;
        margin: 20px auto;
        max-width: 900px;
      }
    </style>