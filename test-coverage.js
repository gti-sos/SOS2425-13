import { exec } from 'child_process';

const server = exec('node index.js');

// Esperar a que el servidor esté listo
setTimeout(() => {
  console.log('Servidor iniciado, ejecutando pruebas...');
  
  // Ejecutar pruebas con nyc
  const tests = exec('nyc --reporter=lcov --reporter=text-summary npx newman run ./test/back/darlopvil-tests.json -e ./test/back/local.postman_environment.json && npx newman run ./test/back/blagaralo.postman_collection.json --environment test/back/local.postman_environment.json && npx newman run ./test/back/alvmornav.postman_collection.json -e ./test/back/local.postman_environment.json');
  
  tests.stdout.pipe(process.stdout);
  tests.stderr.pipe(process.stderr);
  
  tests.on('exit', () => {
    console.log('Pruebas completadas, cerrando servidor...');
    server.kill();
    process.exit(0);
  });
}, 3000);

// Mostrar logs del servidor
server.stdout.pipe(process.stdout);
server.stderr.pipe(process.stderr);