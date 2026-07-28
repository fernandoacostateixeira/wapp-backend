import crypto from 'node:crypto'
import { EventEmitter } from 'node:events'
import { Router, type Request, type Response } from 'express'
import { whatsappConfig } from './config.js'

export const whatsappWebhookRouter = Router()
export const whatsappEvents = new EventEmitter()

export function verifyWhatsappSignature(req: Request, _res: Response, buf: Buffer): void {
  const signature = req.headers['x-hub-signature-256']

  if (!signature || typeof signature !== 'string' || !whatsappConfig.appSecret) {
    return
  }

  const [, receivedHash] = signature.split('=')
  const expectedHash = crypto.createHmac('sha256', whatsappConfig.appSecret).update(buf).digest('hex')

  if (receivedHash !== expectedHash) {
    throw new Error('Invalid WhatsApp webhook signature')
  }
}

whatsappWebhookRouter.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode === 'subscribe' && token === whatsappConfig.verifyToken) {
    res.status(200).send(challenge)
    return
  }

  res.sendStatus(403)
})

export interface IncomingWhatsappMessage {
  from: string
  text: string
  whatsappMessageId: string
  contactName?: string
}

whatsappWebhookRouter.post('/webhook', (req, res) => {
  const body = req.body

  if (body.object === 'whatsapp_business_account') {
    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value
        const contactNameByPhone = new Map<string, string | undefined>(
          (value?.contacts ?? []).map((contact: { wa_id: string; profile?: { name?: string } }) => [
            contact.wa_id,
            contact.profile?.name,
          ]),
        )

        for (const rawMessage of value?.messages ?? []) {
          if (rawMessage.type === 'text') {
            const message: IncomingWhatsappMessage = {
              from: rawMessage.from,
              text: rawMessage.text.body,
              whatsappMessageId: rawMessage.id,
              contactName: contactNameByPhone.get(rawMessage.from),
            }
            whatsappEvents.emit('incoming', message)
          }
        }
      }
    }
  }

  res.status(200).send('EVENT_RECEIVED')
})
