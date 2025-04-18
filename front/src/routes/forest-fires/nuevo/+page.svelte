<script>
    import { goto } from '$app/navigation';
  
    let year = '';
    let autonomous_community = '';
    let number_of_accidents = '';
    let percentage_of_large_fires = '';
    let mensaje = '';
    let error = '';
  
    const crearIncendio = async () => {
      mensaje = '';
      error = '';
  
      // Validación básica
      if (!year || !autonomous_community || !number_of_accidents || !percentage_of_large_fires) {
        error = '⚠️ Todos los campos son obligatorios.';
        return;
      }
  
    const porcentaje = Number(percentage_of_large_fires);
    if (porcentaje < 0 || porcentaje > 1) {
      error = '⚠️ El porcentaje debe estar entre 0 y 1.';
      return;
    }
  
  
      try {
        const res = await fetch('/api/v1/forest-fires', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            year: parseInt(year),
            autonomous_community: autonomous_community.trim().toLowerCase(),
            number_of_accidents: parseInt(number_of_accidents),
            percentage_of_large_fires: parseFloat(percentage_of_large_fires)
          })
        });
  
        const data = await res.json();
  
        if (res.status === 201) {
          mensaje = '✅ Recurso creado correctamente.';
          error = '';
          setTimeout(() => goto('/'), 1000);
        } else if (res.status === 409) {
          error = '❌ Ya existe un incendio registrado con esos datos.';
        } else if (res.status === 400) {
          error = '❌ Por favor, completa todos los campos obligatorios correctamente.';
        } else {
          error = '❌ No se pudo crear el recurso. Inténtalo más tarde.';
        }
      } catch (err) {
        console.error(err);
        error = '❌ Error de conexión con el servidor.';
      }
    };
  </script>
  
  <h1>➕ Añadir nuevo incendio forestal</h1>
  
  {#if mensaje}
    <div style="color: green; margin-bottom: 1rem;">{mensaje}</div>
  {/if}
  {#if error}
    <div style="color: red; margin-bottom: 1rem;">{error}</div>
  {/if}
  
  <form on:submit|preventDefault={crearIncendio}>
    <label for="year">Año:</label>
    <input id="year" type="number" bind:value={year} required />
  
    <label for="comunidad">Comunidad Autónoma:</label>
    <input id="comunidad" type="text" bind:value={autonomous_community} required />
  
    <label for="accidentes">Número de accidentes:</label>
    <input id="accidentes" type="number" bind:value={number_of_accidents} min="0" required />
  
    <label for="porcentaje">Porcentaje de grandes incendios (0 a 1):</label>
    <input
      id="porcentaje"
      type="number"
      step="0.01"
      min="0"
      max="1"
      bind:value={percentage_of_large_fires}
      required
    />
  
    <div style="margin-top: 1rem;">
      <button type="submit">✅ Crear recurso</button>
      <button type="button" on:click={() => goto('/')}>❌ Cancelar</button>
    </div>
  </form>
  
  <style>
    form {
      display: flex;
      flex-direction: column;
      max-width: 400px;
      gap: 0.5rem;
      padding: 1rem;
      border: 1px solid #ccc;
      border-radius: 8px;
      background: #f9f9f9;
    }
  
    input {
      padding: 0.4rem;
      font-size: 1rem;
    }
  
    button {
      padding: 0.5rem 1rem;
      margin-right: 0.5rem;
      font-size: 1rem;
      cursor: pointer;
    }
  </style>
  