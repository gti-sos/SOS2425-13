<script lang="ts">
    // Sección actualmente visible: 'blanca', 'dario' o 'alvaro'
    let visibleSection: string | null = null;
  
    function toggleVisibility(section: string) {
      // Si es la misma sección, la cerramos, si no, la abrimos
      visibleSection = visibleSection === section ? null : section;
    }
  </script>
  
  <main>
    <h2>Gráficos por miembro</h2>
    <div class="grid-container">
      <!-- Gráficos Blanca -->
      <div class="interactive-box {visibleSection === 'blanca' ? 'expanded' : ''}">
        <button on:click={() => toggleVisibility('blanca')}>Gráficos Blanca</button>
        {#if visibleSection === 'blanca'}
          <div class="content">
            <a href="/graficos/watter-supply-improvements">Ver gráficos Blanca</a>
          </div>
        {/if}
      </div>
  
      <!-- Gráficos Darío -->
      <div class="interactive-box {visibleSection === 'dario' ? 'expanded' : ''}">
        <button on:click={() => toggleVisibility('dario')}>Gráficos Darío</button>
        {#if visibleSection === 'dario'}
          <div class="content">
            <a href="/graficos/national-parks">Ver gráficos Darío</a>
          </div>
        {/if}
      </div>
  
      <!-- Gráficos Álvaro -->
      <div class="interactive-box {visibleSection === 'alvaro' ? 'expanded' : ''}">
        <button on:click={() => toggleVisibility('alvaro')}>Gráficos Álvaro</button>
        {#if visibleSection === 'alvaro'}
          <div class="content">
            <a href="/graficos/forest-fires">Ver gráficos Álvaro</a>
          </div>
        {/if}
      </div>
    </div>
  </main>
  
  <style>
    main {
      margin: 20px;
      color: #000;
    }
    h2 {
      font-size: 24px;
      margin-bottom: 20px;
    }
    .grid-container {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    .interactive-box {
      background-color: #e0e4cc;
      border-radius: 12px;
      overflow: hidden;
      transition: max-height 0.3s ease;
      max-height: 50px;
      text-align: center;
    }
    .interactive-box.expanded {
      max-height: 200px;
    }
    button {
      background-color: #a8c686;
      color: #000;
      font-size: 16px;
      padding: 10px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      width: 100%;
    }
    button:hover {
      background-color: #9bb37c;
    }
    .content {
      padding: 10px;
    }
    .content a {
      color: #000;
      text-decoration: underline;
      font-size: 16px;
    }
  </style>
  