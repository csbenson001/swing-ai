'use client'
import { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, subDays, isAfter, parseISO, startOfDay } from 'date-fns'

function StatCard({ label, value, sub, color = 'green' }) {
  const colors = { green: 'bg-green-900/20 border-green-800/30 text-green-400', blue: 'bg-blue-900/20 border-blue-800/30 text-blue-400', gold: 'bg-yellow-900/20 border-yellow-800/30 text-yellow-400', purple: 'bg-purple-900/20 border-purple-800/30 text-purple-400', red: 'bg-red-900/20 border-red-800/30 text-red-400' }
  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

const PIE_COLORS = ['#6b7280', '#22c55e', '#eab308']

export default function DashboardOverview() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/data?type=overview').then(r => r.json()).then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-gray-500">Loading dashboard...</div>
  if (!data) return <div className="text-gray-500">Could not load data. Check your Supabase connection.</div>

  const { profiles, rounds, swings, conversations, tickets, feedback } = data
  const now = new Date()
  const weekAgo = subDays(now, 7)
  const monthAgo = subDays(now, 30)

  const totalUsers = profiles.length
  const newUsersWeek = profiles.filter(p => isAfter(parseISO(p.created_at), weekAgo)).length
  const tierCounts = { free: 0, premium: 0, pro: 0 }
  profiles.forEach(p => { tierCounts[p.subscription_tier] = (tierCounts[p.subscription_tier] || 0) + 1 })
  const pieData = Object.entries(tierCounts).map(([name, value]) => ({ name, value }))
  const activeSubscribers = profiles.filter(p => p.subscription_tier !== 'free' && p.subscription_status === 'active').length
  const estimatedMRR = (tierCounts.premium * 12.99) + (tierCounts.pro * 24.99)
  const roundsThisWeek = rounds.filter(r => isAfter(parseISO(r.created_at), weekAgo)).length
  const swingsThisWeek = swings.filter(s => isAfter(parseISO(s.created_at), weekAgo)).length
  const totalAIMessages = conversations.reduce((sum, c) => sum + (c.messages ? (Array.isArray(c.messages) ? c.messages.length : 0) : 0), 0)
  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length

  const growthData = []
  for (let i = 29; i >= 0; i--) {
    const day = startOfDay(subDays(now, i))
    const dayStr = format(day, 'MMM d')
    const count = profiles.filter(p => format(startOfDay(parseISO(p.created_at)), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')).length
    growthData.push({ date: dayStr, users: count })
  }

  const activityData = []
  for (let i = 6; i >= 0; i--) {
    const day = startOfDay(subDays(now, i))
    const dayStr = format(day, 'EEE')
    const dayRounds = rounds.filter(r => format(startOfDay(parseISO(r.created_at)), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')).length
    const daySwings = swings.filter(s => format(startOfDay(parseISO(s.created_at)), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')).length
    activityData.push({ date: dayStr, rounds: dayRounds, swings: daySwings })
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">SwingAI platform overview</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={totalUsers} sub={`+${newUsersWeek} this week`} color="green" />
        <StatCard label="Active Subscribers" value={activeSubscribers} sub={`${tierCounts.premium} premium \u00b7 ${tierCounts.pro} pro`} color="blue" />
        <StatCard label="Est. MRR" value={`$${estimatedMRR.toFixed(0)}`} sub="Monthly recurring revenue" color="gold" />
        <StatCard label="Open Tickets" value={openTickets} sub={`${tickets.length} total`} color={openTickets > 5 ? 'red' : 'purple'} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Rounds This Week" value={roundsThisWeek} sub={`${rounds.length} total`} color="green" />
        <StatCard label="Swings This Week" value={swingsThisWeek} sub={`${swings.length} total`} color="blue" />
        <StatCard label="AI Messages" value={totalAIMessages} sub={`${conversations.length} conversations`} color="purple" />
        <StatCard label="Feedback" value={feedback.length} sub={`${feedback.filter(f => f.feedback_type === 'bug').length} bugs`} color="gold" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-gray-900/40 border border-gray-800/40 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">User Signups (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} interval={4} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '12px', fontSize: '13px' }} />
              <Bar dataKey="users" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-900/40 border border-gray-800/40 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">Subscription Tiers</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map((entry, i) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs text-gray-400">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                {entry.name}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-gray-900/40 border border-gray-800/40 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-4">Weekly Activity</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} allowDecimals={false} />
            <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '12px' }} />
            <Bar dataKey="rounds" name="Rounds" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="swings" name="Swings" fill="#a855f7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
