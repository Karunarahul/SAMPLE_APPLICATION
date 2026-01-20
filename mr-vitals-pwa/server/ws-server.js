// ws-server.js
import { WebSocketServer } from 'ws'
const wss = new WebSocketServer({ port: 8080 })

wss.on('connection', ws => {
    console.log('client connected')
    const sendMock = () => {
        // Simulate some noise and trends
        const t = Date.now() / 1000;

        // Heart rate with some sine wave variation + noise
        const hrBase = 72 + 5 * Math.sin(t * 0.5);
        const hr = Math.round(hrBase + (Math.random() - 0.5) * 5);

        // SpO2 mostly stable
        const spo2 = 98 + Math.round((Math.random() - 0.5) * 2);

        // Temp stable
        const temp_c = (36.6 + (Math.random() - 0.5) * 0.2).toFixed(1);

        const payload = JSON.stringify({
            ts: Date.now(),
            hr: hr,
            spo2: spo2 > 100 ? 100 : spo2,
            temp_c: temp_c,
            status: "ok"
        })
        ws.send(payload)
    }
    const iv = setInterval(sendMock, 800)
    ws.on('close', () => clearInterval(iv))
})

console.log('ws server started at ws://localhost:8080')
