'use client'
import { useState, useEffect } from 'react'

const CATEGORIES = ['full_swing', 'short_game', 'putting', 'mental_game', 'course_management', 'fitness', 'equipment', 'rules']
const DRILL_CATEGORIES = ['full_swing', 'short_game', 'putting', 'mental_game']
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced']

function TipEditor({ tip, onSave, onCancel }) {
  const [form, setForm] = useState(tip || { title: '', body: '', category: 'full_swing', is_published: true, display_order: 0 })
  const [saving, setSaving] = useState(false)
  async function save() {
    setSaving(true)
    await fetch('/api/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'save_tip', tip: form }) })
    setSaving(false); onSave()
  }
  return (
    <div className="bg-gray-900/60 border border-gray-700/40 rounded-2xl p-6 space-y-4">
      <h3 className="text-white font-semibold">{tip?.id ? 'Edit Tip' : 'New Tip'}</h3>
      <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Tip title..." className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-green-700" />
      <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} rows={4} placeholder="Tip content..." className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-green-700 resize-none" />
      <div className="flex gap-3">
        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm">{CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}</select>
        <input type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} className="w-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm" placeholder="Order" />
        <label className="flex items-center gap-2 text-sm text-gray-400"><input type="checkbox" checked={form.is_published} onChange={e => setForm({ ...form, is_published: e.target.checked })} className="rounded" /> Published</label>
      </div>
      <div className="flex gap-2">
        <button onClick={save} disabled={saving} className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50">{saving ? 'Saving...' : 'Save Tip'}</button>
        <button onClick={onCancel} className="px-4 py-2 text-gray-500 hover:text-gray-300 text-sm">Cancel</button>
      </div>
    </div>
  )
}

function DrillEditor({ drill, onSave, onCancel }) {
  const [form, setForm] = useState(drill || { title: '', description: '', category: 'full_swing', difficulty: 'beginner', duration_minutes: 10, is_published: true, is_premium: false, display_order: 0 })
  const [saving, setSaving] = useState(false)
  async function save() {
    setSaving(true)
    await fetch('/api/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'save_drill', drill: form }) })
    setSaving(false); onSave()
  }
  return (
    <div className="bg-gray-900/60 border border-gray-700/40 rounded-2xl p-6 space-y-4">
      <h3 className="text-white font-semibold">{drill?.id ? 'Edit Drill' : 'New Drill'}</h3>
      <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Drill name..." className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-green-700" />
      <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Step-by-step instructions..." className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-green-700 resize-none" />
      <div className="flex gap-3 flex-wrap">
        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm">{DRILL_CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}</select>
        <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm">{DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}</select>
        <input type="number" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 0 })} className="w-24 px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm" placeholder="Minutes" />
        <label className="flex items-center gap-2 text-sm text-gray-400"><input type="checkbox" checked={form.is_premium} onChange={e => setForm({ ...form, is_premium: e.target.checked })} /> Premium Only</label>
        <label className="flex items-center gap-2 text-sm text-gray-400"><input type="checkbox" checked={form.is_published} onChange={e => setForm({ ...form, is_published: e.target.checked })} /> Published</label>
      </div>
      <div className="flex gap-2">
        <button onClick={save} disabled={saving} className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50">{saving ? 'Saving...' : 'Save Drill'}</button>
        <button onClick={onCancel} className="px-4 py-2 text-gray-500 hover:text-gray-300 text-sm">Cancel</button>
      </div>
    </div>
  )
}

