import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const db = getServiceSupabase()

  try {
    switch (type) {
      case 'overview': {
        const [profiles, rounds, swings, conversations, tickets, feedback] = await Promise.all([
          db.from('profiles').select('id, subscription_tier, subscription_status, created_at, updated_at'),
          db.from('rounds').select('id, user_id, total_score, date_played, created_at'),
          db.from('swing_analyses').select('id, created_at'),
          db.from('ai_conversations').select('id, messages, created_at'),
          db.from('support_tickets').select('id, status, priority, created_at'),
          db.from('app_feedback').select('id, feedback_type, created_at'),
        ])
        return NextResponse.json({
          profiles: profiles.data || [],
          rounds: rounds.data || [],
          swings: swings.data || [],
          conversations: conversations.data || [],
          tickets: tickets.data || [],
          feedback: feedback.data || [],
        })
      }

      case 'users': {
        const { data } = await db.from('profiles').select('*').order('created_at', { ascending: false })
        const { data: roundCounts } = await db.from('rounds').select('user_id')
        const { data: swingCounts } = await db.from('swing_analyses').select('user_id')
        const userRounds = {}
        const userSwings = {}
        ;(roundCounts || []).forEach(r => { userRounds[r.user_id] = (userRounds[r.user_id] || 0) + 1 })
        ;(swingCounts || []).forEach(s => { userSwings[s.user_id] = (userSwings[s.user_id] || 0) + 1 })
        const users = (data || []).map(u => ({
          ...u,
          rounds_count: userRounds[u.id] || 0,
          swings_count: userSwings[u.id] || 0,
        }))
        return NextResponse.json({ users })
      }

      case 'user_detail': {
        const userId = searchParams.get('userId')
        const [profile, rounds, swings, conversations, tickets] = await Promise.all([
          db.from('profiles').select('*').eq('id', userId).single(),
          db.from('rounds').select('*').eq('user_id', userId).order('date_played', { ascending: false }).limit(20),
          db.from('swing_analyses').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
          db.from('ai_conversations').select('id, topic, messages, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
          db.from('support_tickets').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        ])
        return NextResponse.json({
          profile: profile.data,
          rounds: rounds.data || [],
          swings: swings.data || [],
          conversations: conversations.data || [],
          tickets: tickets.data || [],
        })
      }

      case 'subscriptions': {
        const { data } = await db.from('profiles').select('id, display_name, email, subscription_tier, subscription_status, trial_end_date, created_at, updated_at')
          .order('created_at', { ascending: false })
        return NextResponse.json({ subscriptions: data || [] })
      }

      case 'tickets': {
        const { data } = await db.from('support_tickets').select('*, profiles(display_name, email)')
          .order('created_at', { ascending: false })
        return NextResponse.json({ tickets: data || [] })
      }

      case 'feedback': {
        const { data } = await db.from('app_feedback').select('*, profiles(display_name, email)')
          .order('created_at', { ascending: false })
        return NextResponse.json({ feedback: data || [] })
      }

      case 'ai_analytics': {
        const { data } = await db.from('ai_conversations').select('id, user_id, topic, messages, created_at')
          .order('created_at', { ascending: false })
          .limit(200)
        return NextResponse.json({ conversations: data || [] })
      }

      case 'tips': {
        const { data } = await db.from('daily_tips').select('*').order('display_order')
        return NextResponse.json({ tips: data || [] })
      }

      case 'drills': {
        const { data } = await db.from('practice_drills').select('*').order('display_order')
        return NextResponse.json({ drills: data || [] })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (err) {
    console.error('API Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  const db = getServiceSupabase()
  const body = await request.json()
  const { action } = body

  try {
    switch (action) {
      case 'update_subscription': {
        const { userId, tier, status } = body
        const { error } = await db.from('profiles').update({ subscription_tier: tier, subscription_status: status }).eq('id', userId)
        if (error) throw error
        return NextResponse.json({ success: true })
      }

      case 'update_ticket': {
        const { ticketId, status, admin_notes } = body
        const updates = { status }
        if (admin_notes !== undefined) updates.admin_notes = admin_notes
        const { error } = await db.from('support_tickets').update(updates).eq('id', ticketId)
        if (error) throw error
        return NextResponse.json({ success: true })
      }

      case 'save_tip': {
        const { tip } = body
        if (tip.id) {
          const { id, ...rest } = tip
          const { error } = await db.from('daily_tips').update(rest).eq('id', id)
          if (error) throw error
        } else {
          const { error } = await db.from('daily_tips').insert(tip)
          if (error) throw error
        }
        return NextResponse.json({ success: true })
      }

      case 'delete_tip': {
        const { tipId } = body
        const { error } = await db.from('daily_tips').delete().eq('id', tipId)
        if (error) throw error
        return NextResponse.json({ success: true })
      }

      case 'save_drill': {
        const { drill } = body
        if (drill.id) {
          const { id, ...rest } = drill
          const { error } = await db.from('practice_drills').update(rest).eq('id', id)
          if (error) throw error
        } else {
          const { error } = await db.from('practice_drills').insert(drill)
          if (error) throw error
        }
        return NextResponse.json({ success: true })
      }

      case 'delete_drill': {
        const { drillId } = body
        const { error } = await db.from('practice_drills').delete().eq('id', drillId)
        if (error) throw error
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (err) {
    console.error('API Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
