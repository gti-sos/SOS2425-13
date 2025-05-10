<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  let svg: SVGSVGElement;
  let totalHomes = 0;
  let projectCount = 0;
  let errorMsg: string | null = null;

  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  function renderChart() {
    const data = [
      { label: 'Viviendas en venta', value: totalHomes },
      { label: 'Proyectos mejora de agua', value: projectCount }
    ];

    // Clear any existing content
    d3.select(svg).selectAll('*').remove();

    const g = d3.select(svg)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand<string>()
      .domain(data.map(d => d.label))
      .range([0, width])
      .padding(0.2);
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d: { value: number }) => d.value) ?? 0])
      .nice()
      .range([height, 0]);

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-40)')
      .style('text-anchor', 'end');

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y));

    // Bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: { label: string }) => x(d.label)!)
      .attr('y', (d: { value: number }) => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', (d: { value: number }) => height - y(d.value));
  }

  onMount(async () => {
    try {
      // Fetch total de viviendas en Madrid
      const homesRes = await fetch(`/api/v1/proxy/idealista-madrid-homes`);
      if (!homesRes.ok) throw new Error(`Homes API: ${homesRes.status} ${homesRes.statusText}`);
      const homesJson = await homesRes.json();
      totalHomes = homesJson.totalResults ?? homesJson.total ?? 0;

      // Fetch proyectos de mejora de agua en Madrid
      const projectsRes = await fetch(
        `/api/v1/water-supply-improvements?autonomous_community=madrid`
      );
      if (!projectsRes.ok) throw new Error(`Projects API: ${projectsRes.status} ${projectsRes.statusText}`);
      const projectsJson = await projectsRes.json();
      projectCount = Array.isArray(projectsJson)
        ? projectsJson.reduce((sum, item) => sum + (item.project_count ?? 0), 0)
        : 0;

      // Render D3 chart
      renderChart();
    } catch (err: any) {
      errorMsg = err.message;
      console.error(err);
    }
  });
</script>

<main class="p-4">
  <h1 class="text-2xl font-bold mb-4">Estadísticas de Madrid</h1>

  {#if errorMsg}
    <p class="text-red-600">Error: {errorMsg}</p>
  {:else}
    <svg bind:this={svg}></svg>
  {/if}
</main>

<style>
  .bar {
    fill: steelblue;
  }
</style>
