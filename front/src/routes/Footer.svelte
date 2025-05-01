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
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(202, 196, 196, 0.95) 100%);
    padding: 8px 0;
    text-align: center;
    font-size: 0.95rem;
   
    backdrop-filter: blur(5px);
  }

  footer a {
    color: #222;
    text-decoration: none;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    padding: 6px 12px;
    border-radius: 18px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(224, 224, 224, 0.9) 100%);
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(0, 0, 0, 0.1);
    font-size: 0.95rem;
  }

  footer a:hover {
    color: #0d47a1;
    transform: translateY(-3px);
    box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.2);
    background: linear-gradient(135deg, #0d47a1 0%, #002171 100%);
    color: white;
  }

  .icon {
    width: 36px;
    height: 36px;
    object-fit: contain;
    transition: transform 0.3s ease;
  }

  footer a:hover .icon {
    transform: scale(1.1);
  }

  footer span {
    font-weight: bold;
  }
</style>
