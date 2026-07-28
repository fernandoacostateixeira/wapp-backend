export const whatsappConfig = {
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN ?? '',
  appSecret: process.env.WHATSAPP_APP_SECRET ?? '',
  verifyToken: process.env.WHATSAPP_VERIFY_TOKEN ?? '',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? '',
  apiVersion: process.env.WHATSAPP_API_VERSION ?? 'v23.0',
}

const REQUIRED_ENV_VARS = [
  ['accessToken', 'WHATSAPP_ACCESS_TOKEN'],
  ['verifyToken', 'WHATSAPP_VERIFY_TOKEN'],
  ['phoneNumberId', 'WHATSAPP_PHONE_NUMBER_ID'],
] as const

export function isWhatsappConfigured(): boolean {
  const missing = REQUIRED_ENV_VARS.filter(([key]) => !whatsappConfig[key])

  if (missing.length > 0) {
    console.warn(`WhatsApp integration disabled — missing env vars: ${missing.map(([, envVar]) => envVar).join(', ')}`)
    return false
  }

  return true
}
