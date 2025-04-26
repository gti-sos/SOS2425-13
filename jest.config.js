
/** @type {import('jest').Config} */
const config = {
    // Indica a Jest que ignore el directorio de pruebas E2E
    testPathIgnorePatterns: [
      "/node_modules/",
      "/tests/e2e/"
    ],
    // Habilita la recolección de cobertura
    collectCoverage: true,
    // Especifica dónde guardar los informes de cobertura
    coverageDirectory: "coverage",
    // Especifica los formatos de informe (lcov es necesario para Codecov)
    coverageReporters: ["json", "lcov", "text", "clover"],
    // Si tu proyecto usa "type": "module" en package.json, necesitas configurar transform para ESM
    // Para proyectos simples con Node >= 16, a menudo basta con un transform vacío
    // Si usas sintaxis más avanzada o TS, necesitarás Babel o ts-jest
    transform: {},
    // Añade 'mjs' si usas esa extensión
    moduleFileExtensions: ["js", "json", "jsx", "ts", "tsx", "node", "mjs"],
    // Entorno de prueba para Node.js
    testEnvironment: 'node',
  };
  
  export default config;