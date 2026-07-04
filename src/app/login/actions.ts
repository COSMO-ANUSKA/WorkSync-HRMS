'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

import { cookies } from 'next/headers'

export async function login(formData: FormData) {
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  if (data.email === 'dummyopen00@gmail.com' && data.password === 'dummy12345@') {
    const cookieStore = await cookies()
    cookieStore.set('worksync-dummy-auth', 'true', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })
    revalidatePath('/', 'layout')
    redirect('/dashboard')
  }

  const supabase = await createClient()
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect('/dashboard')
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=Invalid credentials')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect('/dashboard')
  }

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/login?error=Could not create user')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signout() {
  const cookieStore = await cookies()
  cookieStore.delete('worksync-dummy-auth')

  const supabase = await createClient()
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect('/login')
  }
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
