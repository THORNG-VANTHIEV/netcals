import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import {fileURLToPath,URL} from 'node:url'
export default defineConfig({base:process.env.VITE_BASE_PATH||'/',resolve:{alias:{'@':fileURLToPath(new URL('./src',import.meta.url))}},plugins:[react(),tailwindcss()],test:{environment:'jsdom',globals:true,setupFiles:['./src/tests/setup.ts'],exclude:['src/tests/e2e/**','node_modules/**']}})
