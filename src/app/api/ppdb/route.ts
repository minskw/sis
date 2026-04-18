// src/app/api/ppdb/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validasi field wajib
    if (!body.student_name || !body.nik || !body.user_id) {
      return NextResponse.json(
        { error: 'Field student_name, nik, dan user_id wajib diisi.' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('ppdb_registrations')
      .insert([{ ...body, status: body.status || 'pending' }])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
