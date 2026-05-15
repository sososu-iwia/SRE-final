const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');

module.exports = defineConfig({
  root: 'frontend/react',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:1112'
    }
  },
  build: {
    outDir: '../../public',
    emptyOutDir: false
  }
});
