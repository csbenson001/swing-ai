'use client'
import { useState, useEffect } from 'react'
import { format, parseISO, subDays, isAfter } from 'date-fns'

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch('/api/data?type=feedback').then(r => r.json()).then(d => { setFeedback(d.feedback || []); setLoading(false) })
  }, [])

  if (loading) return <div className="text-gray-500">Loading feedback...</div>

  const now = new Date()
  const typeCounts = { bug: 0, feature_request: 0, general: 0, complaint: 0 }
  feedback.forEach(f => { typeCounts[f.feedback_type] = (typeCounts[f.feedback_type] || 0) + 1 })
  const thisWeek = feedback.filter(f => isAfter(parseISO(f.created_at), subDays(now, 7))).length
  const filtered = filter === 'all' ? feedback : feedback.filter(f => f.feedback_type === filter)
  const typeStyles = {
    bug: { bg: 'bg-red-900/30 text-red-400', icon: '\ud83d\udc1b' },
    feature_request: { bg: 'bg-blue-900/30 text-blue-400', icon: '\ud83d\udca1' },
    general: { bg: 'bg-gray-800 text-gray-400', icon: '\ud83d\udcac' },
    complaint: { bg: 'bg-yellow-900/30 text-yellow-400', icon: '\u26a0\ufe0f' },
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">App Feedback</h1>
      <p className="text-gray-500 text-sm mb-6">{feedback.length} total \u00b7 {thisWeek} this week</p>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {Object.entries(typeCounts).map(([type, count]) => (
          <div key={type} className={`rounded-2xl p-4 border border-gray-800/30 ${typeStyles[type]?.bg || 'bg-gray-800'}`}>
            <div className="flex items-center gap-2 mb-1"><span>{typeStyles[type]?.icon}</span><span className="text-xs font-medium uppercase">{type.replace('_', ' ')}</span></div>
            <p className="text-2xl font-bold">{count}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mb-4">
        {['all', 'bug', 'feature_request', 'general', 'complaint'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-green-900/40 text-green-400 border border-green-800/40' : 'text-gray-500 hover:text-gray-300 bg-gray-800/30'}`}>
            {f === 'all' ? 'All' : f.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.map(f => (
          <div key={f.id} className="bg-gray-900/40 border border-gray-800/40 rounded-2xl p-5">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${typeStyles[f.feedback_type]?.bg}`}>{typeStyles[f.feedback_type]?.icon} {f.feedback_type?.replace('_', ' ')}</span>
                {f.screen_name && <span className="text-xs text-gray-600">on {f.screen_name}</span>}
              </div>
              <span className="text-xs text-gray-600">{f.created_at ? format(parseISO(f.created_at), 'MMM d, yyyy') : ''}</span>
            </div>
            <p className="text-gray-300 text-sm">{f.message}</p>
            <p className="text-gray-600 text-xs mt-2">{f.profiles?.display_name || 'Anonymous'} \u00b7 {f.profiles?.email || ''}</p>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-gray-600 text-center py-12">No feedback entries</div>}
      </div>
    </div>
  )
}
