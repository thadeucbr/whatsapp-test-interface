import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Permite que a aplicação seja acessível de fora do localhost
    port: 5173, // Certifique-se de que a porta está correta
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
