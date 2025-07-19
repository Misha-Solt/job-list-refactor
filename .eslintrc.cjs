// Zentrale ESLint-Konfiguration für Frontend (TS/JSX) und Backend (TS/JS)

module.exports = {
  root: true, // nicht nach Configs in übergeordneten Ordnern suchen
  parser: '@typescript-eslint/parser', // TypeScript-Parser aktivieren
  parserOptions: {
    ecmaVersion: 'latest', // moderne ECMAScript-Features erkennen
    sourceType: 'module',
    ecmaFeatures: { jsx: true }, // JSX für React
    project: ['./tsconfig.json'], // Typ-Infos für strenge Regeln
  },
  env: {
    browser: true, // window, document, etc.
    node: true, // require, process, __dirname
    es2023: true,
  },
  // ➜ zusätzliche Analyse-Plugins
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jsx-a11y'],
  // ➜ Regel­sets von außen importieren (Reihenfolge wichtig!)
  extends: [
    'eslint:recommended', // Basis-Regeln von ESLint
    'plugin:@typescript-eslint/recommended', // TS-spezifische Regeln
    'plugin:react/recommended', // React-Best-Practices
    'plugin:react-hooks/recommended', // Hooks-Regeln
    'plugin:jsx-a11y/recommended', // Barrierefreiheit
    'prettier', // deaktiviert Regeln, die mit Prettier kollidieren
  ],
  settings: {
    react: { version: 'detect' }, // React-Version automatisch erkennen
  },
  rules: {
    // 🚦 Häufig angepasste Regeln — nach Bedarf verschärfen/lockern
    'no-console': 'warn', // console.log nur als Warnung
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_' }, // ungenutzte Arg-Namen mit _ ignorieren
    ],
  },
  overrides: [
    {
      files: ['*.test.{ts,tsx,js}'], // ➜ Testdateien
      env: { jest: true },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off', // in Tests erlaubt
      },
    },
  ],
}
