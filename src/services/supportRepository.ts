import { supabase } from '../lib/supabase'

export type SupportMessageInput = {
  topic: string
  topicTitle: string
  name: string
  contact: string
  message: string
  userId?: string
}

const LOCAL_SUPPORT_MESSAGES_KEY = 'mimo-meu:support-messages'

function getLocalMessages() {
  const raw = localStorage.getItem(LOCAL_SUPPORT_MESSAGES_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function sendSupportMessage(input: SupportMessageInput) {
  const payload = {
    topic: input.topic,
    topic_title: input.topicTitle,
    sender_name: input.name.trim(),
    sender_contact: input.contact.trim(),
    message: input.message.trim(),
    user_id: input.userId ?? null,
  }

  if (!supabase) {
    const messages = getLocalMessages()
    localStorage.setItem(
      LOCAL_SUPPORT_MESSAGES_KEY,
      JSON.stringify([
        {
          id: `support-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          ...payload,
          created_at: new Date().toISOString(),
        },
        ...messages,
      ])
    )

    return { storedLocally: true }
  }

  const { error } = await supabase.from('support_messages').insert(payload)

  if (error) throw error

  return { storedLocally: false }
}
