<footer>
  <p>
    <a href="https://github.com/gti-sos/SOS2425-13" target="_blank" rel="noopener noreferrer">
      <img src="/github.png" alt="GitHub" class="icon" />
      <span>Realizado por SOS2425-13 · © {new Date().getFullYear()}</span>
    </a>
  </p>
</footer>

<style>
  footer {
    background-color: #cac4c4;
    border-top: 1px solid #ccc;
    padding: 20px 0;
    text-align: center;
    font-size: 1rem;
    margin-top: 50px;
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
    width: 70px; /* Aumenté el tamaño para hacerlo más visible */
    height: 70px; /* Mantener la relación de aspecto cuadrada */
    object-fit: contain; /* Asegura que la imagen no se distorsione */
  }

  /* Asegurar que el texto también se vea en negrita */
  footer span {
    font-weight: bold;
  }
</style>
