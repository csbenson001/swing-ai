'use client'
import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'

export default function SupportPage() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('open')
  const [selected, setSelected] = useState(null)
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => {
    fetch('/api/data?type=tickets').then(r => r.json()).then(d => { setTickets(d.tickets || []); setLoading(false) })
  }, [])

  async function updateTicket(ticketId, status, notes) {
    await fetch('/api/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update_ticket', ticketId, status, admin_notes: notes }) })
    setTickets(tickets.map(t => t.id === ticketId ? { ...t, status, admin_notes: notes || t.admin_notes } : t))
    if (selected?.id === ticketId) setSelected({ ...selected, status, admin_notes: notes || selected.admin_notes })
  }

  if (loading) return <div className="text-gray-500">Loading tickets...</div>

  const counts = { open: 0, in_progress: 0, resolved: 0, closed: 0 }
  tickets.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1 })
  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter)
  const priorityColor = { high: 'text-red-400', medium: 'text-yellow-400', low: 'text-gray-400' }
  const statusColor = { open: 'bg-yellow-900/40 text-yellow-400', in_progress: 'bg-blue-900/40 text-blue-400', resolved: 'bg-green-900/40 text-green-400', closed: 'bg-gray-800 text-gray-500' }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Support Tickets</h1>
      <p className="text-gray-500 text-sm mb-6">{counts.open} open \u00b7 {counts.in_progress} in progress</p>
      <div className="flex gap-2 mb-6">
        {['all', 'open', 'in_progress', 'resolved', 'closed'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-green-900/40 text-green-400 border border-green-800/40' : 'text-gray-500 hover:text-gray-300 bg-gray-800/30'}`}>
            {f.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} {f !== 'all' ? `(${counts[f] || 0})` : `(${tickets.length})`}
          </button>
        ))}
      </div>
      <div className="flex gap-6">
        <div className={`${selected ? 'w-1/2' : 'w-full'} space-y-3`}>
          {filtered.map(ticket => (
            <div key={ticket.id} onClick={() => { setSelected(ticket); setAdminNotes(ticket.admin_notes || '') }}
              className={`bg-gray-900/40 border rounded-2xl p-5 cursor-pointer transition-all ${selected?.id === ticket.id ? 'border-green-700/40' : 'border-gray-800/40 hover:border-gray-700/40'}`}>
              <div className="flex items-start justify-between mb-2">
                <div><h3 className="text-white font-medium">{ticket.subject}</h3><p className="text-gray-500 text-xs mt-0.5">{ticket.profiles?.display_name || 'Unknown'} \u00b7 {ticket.profiles?.email}</p></div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${priorityColor[ticket.priority]}`}>\u25cf{ticket.priority}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor[ticket.status]}`}>{ticket.status.replace('_', ' ')}</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm line-clamp-2">{ticket.description}</p>
              <p className="text-gray-600 text-xs mt-2">{ticket.created_at ? format(parseISO(ticket.created_at), 'MMM d, yyyy h:mm a') : ''}</p>
            </div>
          ))}
          {filtered.length === 0 && <div className="text-gray-600 text-center py-12">No tickets in this category</div>}
        </div>
        {selected && (
          <div className="w-1/2">
            <div className="bg-gray-900/40 border border-gray-800/40 rounded-2xl p-6 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">{selected.subject}</h3>
                <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white text-lg">\u2715</button>
              </div>
              <div className="space-y-3 text-sm mb-6">
                <div><span className="text-gray-500">From:</span> <span className="text-gray-300 ml-2">{selected.profiles?.display_name} ({selected.profiles?.email})</span></div>
                <div><span className="text-gray-500">Priority:</span> <span className={`ml-2 ${priorityColor[selected.priority]}`}>{selected.priority}</span></div>
                <div><span className="text-gray-500">Created:</span> <span className="text-gray-300 ml-2">{selected.created_at ? format(parseISO(selected.created_at), 'MMM d, yyyy h:mm a') : ''}</span></div>
              </div>
              <div className="bg-gray-800/40 rounded-xl p-4 mb-6"><p className="text-gray-300 text-sm whitespace-pre-wrap">{selected.description}</p></div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Update Status</label>
                  <div className="flex gap-2 mt-2">
                    {['open', 'in_progress', 'resolved', 'closed'].map(s => (
                      <button key={s} onClick={() => updateTicket(selected.id, s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${selected.status === s ? 'bg-green-900/40 text-green-400 border border-green-800/40' : 'text-gray-500 bg-gray-800/40 hover:text-gray-300'}`}>{s.replace('_', ' ')}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Admin Notes</label>
                  <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={3} className="w-full mt-2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-700 resize-none" placeholder="Add internal notes..." />
                  <button onClick={() => updateTicket(selected.id, selected.status, adminNotes)} className="mt-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-medium rounded-xl transition-colors">Save Notes</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
