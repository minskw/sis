import { supabase } from './supabase'
import { Role } from '@/types'

export async function getCurrentProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()
  return data
}

export async function requireRole(allowedRoles: Role[]) {
  const profile = await getCurrentProfile()
  if (!profile) return null
  if (!allowedRoles.includes(profile.role)) return null
  return profile
}
