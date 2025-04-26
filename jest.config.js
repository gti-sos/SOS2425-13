
/** @type {import('jest').Config} */
const config = {

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

    transform: {},

    moduleFileExtensions: ["js", "json", "jsx", "ts", "tsx", "node", "mjs"],
    // Entorno de prueba para Node.js
    testEnvironment: 'node',
};

export default config;