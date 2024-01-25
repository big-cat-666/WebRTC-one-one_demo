import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), nodePolyfills()],
  server: {
    host: true,
    port: 5051, // 开发环境启动的端口
  },
  // define: {
  //   global: {},
  // },
})
