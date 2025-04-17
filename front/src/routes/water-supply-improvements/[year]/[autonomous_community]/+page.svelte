<script lang="ts">
    import { onMount } from "svelte";
    import { dev } from "$app/environment";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation"; // SvelteKit navigation
    import "bootstrap/dist/css/bootstrap.min.css";
  
    let year = "";
    let autonomousCommunity = "";
    let amount = "";
    let benefitedPopulation = "";
    let projectCount = "";
    let message = "";
    let c = "";
    let isLoading = false;
  
    const API = dev
      ? "http://localhost:16078/api/v1/water-supply-improvements"
      : "/api/v1/water-supply-improvements";
  
    onMount(async () => {
      year = $page.params.year;
      autonomousCommunity = $page.params.autonomous_community;
      await fetchData();
    });
  
    async function fetchData() {
      try {
        const res = await fetch(
          `${API}/${year}/${encodeURIComponent(autonomousCommunity)}`
        );
  
        if (!res.ok) {
          const data = await res.json();
          message = data.error || "Error al obtener los datos.";
          c = "danger";
          return;
        }
  
        const data = await res.json();
        amount = data.amount;
        benefitedPopulation = data.benefited_population;
        projectCount = data.project_count;
      } catch (err) {
        console.error("Error al cargar los datos:", err);
        message = "Error de conexión al cargar los datos.";
        c = "danger";
      }
    }
  
    async function updateData() {
      isLoading = true;
      message = "";
      c = "";
  
      const parsedYear = parseInt(year, 10);
      if (isNaN(parsedYear)) {
        message = "Año inválido.";
        c = "danger";
        isLoading = false;
        return;
      }
  
      try {
        const res = await fetch(
          `${API}/${parsedYear}/${encodeURIComponent(autonomousCommunity)}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              year: parsedYear,
              autonomous_community: autonomousCommunity,
              amount: Number(amount),
              benefited_population: Number(benefitedPopulation),
              project_count: Number(projectCount),
            }),
          }
        );
  
        let data: any = {};
        try {
          data = await res.json();
        } catch {
          // No hay cuerpo JSON
        }
  
        if (res.ok) {
          message = data.message || "Recurso actualizado correctamente.";
          c = "success";
          await goto("/water-supply-improvements");
        } else {
          message = data.error || `Error al actualizar: ${res.status}`;
          c = "danger";
        }
      } catch (err) {
        console.error("Error al actualizar:", err);
        message = "Error inesperado al conectar con la API.";
        c = "danger";
      } finally {
        isLoading = false;
      }
    }
  
    async function deleteData() {
      try {
        const res = await fetch(
          `${API}/${year}/${encodeURIComponent(autonomousCommunity)}`,
          {
            method: "DELETE",
          }
        );
  
        const data = await res.json();
  
        if (res.ok) {
          message = data.message || "Recurso eliminado correctamente.";
          c = "success";
          await goto("/water-supply-improvements");
        } else {
          message = data.error || "Error al eliminar el recurso.";
          c = "danger";
        }
      } catch (err) {
        console.error("Error al eliminar:", err);
        message = "Error de conexión al eliminar el recurso.";
        c = "danger";
      }
    }
  </script>
  
  <main class="container my-4">
    {#if message}
      <div class={`alert alert-${c}`} role="alert">{message}</div>
    {/if}
  
    <h1><u>Modificar datos de Abastecimiento de Agua</u></h1>
  
    <form on:submit|preventDefault={updateData}>
      <div class="form-group">
        <label for="amount">Cantidad (€)</label>
        <input id="amount" class="form-control" type="text" bind:value={amount} />
      </div>
      <div class="form-group">
        <label for="benefitedPopulation">Población Beneficiada</label>
        <input id="benefitedPopulation" class="form-control" type="text" bind:value={benefitedPopulation} />
      </div>
      <div class="form-group">
        <label for="projectCount">Proyectos</label>
        <input id="projectCount" class="form-control" type="text" bind:value={projectCount} />
      </div>
  
      <button type="submit" class="btn btn-info" disabled={isLoading}>
        {isLoading ? "Actualizando..." : "Actualizar"}
      </button>
      <button type="button" class="btn btn-danger" on:click={deleteData}>
        Eliminar
      </button>
    </form>
  
    <br />
    <button class="btn btn-success" on:click={() => goto("/water-supply-improvements")}>
      Volver
    </button>
  </main>
  
  <style>
    h1 {
      font-weight: bold;
    }
  </style>
  