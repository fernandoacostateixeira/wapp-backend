import 'dotenv/config'
import { createServer } from 'node:http'
import express from 'express'
import cors from 'cors'
import { Server } from 'socket.io'
import type { OutgoingSocketMessage } from './types.js'
import { isWhatsappConfigured } from './whatsapp/config.js'
import { sendTextMessage } from './whatsapp/client.js'
import {
  whatsappWebhookRouter,
  whatsappEvents,
  verifyWhatsappSignature,
  type IncomingWhatsappMessage,
} from './whatsapp/webhook.js'

const PORT = process.env.PORT ?? 4000
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173'

const app = express()
app.use(cors({ origin: CLIENT_ORIGIN }))

app.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use(express.json({ verify: verifyWhatsappSignature }))
app.use(whatsappWebhookRouter)

const whatsappEnabled = isWhatsappConfigured()

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: CLIENT_ORIGIN },
})

whatsappEvents.on('incoming', (incomingMessage: IncomingWhatsappMessage) => {
  io.emit('whatsapp:incoming', incomingMessage)
})

io.on('connection', (socket) => {
  console.log(`client connected: ${socket.id}`)

  socket.on('message:new', async ({ message, to }: OutgoingSocketMessage) => {
    socket.broadcast.emit('message:new', message)

    if (!whatsappEnabled) return

    try {
      await sendTextMessage(to, message.text)
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error)
    }
  })

  socket.on('disconnect', () => {
    console.log(`client disconnected: ${socket.id}`)
  })
})

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Webhook request rejected:', err.message)
  res.sendStatus(401)
})

httpServer.listen(PORT, () => {
  console.log(`wapp-web backend listening on port ${PORT}`)
})
