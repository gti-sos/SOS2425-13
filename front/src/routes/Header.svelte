<svelte:head>
     <title>SOS2425-13</title>
</svelte:head>
<main>
     <nav>
         <div class="container">
             <a id="inicio" href="/">Inicio</a>
             <a id="about" href="/about.html">Acerca de</a> <!-- Enlace al archivo estático 'about.html' -->
         </div>
     </nav>
</main>

<style>
     #inicio {
         margin-top: 15px;
     }   

     #about {
         margin-top: 15px; /* Espaciado similar al de 'inicio' */
     }

     a {
         color : rgb(16, 16, 17);
         text-decoration: none;
         font-size: 21px;
         padding-top: 20px;
         margin-left: 10px;
         text-align: center; 
     }

     main {
         margin-top: 20px;
         position: relative;
         height: 200px;
     }

     .container {
         width: 1200px;
         height: 200px;
         display: grid;
         grid-template-rows: 50% 50%;
         grid-template-columns: 20% 20% 20% 20% 20%;
     }
</style>