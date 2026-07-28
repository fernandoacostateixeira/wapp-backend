export interface Message {
  id: string
  conversationId: string
  senderId: string
  text: string
  sentAt: string
}

export interface OutgoingSocketMessage {
  message: Message
  to: string
}
