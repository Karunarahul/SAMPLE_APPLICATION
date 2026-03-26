import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/SAMPLE_APPLICATION/',
    server: {
        host: true
    },
    resolve: {
        alias: [
            {
                find: /^@babel\/runtime\/helpers\/esm\/(.*)$/,
                replacement: '@babel/runtime/helpers/esm/$1.js',
            }
        ]
    }
})
