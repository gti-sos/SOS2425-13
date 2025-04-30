<header>
    <div class="header-container">
        <img src="/favicon.ico" alt="Logo" class="logo" />
        <h1 class="project-title">SOS2425-13</h1>
    </div>
    <nav class="navbar">
        <ul>
            <li><a href="/" id="inicio">Inicio</a></li>
            <li><a href="/about.html" id="about">Acerca de nosotros</a></li>
            <li><a href="/forest-fires" id="forest-fires">Incendios forestales</a></li>
            <li><a href="/national-parks" id="national-parks">Parques naturales</a></li>
            <li><a href="/water-supply-improvements" id="water-supply-improvements">Suministro de agua</a></li>
        </ul>
    </nav>
</header>

<style>
    /* Estilos generales del encabezado */
    header {
        background-color: #cac4c4; /* Fondo gris claro */
        color: #333; /* Color de texto oscuro para contraste */
        padding: 20px 40px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.1);
        position: sticky;
        top: 0;
        z-index: 10;
    }

    /* Contenedor para logo y título del proyecto */
    .header-container {
        display: flex;
        align-items: center;
        gap: 15px;
        justify-content: center;
        margin-bottom: 15px;
    }

    /* Estilo para el logo */
    .logo {
        width: 60px;
        height: 60px;
        object-fit: contain;
    }

    /* Título del proyecto con un estilo moderno */
    .project-title {
        font-size: 2.5rem;
        font-weight: 800;
        color: #333; /* Texto oscuro para contraste */
        font-family: 'Roboto', sans-serif;
        letter-spacing: 1px;
        margin-top: 5px;
        text-transform: uppercase;
    }

    /* Estilos para la barra de navegación */
    .navbar ul {
        list-style: none;
        display: flex;
        gap: 30px;
        margin-top: 0;
        padding: 0;
    }

    .navbar li {
        font-size: 1.2rem;
        font-family: 'Segoe UI', sans-serif;
    }

    /* Estilo para los enlaces de la barra de navegación */
    .navbar a {
        color: #333; /* Texto oscuro para los enlaces */
        text-decoration: none;
        font-weight: 600;
        padding: 12px 25px;
        border-radius: 30px;
        background-color: #e0e0e0; /* Fondo gris claro para los botones */
        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); /* Sombra suave */
        transition: background-color 0.3s, transform 0.3s, box-shadow 0.3s;
    }

    /* Efecto de hover para los enlaces */
    .navbar a:hover {
        color: white;
        transform: translateY(-3px); /* Efecto de elevación */
        box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.2); /* Sombra más pronunciada */
    }

    /* Colores específicos para los botones cuando se seleccionan (fondo marcado) */
    .navbar a#inicio:hover {
        background-color: #303F9F; /* Azul oscuro para "Inicio" cuando se selecciona */
       
    }

    .navbar a#about:hover {
        background-color: #754295; /* Morado oscuro para "Acerca de nosotros" cuando se selecciona */
   
    }

    .navbar a#forest-fires:hover {
        background-color: #d32f2f;
    }

    .navbar a#national-parks:hover {
        background-color: #2e7d32;
    }

    .navbar a#water-supply-improvements:hover {
        background-color: #0288d1;
    }

    /* Estilos responsivos para dispositivos móviles */
    @media (max-width: 768px) {
        .navbar ul {
            flex-direction: column;
            align-items: center;
            gap: 15px;
        }

        .header-container {
            flex-direction: column;
            align-items: center;
        }

        .logo {
            margin-bottom: 10px;
        }

        .project-title {
            font-size: 2rem;
            text-align: center;
        }
    }
</style>
