import { supabase } from '../lib/supabase'

export type SupportMessageInput = {
  topic: string
  topicTitle: string
  name: string
  contact: string
  message: string
  userId?: string
}

export async function sendSupportMessage(input: SupportMessageInput) {
  if (!supabase) throw new Error('Supabase não está configurado.')

  const { error } = await supabase.from('support_messages').insert({
    topic: input.topic,
    topic_title: input.topicTitle,
    sender_name: input.name.trim(),
    sender_contact: input.contact.trim(),
    message: input.message.trim(),
    user_id: input.userId ?? null,
  })

  if (error) throw error
}
