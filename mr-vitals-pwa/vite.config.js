import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/SAMPLE_APPLICATION/',
    server: {
        host: true
    },
    resolve: {
        alias: {
            '@babel/runtime': path.resolve(__dirname, 'node_modules/@babel/runtime')
        }
    }
})
