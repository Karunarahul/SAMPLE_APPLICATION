import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
    plugins: [react(), basicSsl()],
    base: '/SAMPLE_APPLICATION/',
    server: {
        host: true
    },
    resolve: {
        alias: command === 'build' ? [
            {
                find: /^@babel\/runtime\/helpers\/esm\/(.*)$/,
                replacement: '@babel/runtime/helpers/esm/$1.js',
            }
        ] : []
    }
}))
