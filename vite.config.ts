import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import {VitePWA} from 'vite-plugin-pwa'
import {fileURLToPath,URL} from 'node:url'
const base=process.env.VITE_BASE_PATH||'/'
export default defineConfig({base,resolve:{alias:{'@':fileURLToPath(new URL('./src',import.meta.url))}},plugins:[react(),tailwindcss(),VitePWA({
  registerType:'prompt',
  includeAssets:['pwa-icon.svg','apple-touch-icon.png'],
  manifest:{
    id:base,
    name:'NetCalc Pro — IPv4 Network Toolkit',
    short_name:'NetCalc Pro',
    description:'Calculate IPv4 subnets and plan FLSM and VLSM networks offline.',
    start_url:`${base}#/`,
    scope:base,
    display:'standalone',
    background_color:'#f6f8fc',
    theme_color:'#f6f8fc',
    icons:[
      {src:'pwa-192.png',sizes:'192x192',type:'image/png',purpose:'any'},
      {src:'pwa-512.png',sizes:'512x512',type:'image/png',purpose:'any'},
      {src:'pwa-maskable-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'},
    ],
  },
  workbox:{
    globPatterns:['**/*.{html,js,css,png,svg,woff,woff2}'],
    navigateFallback:`${base}index.html`,
    cleanupOutdatedCaches:true,
  },
})],test:{environment:'jsdom',globals:true,setupFiles:['./src/tests/setup.ts'],exclude:['src/tests/e2e/**','node_modules/**']}})
