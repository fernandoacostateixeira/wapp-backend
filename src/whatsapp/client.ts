import { whatsappConfig } from './config.js'

interface SendTextMessageResult {
  whatsappMessageId?: string
}

export async function sendTextMessage(to: string, text: string): Promise<SendTextMessageResult> {
  const { accessToken, phoneNumberId, apiVersion } = whatsappConfig

  const response = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(`WhatsApp API error (${response.status}): ${JSON.stringify(data)}`)
  }

  return { whatsappMessageId: data.messages?.[0]?.id }
}
