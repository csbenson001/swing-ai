'use client'
import { useState, useEffect } from 'react'
import { format, parseISO, isAfter, subDays, isBefore, addDays } from 'date-fns'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

export default function SubscriptionsPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch('/api/data?type=subscriptions').then(r => r.json()).then(d => { setData(d.subscriptions || []); setLoading(false) })
  }, [])

  if (loading) return <div className="text-gray-500">Loading subscriptions...</div>

  const now = new Date()
  const tiers = { free: 0, premium: 0, pro: 0 }
  data.forEach(s => { tiers[s.subscription_tier] = (tiers[s.subscription_tier] || 0) + 1 })
  const mrr = (tiers.premium * 12.99) + (tiers.pro * 24.99)
  const arr = mrr * 12
  const trialExpiringSoon = data.filter(s => s.trial_end_date && isBefore(parseISO(s.trial_end_date), addDays(now, 3)) && isAfter(parseISO(s.trial_end_date), now))
  const recentlyCancelled = data.filter(s => s.subscription_status === 'cancelled' && isAfter(parseISO(s.updated_at), subDays(now, 30)))
  const conversionRate = data.length > 0 ? (((tiers.premium + tiers.pro) / data.length) * 100).toFixed(1) : 0
  const pieData = [{ name: 'Free', value: tiers.free }, { name: 'Premium', value: tiers.premium }, { name: 'Pro', value: tiers.pro }]
  const COLORS = ['#6b7280', '#22c55e', '#eab308']
  const filtered = filter === 'all' ? data : data.filter(s => {
    if (filter === 'paying') return s.subscription_tier !== 'free'
    if (filter === 'trial') return s.subscription_status === 'trial'
    if (filter === 'cancelled') return s.subscription_status === 'cancelled'
    return s.subscription_tier === filter
  })
  const tierBadge = (tier) => {
    const styles = { free: 'bg-gray-800 text-gray-400', premium: 'bg-green-900/40 text-green-400', pro: 'bg-yellow-900/40 text-yellow-400' }
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[tier]}`}>{tier}</span>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Subscriptions</h1>
      <p className="text-gray-500 text-sm mb-6">Revenue and subscription tracking</p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-green-900/20 border border-green-800/30 rounded-2xl p-5"><p className="text-xs text-gray-500 uppercase">MRR</p><p className="text-2xl font-bold text-green-400">${mrr.toFixed(0)}</p></div>
        <div className="bg-blue-900/20 border border-blue-800/30 rounded-2xl p-5"><p className="text-xs text-gray-500 uppercase">ARR</p><p className="text-2xl font-bold text-blue-400">${arr.toFixed(0)}</p></div>
        <div className="bg-purple-900/20 border border-purple-800/30 rounded-2xl p-5"><p className="text-xs text-gray-500 uppercase">Conversion</p><p className="text-2xl font-bold text-purple-400">{conversionRate}%</p></div>
        <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-2xl p-5"><p className="text-xs text-gray-500 uppercase">Trials Expiring</p><p className="text-2xl font-bold text-yellow-400">{trialExpiringSoon.length}</p><p className="text-xs text-gray-500">next 3 days</p></div>
        <div className="bg-red-900/20 border border-red-800/30 rounded-2xl p-5"><p className="text-xs text-gray-500 uppercase">Churn (30d)</p><p className="text-2xl font-bold text-red-400">{recentlyCancelled.length}</p></div>
      </div>
      <div className="flex gap-6 mb-6">
        <div className="bg-gray-900/40 border border-gray-800/40 rounded-2xl p-6 w-64">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Tier Breakdown</h3>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value">{pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Pie><Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '12px' }} /></PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">{pieData.map((e, i) => (<div key={e.name} className="flex items-center justify-between text-xs"><div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} /><span className="text-gray-400">{e.name}</span></div><span className="text-gray-300 font-medium">{e.value}</span></div>))}</div>
        </div>
        <div className="flex-1">
          <div className="flex gap-2 mb-4">
            {['all', 'paying', 'free', 'premium', 'pro', 'trial', 'cancelled'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-green-900/40 text-green-400 border border-green-800/40' : 'text-gray-500 hover:text-gray-300 bg-gray-800/30'}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
            ))}
          </div>
          <div className="bg-gray-900/40 border border-gray-800/40 rounded-2xl overflow-hidden max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-900"><tr className="border-b border-gray-800/50"><th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">User</th><th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase">Tier</th><th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase">Status</th><th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase">Joined</th></tr></thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} className="border-b border-gray-800/30 hover:bg-gray-800/20">
                    <td className="px-5 py-3"><p className="text-white text-sm">{s.display_name || 'No name'}</p><p className="text-gray-500 text-xs">{s.email}</p></td>
                    <td className="px-3 py-3">{tierBadge(s.subscription_tier)}</td>
                    <td className="px-3 py-3"><span className={`text-xs ${s.subscription_status === 'active' ? 'text-green-400' : s.subscription_status === 'trial' ? 'text-blue-400' : s.subscription_status === 'cancelled' ? 'text-red-400' : 'text-gray-500'}`}>{s.subscription_status}</span></td>
                    <td className="px-3 py-3 text-gray-500 text-xs">{s.created_at ? format(parseISO(s.created_at), 'MMM d, yyyy') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
