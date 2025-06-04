'use client'

/**
 * PremiumLeadChat Component
 *
 * Real-time chat interface for premium lead communication between contractors and customers.
 * Only available when contractor has purchased lead access and chat is enabled.
 *
 * @returns {JSX.Element} Premium chat interface
 */
import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Send,
  MessageCircle,
  User,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Loader2,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ChatMessage {
  id: string
  message: string
  messageType: 'text' | 'quote' | 'schedule' | 'contact' | 'system'
  senderType: 'contractor' | 'customer' | 'system'
  sender: {
    id: string
    firstName: string
    lastName: string
    role: string
  }
  isRead: boolean
  createdAt: string
  quoteInfo?: {
    amount: number
    validUntil: string
    includesLabor: boolean
    includesMaterials: boolean
  }
}

interface PremiumLeadChatProps {
  serviceRequestId: string
  userId: string
  userRole: 'contractor' | 'customer'
  isOpen: boolean
  onClose: () => void
  customerInfo?: {
    firstName: string
    lastName: string
    phone: string
    email: string
  }
}

export const PremiumLeadChat: React.FC<PremiumLeadChatProps> = ({
  serviceRequestId,
  userId,
  userRole,
  isOpen,
  onClose,
  customerInfo,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch chat messages
  const fetchMessages = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/lead-chat?serviceRequestId=${serviceRequestId}&userId=${userId}`,
      )

      if (!response.ok) {
        throw new Error('Error al cargar mensajes')
      }

      const data = await response.json()
      setMessages(data.messages || [])
    } catch (err: any) {
      console.error('Error fetching messages:', err)
      setError(err.message || 'Error al cargar el chat')
    } finally {
      setIsLoading(false)
    }
  }

  // Load messages when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchMessages()

      // Set up polling for new messages every 5 seconds
      const interval = setInterval(fetchMessages, 5000)
      return () => clearInterval(interval)
    }
  }, [isOpen, serviceRequestId, userId])

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    setError(null)

    try {
      const response = await fetch('/api/lead-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceRequestId,
          senderId: userId,
          message: newMessage.trim(),
          messageType: 'text',
        }),
      })

      if (!response.ok) {
        throw new Error('Error al enviar mensaje')
      }

      const data = await response.json()

      // Add message to local state immediately for better UX
      const newMsg: ChatMessage = {
        id: data.message.id,
        message: newMessage.trim(),
        messageType: 'text',
        senderType: userRole,
        sender: {
          id: userId,
          firstName: 'You',
          lastName: '',
          role: userRole,
        },
        isRead: false,
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, newMsg])
      setNewMessage('')

      // Refresh messages to get updated data
      setTimeout(fetchMessages, 1000)
    } catch (err: any) {
      console.error('Error sending message:', err)
      setError(err.message || 'Error al enviar mensaje')
    } finally {
      setIsSending(false)
    }
  }

  // Format message timestamp
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Format message date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer'
    } else {
      return date.toLocaleDateString('es-ES')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            Chat Premium
            {userRole === 'contractor' && customerInfo && (
              <Badge variant="outline">
                {customerInfo.firstName} {customerInfo.lastName}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {userRole === 'contractor'
              ? 'Comunícate directamente con el cliente'
              : 'Chat directo con el contratista'}
          </DialogDescription>
        </DialogHeader>

        {/* Customer Info (for contractors) */}
        {userRole === 'contractor' && customerInfo && (
          <div className="flex-shrink-0 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Información de Contacto</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {customerInfo.firstName} {customerInfo.lastName}
              </div>
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {customerInfo.phone}
              </div>
              <div className="flex items-center gap-1 col-span-2">
                <Mail className="h-3 w-3" />
                {customerInfo.email}
              </div>
            </div>
          </div>
        )}

        <Separator className="flex-shrink-0" />

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 h-full flex items-center justify-center">
              <div>
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No hay mensajes aún</p>
                <p className="text-xs">Inicia la conversación enviando un mensaje</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => {
                const showDate =
                  index === 0 ||
                  formatDate(message.createdAt) !== formatDate(messages[index - 1]?.createdAt || '')

                return (
                  <div key={message.id}>
                    {showDate && (
                      <div className="text-center text-xs text-gray-500 my-2">
                        {formatDate(message.createdAt)}
                      </div>
                    )}

                    <div
                      className={`flex ${
                        message.senderType === userRole ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.senderType === userRole
                            ? 'bg-blue-500 text-white'
                            : message.messageType === 'system'
                              ? 'bg-gray-100 text-gray-700 text-center'
                              : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {message.messageType === 'system' ? (
                          <div className="text-xs">
                            <AlertCircle className="h-3 w-3 inline mr-1" />
                            {message.message}
                          </div>
                        ) : (
                          <>
                            {message.senderType !== userRole && (
                              <div className="text-xs font-medium mb-1">
                                {message.sender.firstName} {message.sender.lastName}
                              </div>
                            )}

                            <div className="text-sm">{message.message}</div>

                            {message.quoteInfo && (
                              <div className="mt-2 p-2 bg-green-100 rounded text-xs text-green-800">
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  <strong>${message.quoteInfo.amount}</strong>
                                </div>
                                <div>
                                  Válido hasta:{' '}
                                  {new Date(message.quoteInfo.validUntil).toLocaleDateString()}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs opacity-70">
                                {formatTime(message.createdAt)}
                              </span>
                              {message.senderType === userRole && (
                                <CheckCircle className="h-3 w-3 opacity-70" />
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {error && (
          <div className="flex-shrink-0 p-2 bg-red-50 text-red-800 text-sm rounded">{error}</div>
        )}

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex-shrink-0 flex gap-2 p-4 border-t">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe tu mensaje..."
            disabled={isSending}
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim() || isSending} size="icon">
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
