'use client'
import { useState, useEffect } from 'react'
import { format, parseISO, subDays, isAfter } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const COST_PER_MSG = 0.02

export default function AIAnalyticsPage() {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/data?type=ai_analytics').then(r => r.json()).then(d => { setConversations(d.conversations || []); setLoading(false) })
  }, [])

  if (loading) return <div className="text-gray-500">Loading AI analytics...</div>

  const now = new Date()
  const weekAgo = subDays(now, 7)
  const monthAgo = subDays(now, 30)
  const totalConvos = conversations.length
  const weekConvos = conversations.filter(c => isAfter(parseISO(c.created_at), weekAgo)).length
  let totalMessages = 0
  const topicCounts = {}
  conversations.forEach(c => {
    const msgCount = c.messages ? (Array.isArray(c.messages) ? c.messages.length : 0) : 0
    totalMessages += msgCount
    const topic = c.topic || 'general'
    topicCounts[topic] = (topicCounts[topic] || 0) + 1
  })
  const avgMsgsPerConvo = totalConvos > 0 ? (totalMessages / totalConvos).toFixed(1) : 0
  const weekMessages = conversations.filter(c => isAfter(parseISO(c.created_at), weekAgo)).reduce((s, c) => s + (c.messages ? (Array.isArray(c.messages) ? c.messages.length : 0) : 0), 0)
  const monthMessages = conversations.filter(c => isAfter(parseISO(c.created_at), monthAgo)).reduce((s, c) => s + (c.messages ? (Array.isArray(c.messages) ? c.messages.length : 0) : 0), 0)
  const estMonthlyCost = (monthMessages * COST_PER_MSG).toFixed(2)
  const topicData = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name: name.replace('_', ' '), value }))
  const dailyData = []
  for (let i = 6; i >= 0; i--) {
    const day = subDays(now, i)
    const dayStr = format(day, 'EEE')
    const dayConvos = conversations.filter(c => format(parseISO(c.created_at), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
    const msgs = dayConvos.reduce((s, c) => s + (c.messages ? (Array.isArray(c.messages) ? c.messages.length : 0) : 0), 0)
    dailyData.push({ date: dayStr, conversations: dayConvos.length, messages: msgs })
  }
  const uniqueUsers = new Set(conversations.map(c => c.user_id)).size
  const longestConvos = [...conversations].sort((a, b) => {
    const aLen = a.messages ? (Array.isArray(a.messages) ? a.messages.length : 0) : 0
    const bLen = b.messages ? (Array.isArray(b.messages) ? b.messages.length : 0) : 0
    return bLen - aLen
  }).slice(0, 10)

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">AI Coach Analytics</h1>
      <p className="text-gray-500 text-sm mb-6">Claude-powered golf coaching insights</p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-purple-900/20 border border-purple-800/30 rounded-2xl p-5"><p className="text-xs text-gray-500 uppercase">Total Conversations</p><p className="text-2xl font-bold text-purple-400">{totalConvos}</p><p className="text-xs text-gray-500">{weekConvos} this week</p></div>
        <div className="bg-blue-900/20 border border-blue-800/30 rounded-2xl p-5"><p className="text-xs text-gray-500 uppercase">Total Messages</p><p className="text-2xl font-bold text-blue-400">{totalMessages}</p><p className="text-xs text-gray-500">{weekMessages} this week</p></div>
        <div className="bg-green-900/20 border border-green-800/30 rounded-2xl p-5"><p className="text-xs text-gray-500 uppercase">Avg/Conversation</p><p className="text-2xl font-bold text-green-400">{avgMsgsPerConvo}</p><p className="text-xs text-gray-500">messages</p></div>
        <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-2xl p-5"><p className="text-xs text-gray-500 uppercase">Unique Users</p><p className="text-2xl font-bold text-yellow-400">{uniqueUsers}</p><p className="text-xs text-gray-500">used AI coach</p></div>
        <div className="bg-red-900/20 border border-red-800/30 rounded-2xl p-5"><p className="text-xs text-gray-500 uppercase">Est. API Cost</p><p className="text-2xl font-bold text-red-400">${estMonthlyCost}</p><p className="text-xs text-gray-500">this month</p></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-900/40 border border-gray-800/40 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">Daily Usage (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '12px' }} />
              <Bar dataKey="messages" name="Messages" fill="#a855f7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="conversations" name="Conversations" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-900/40 border border-gray-800/40 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">Popular Topics</h3>
          <div className="space-y-3">
            {topicData.slice(0, 8).map(topic => {
              const pct = totalConvos > 0 ? ((topic.value / totalConvos) * 100).toFixed(0) : 0
              return (
                <div key={topic.name}>
                  <div className="flex justify-between text-xs mb-1"><span className="text-gray-300 capitalize">{topic.name}</span><span className="text-gray-500">{topic.value} ({pct}%)</span></div>
                  <div className="w-full bg-gray-800 rounded-full h-2"><div className="bg-purple-500 rounded-full h-2 transition-all" style={{ width: `${pct}%` }} /></div>
                </div>
              )
            })}
            {topicData.length === 0 && <p className="text-gray-600 text-sm">No conversations yet</p>}
          </div>
        </div>
      </div>
      <div className="bg-gray-900/40 border border-gray-800/40 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-4">Longest Conversations (Power Users)</h3>
        <div className="space-y-2">
          {longestConvos.map(c => {
            const msgCount = c.messages ? (Array.isArray(c.messages) ? c.messages.length : 0) : 0
            return (
              <div key={c.id} className="flex items-center justify-between bg-gray-800/30 rounded-xl px-4 py-3">
                <div><span className="text-gray-300 text-sm capitalize">{c.topic || 'general'}</span><span className="text-gray-600 text-xs ml-3">{c.created_at ? format(parseISO(c.created_at), 'MMM d, yyyy') : ''}</span></div>
                <span className="text-purple-400 font-bold text-sm">{msgCount} messages</span>
              </div>
            )
          })}
          {longestConvos.length === 0 && <p className="text-gray-600 text-sm">No conversations yet</p>}
        </div>
      </div>
    </div>
  )
}
