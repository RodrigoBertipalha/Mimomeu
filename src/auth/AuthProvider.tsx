import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { AuthContext, type AuthContextValue } from './authContext'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) {
      return
    }

    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setIsLoading(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      isLoading,
      isConfigured: isSupabaseConfigured,
      async signIn(email, password) {
        if (!supabase) throw new Error('Supabase não está configurado.')

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error
      },
      async signInWithGoogle(redirectPath = '/list') {
        if (!supabase) throw new Error('Supabase não está configurado.')

        const redirectUrl = new URL('/login', window.location.origin)
        redirectUrl.searchParams.set('next', redirectPath)

        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl.toString(),
          },
        })

        if (error) throw error
      },
      async signUp(email, password, displayName) {
        if (!supabase) throw new Error('Supabase não está configurado.')

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
            data: {
              display_name: displayName,
            },
          },
        })

        if (error) throw error

        return { needsConfirmation: !data.session }
      },
      async updateProfile(displayName) {
        if (!supabase) throw new Error('Supabase não está configurado.')

        const nextDisplayName = displayName.trim()
        const { error } = await supabase.auth.updateUser({
          data: {
            display_name: nextDisplayName,
          },
        })

        if (error) throw error

        if (session?.user.id) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ display_name: nextDisplayName })
            .eq('id', session.user.id)

          if (profileError) throw profileError
        }

        const { data: sessionData } = await supabase.auth.getSession()
        setSession(sessionData.session)
      },
      async updateEmail(email) {
        if (!supabase) throw new Error('Supabase não está configurado.')

        const { error } = await supabase.auth.updateUser({
          email: email.trim(),
        })

        if (error) throw error

        const { data: sessionData } = await supabase.auth.getSession()
        setSession(sessionData.session)
      },
      async updatePassword(password) {
        if (!supabase) throw new Error('Supabase não está configurado.')

        const { error } = await supabase.auth.updateUser({
          password,
        })

        if (error) throw error

        const { data: sessionData } = await supabase.auth.getSession()
        setSession(sessionData.session)
      },
      async signOut() {
        if (!supabase) return
        const { error } = await supabase.auth.signOut()
        if (error) throw error
      },
    }),
    [isLoading, session]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