export default function ContentPage() {
  const [tab, setTab] = useState('tips')
  const [tips, setTips] = useState([])
  const [drills, setDrills] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingTip, setEditingTip] = useState(null)
  const [editingDrill, setEditingDrill] = useState(null)
  const [showNewTip, setShowNewTip] = useState(false)
  const [showNewDrill, setShowNewDrill] = useState(false)

  function loadContent() {
    setLoading(true)
    Promise.all([fetch('/api/data?type=tips').then(r => r.json()), fetch('/api/data?type=drills').then(r => r.json())])
      .then(([t, d]) => { setTips(t.tips || []); setDrills(d.drills || []); setLoading(false) })
  }
  useEffect(() => { loadContent() }, [])

  async function deleteTip(id) { if (!confirm('Delete this tip?')) return; await fetch('/api/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete_tip', tipId: id }) }); loadContent() }
  async function deleteDrill(id) { if (!confirm('Delete this drill?')) return; await fetch('/api/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete_drill', drillId: id }) }); loadContent() }

  if (loading) return <div className="text-gray-500">Loading content...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Content Management</h1>
      <p className="text-gray-500 text-sm mb-6">Manage tips, drills, and educational content</p>
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('tips')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === 'tips' ? 'bg-green-900/40 text-green-400 border border-green-800/40' : 'text-gray-500 bg-gray-800/30'}`}>Daily Tips ({tips.length})</button>
        <button onClick={() => setTab('drills')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === 'drills' ? 'bg-green-900/40 text-green-400 border border-green-800/40' : 'text-gray-500 bg-gray-800/30'}`}>Practice Drills ({drills.length})</button>
      </div>
      {tab === 'tips' && (
        <div>
          <button onClick={() => setShowNewTip(true)} className="mb-4 px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-medium rounded-xl transition-colors">+ Add Tip</button>
          {showNewTip && <div className="mb-4"><TipEditor onSave={() => { setShowNewTip(false); loadContent() }} onCancel={() => setShowNewTip(false)} /></div>}
          <div className="space-y-3">
            {tips.map(tip => (
              <div key={tip.id}>
                {editingTip === tip.id ? (<TipEditor tip={tip} onSave={() => { setEditingTip(null); loadContent() }} onCancel={() => setEditingTip(null)} />) : (
                  <div className="bg-gray-900/40 border border-gray-800/40 rounded-2xl p-5 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-medium">{tip.title}</h3>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-gray-800 text-gray-400">{tip.category?.replace('_', ' ')}</span>
                        {!tip.is_published && <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-900/40 text-yellow-400">Draft</span>}
                      </div>
                      <p className="text-gray-400 text-sm line-clamp-2">{tip.body}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button onClick={() => setEditingTip(tip.id)} className="text-gray-500 hover:text-green-400 text-sm">Edit</button>
                      <button onClick={() => deleteTip(tip.id)} className="text-gray-500 hover:text-red-400 text-sm">Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {tips.length === 0 && <p className="text-gray-600 text-center py-8">No tips yet. Add your first tip above.</p>}
          </div>
        </div>
      )}
      {tab === 'drills' && (
        <div>
          <button onClick={() => setShowNewDrill(true)} className="mb-4 px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-medium rounded-xl transition-colors">+ Add Drill</button>
          {showNewDrill && <div className="mb-4"><DrillEditor onSave={() => { setShowNewDrill(false); loadContent() }} onCancel={() => setShowNewDrill(false)} /></div>}
          <div className="space-y-3">
            {drills.map(drill => (
              <div key={drill.id}>
                {editingDrill === drill.id ? (<DrillEditor drill={drill} onSave={() => { setEditingDrill(null); loadContent() }} onCancel={() => setEditingDrill(null)} />) : (
                  <div className="bg-gray-900/40 border border-gray-800/40 rounded-2xl p-5 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-medium">{drill.title}</h3>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-gray-800 text-gray-400">{drill.category?.replace('_', ' ')}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${drill.difficulty === 'beginner' ? 'bg-green-900/30 text-green-400' : drill.difficulty === 'intermediate' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-red-900/30 text-red-400'}`}>{drill.difficulty}</span>
                        {drill.is_premium && <span className="px-2 py-0.5 rounded-full text-xs bg-purple-900/30 text-purple-400">Premium</span>}
                        {!drill.is_published && <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-900/40 text-yellow-400">Draft</span>}
                      </div>
                      <p className="text-gray-400 text-sm line-clamp-2">{drill.description}</p>
                      {drill.duration_minutes && <p className="text-gray-600 text-xs mt-1">{drill.duration_minutes} min</p>}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button onClick={() => setEditingDrill(drill.id)} className="text-gray-500 hover:text-green-400 text-sm">Edit</button>
                      <button onClick={() => deleteDrill(drill.id)} className="text-gray-500 hover:text-red-400 text-sm">Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {drills.length === 0 && <p className="text-gray-600 text-center py-8">No drills yet. Add your first drill above.</p>}
          </div>
        </div>
      )}
    </div>
  )
}
