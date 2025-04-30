<footer>
  <p>
    <a href="https://github.com/gti-sos/SOS2425-13" target="_blank" rel="noopener noreferrer">
      <img
        src="/favicon.ico"
        alt="GitHub"
        class="icon"
      />
      Realizado por SOS2425-13 · © <span id="year"></span>
    </a>
  </p>
</footer>

<style>
  /* Reset general para evitar márgenes indeseados */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', sans-serif;
    background-color: #fafafa;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  main {
    flex: 1; /* Empuja el footer al final */
    margin-bottom: 0;
  }

  main > *:last-child {
    margin-bottom: 0;
  }

  footer {
    background-color: #f2f2f2;
    border-top: 1px solid #ccc;
    padding: 20px 0;
    text-align: center;
    font-size: 1rem;
    margin-top: auto;
  }

  footer a {
    color: #222;
    text-decoration: none;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: color 0.3s;
  }

  footer a:hover {
    color: #0d47a1;
  }

  .icon {
    width: 20px;
    height: 20px;
  }
</style>

