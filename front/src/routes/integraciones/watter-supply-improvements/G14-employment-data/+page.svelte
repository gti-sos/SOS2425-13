<script lang="ts">
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';
  
    interface Water {
      autonomous_community: string;
      project_count: number;
    }
  
    interface Employment {
      autonomous_community: string;
      employment_rate: number;
    }
  
    // Mapa canónico de comunidades
    const communityMap: Record<string, string> = {
      'andalucia': 'Andalucía',
      'aragon': 'Aragón',
      'asturias': 'Asturias',
      'baleares': 'Islas Baleares',
      'canarias': 'Canarias',
      'cantabria': 'Cantabria',
      'castilla la mancha': 'Castilla-La Mancha',
      'castilla y leon': 'Castilla y León',
      'cataluna': 'Cataluña',
      'valencia': 'Comunidad Valenciana',
      'comunidad valenciana': 'Comunidad Valenciana',
      'extremadura': 'Extremadura',
      'galicia': 'Galicia',
      'madrid': 'Comunidad de Madrid',
      'murcia': 'Región de Murcia',
      'navarra': 'Navarra',
      'la rioja': 'La Rioja',
      'pais vasco': 'País Vasco',
      'ceuta': 'Ceuta',
      'melilla': 'Melilla'
    };
  
    // Normalización de nombres
    function normalize(s: string): string {
      const norm = s.trim().toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/-/g, ' ')
        .replace(/ñ/g, 'n');
      for (const key in communityMap) {
        if (norm.includes(key)) return communityMap[key];
      }
      return s.charAt(0).toUpperCase() + s.slice(1);
    }
  
    let waterData: Water[] = [];
    let employmentData: Employment[] = [];
    let chart: Chart;
    let canvasEl: HTMLCanvasElement;
  
    async function fetchWater() {
      const res = await fetch('/api/v1/water-supply-improvements');
      const json = await res.json();
      waterData = json.map((w: any) => ({
        autonomous_community: normalize(w.autonomous_community || w.aacc || w.region),
        project_count: w.project_count
      }));
    }
  
    async function fetchEmployment() {
      const res = await fetch('https://sos2425-14.onrender.com/api/v1/employment-data');
      const json = await res.json();
      employmentData = json.map((e: any) => ({
        autonomous_community: normalize(e.autonomous_community || e.aacc),
        employment_rate: e.employment_rate
      }));
    }
  
    function initChart() {
      const communities = Array.from(
        new Set([
          ...waterData.map(w => w.autonomous_community),
          ...employmentData.map(e => e.autonomous_community)
        ])
      ).sort((a, b) => a.localeCompare(b, 'es'));
  
      const projectCounts = communities.map(c =>
        waterData.find(w => w.autonomous_community === c)?.project_count || 0
      );
      const employmentRates = communities.map(c =>
        employmentData.find(e => e.autonomous_community === c)?.employment_rate || 0
      );
  
      chart = new Chart(canvasEl, {
        type: 'radar',
        data: {
          labels: communities,
          datasets: [
            {
              label: 'Proyectos de Agua',
              data: projectCounts,
              backgroundColor: 'rgba(66, 165, 245, 0.4)',
              borderColor: '#42a5f5',
              borderWidth: 2,
              fill: true
            },
            {
              label: 'Employment Rate (%)',
              data: employmentRates,
              backgroundColor: 'rgba(255, 99, 132, 0.4)',
              borderColor: '#ff6384',
              borderWidth: 2,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Radar: Proyectos de Agua vs Employment Rate'
            },
            legend: {
              position: 'bottom'
            }
          },
          scales: {
            r: {
              angleLines: { display: true },
              suggestedMin: 0,
              suggestedMax: Math.max(...projectCounts, ...employmentRates) * 1.1,
             
            }
          }
        }
      });
    }
  
    onMount(async () => {
      await Promise.all([fetchWater(), fetchEmployment()]);
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
      <a href="/integraciones/watter-supply-improvements/G20-traffic-accidents"
        ><button
          style="margin:4px; padding:8px 12px; background-color:#a8c686; color:#000; border:none; border-radius:4px; cursor:pointer;"
          >G20-traffic-accidents</button
        ></a
      >
      <a href="/integraciones/watter-supply-improvements/G21-cultural-event"
        ><button
          style="margin:4px; padding:8px 12px; background-color:#a8c686; color:#000; border:none; border-radius:4px; cursor:pointer;"
          >G21-cultural-event</button
        ></a
      >
    </div>
    <h2 style="text-align:center;">Radar: Proyectos de Agua vs Employment Rate</h2>
    <canvas bind:this={canvasEl} style="max-width:80%; margin:20px auto; display:block; height:400px;"></canvas>

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
  