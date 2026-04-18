import { createClient, SupabaseClient } from '@supabase/supabase-js'
let _s:SupabaseClient|null=null, _a:SupabaseClient|null=null
export const getSupabase=():SupabaseClient=>{
  if(!_s){const u=process.env.NEXT_PUBLIC_SUPABASE_URL,k=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;if(!u||!k)throw new Error('Missing Supabase env');_s=createClient(u,k)}return _s}
export const getSupabaseAdmin=():SupabaseClient=>{
  if(!_a){const u=process.env.NEXT_PUBLIC_SUPABASE_URL,k=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!u||!k)throw new Error('Missing Supabase admin env');_a=createClient(u,k)}return _a}
export const supabase=new Proxy({} as SupabaseClient,{get(_,p){return(getSupabase() as any)[p]}})
export const supabaseAdmin=new Proxy({} as SupabaseClient,{get(_,p){return(getSupabaseAdmin() as any)[p]}})
