'use client'
import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterTier, setFilterTier] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)
  const [userDetail, setUserDetail] = useState(null)

  useEffect(() => {
    fetch('/api/data?type=users').then(r => r.json()).then(d => { setUsers(d.users || []); setLoading(false) })
  }, [])

  async function loadUserDetail(userId) {
    const res = await fetch(`/api/data?type=user_detail&userId=${userId}`)
    const detail = await res.json()
    setUserDetail(detail)
    setSelectedUser(userId)
  }

  async function updateSubscription(userId, tier, status) {
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_subscription', userId, tier, status })
    })
    setUsers(users.map(u => u.id === userId ? { ...u, subscription_tier: tier, subscription_status: status } : u))
    if (userDetail?.profile?.id === userId) {
      setUserDetail({ ...userDetail, profile: { ...userDetail.profile, subscription_tier: tier, subscription_status: status } })
    }
  }

  const filtered = users.filter(u => {
    const matchesSearch = !search || (u.display_name || '').toLowerCase().includes(search.toLowerCase()) || (u.email || '').toLowerCase().includes(search.toLowerCase())
    const matchesTier = filterTier === 'all' || u.subscription_tier === filterTier
    return matchesSearch && matchesTier
  })

  const tierBadge = (tier) => {
    const styles = { free: 'bg-gray-800 text-gray-400', premium: 'bg-green-900/40 text-green-400', pro: 'bg-yellow-900/40 text-yellow-400' }
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[tier] || styles.free}`}>{tier}</span>
  }

  const statusBadge = (status) => {
    const styles = { active: 'text-green-400', trial: 'text-blue-400', expired: 'text-red-400', cancelled: 'text-gray-500' }
    return <span className={`text-xs ${styles[status] || 'text-gray-400'}`}>{status}</span>
  }

  if (loading) return <div className="text-gray-500">Loading users...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-gray-500 text-sm">{users.length} registered users</p>
        </div>
      </div>
      <div className="flex gap-3 mb-6">
        <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 max-w-sm px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-700" />
        <select value={filterTier} onChange={e => setFilterTier(e.target.value)}
          className="px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-white text-sm focus:outline-none">
          <option value="all">All Tiers</option>
          <option value="free">Free</option>
          <option value="premium">Premium</option>
          <option value="pro">Pro</option>
        </select>
      </div>
      <div className="flex gap-6">
        <div className={`${selectedUser ? 'w-1/2' : 'w-full'} transition-all`}>
          <div className="bg-gray-900/40 border border-gray-800/40 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800/50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase">Tier</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase">Rounds</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase">Swings</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id} onClick={() => loadUserDetail(user.id)}
                    className={`border-b border-gray-800/30 cursor-pointer transition-colors ${selectedUser === user.id ? 'bg-green-900/10' : 'hover:bg-gray-800/30'}`}>
                    <td className="px-5 py-3"><p className="text-white font-medium">{user.display_name || 'No name'}</p><p className="text-gray-500 text-xs">{user.email}</p></td>
                    <td className="px-3 py-3">{tierBadge(user.subscription_tier)}</td>
                    <td className="px-3 py-3">{statusBadge(user.subscription_status)}</td>
                    <td className="px-3 py-3 text-center text-gray-400">{user.rounds_count}</td>
                    <td className="px-3 py-3 text-center text-gray-400">{user.swings_count}</td>
                    <td className="px-3 py-3 text-gray-500 text-xs">{user.created_at ? format(parseISO(user.created_at), 'MMM d, yyyy') : '-'}</td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-600">No users found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        {selectedUser && userDetail && (
          <div className="w-1/2">
            <div className="bg-gray-900/40 border border-gray-800/40 rounded-2xl p-6 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">{userDetail.profile?.display_name || 'User'}</h3>
                <button onClick={() => { setSelectedUser(null); setUserDetail(null) }} className="text-gray-500 hover:text-white text-lg">✕</button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="text-gray-300">{userDetail.profile?.email}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Handicap</span><span className="text-gray-300">{userDetail.profile?.handicap || 'Not set'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Home Course</span><span className="text-gray-300">{userDetail.profile?.home_course || 'Not set'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Goals</span><span className="text-gray-300">{userDetail.profile?.goals || 'Not set'}</span></div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Subscription</span>
                  <select value={userDetail.profile?.subscription_tier} onChange={e => updateSubscription(selectedUser, e.target.value, 'active')}
                    className="px-2 py-1 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white">
                    <option value="free">Free</option><option value="premium">Premium</option><option value="pro">Pro</option>
                  </select>
                </div>
                <div className="flex justify-between"><span className="text-gray-500">Joined</span><span className="text-gray-300">{userDetail.profile?.created_at ? format(parseISO(userDetail.profile.created_at), 'MMM d, yyyy') : '-'}</span></div>
              </div>
              <div className="mt-6">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Recent Rounds ({userDetail.rounds.length})</h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {userDetail.rounds.slice(0, 10).map(r => (
                    <div key={r.id} className="flex justify-between text-xs bg-gray-800/40 rounded-lg px-3 py-2">
                      <span className="text-gray-300">{r.course_name}</span>
                      <div className="flex gap-3"><span className="text-white font-bold">{r.total_score}</span><span className="text-gray-500">{r.date_played}</span></div>
                    </div>
                  ))}
                  {userDetail.rounds.length === 0 && <p className="text-gray-600 text-xs">No rounds logged</p>}
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">AI Coach ({userDetail.conversations.length} conversations)</h4>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {userDetail.conversations.slice(0, 5).map(c => (
                    <div key={c.id} className="flex justify-between text-xs bg-gray-800/40 rounded-lg px-3 py-2">
                      <span className="text-gray-300">{c.topic || 'General'}</span>
                      <span className="text-gray-500">{c.messages ? (Array.isArray(c.messages) ? c.messages.length : 0) : 0} msgs</span>
                    </div>
                  ))}
                </div>
              </div>
              {userDetail.tickets.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Support Tickets ({userDetail.tickets.length})</h4>
                  <div className="space-y-1.5">
                    {userDetail.tickets.map(t => (
                      <div key={t.id} className="flex justify-between text-xs bg-gray-800/40 rounded-lg px-3 py-2">
                        <span className="text-gray-300">{t.subject}</span>
                        <span className={`${t.status === 'open' ? 'text-yellow-400' : 'text-gray-500'}`}>{t.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
