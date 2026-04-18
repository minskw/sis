'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'
export function useProfile() {
  const [profile, setProfile] = useState<Profile|null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(()=>{
    const fetch=async()=>{
      const {data:{user}}=await supabase.auth.getUser()
      if(!user){setLoading(false);return}
      const {data}=await supabase.from('profiles').select('*').eq('user_id',user.id).single()
      setProfile(data);setLoading(false)
    }
    fetch()
    const {data:{subscription}}=supabase.auth.onAuthStateChange(()=>fetch())
    return()=>subscription.unsubscribe()
  },[])
  const signOut=async()=>{await supabase.auth.signOut();setProfile(null);window.location.href='/login'}
  return{profile,loading,signOut}
}
