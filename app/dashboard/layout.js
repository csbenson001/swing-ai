'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

const nav = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/users', label: 'Users', icon: '👥' },
  { href: '/dashboard/subscriptions', label: 'Subscriptions', icon: '💳' },
  { href: '/dashboard/support', label: 'Support', icon: '🎫' },
  { href: '/dashboard/feedback', label: 'Feedback', icon: '💬' },
  { href: '/dashboard/ai-analytics', label: 'AI Coach', icon: '🤖' },
  { href: '/dashboard/content', label: 'Content', icon: '📝' },
]

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('swingai_admin')) {
        router.push('/')
      } else {
        setReady(true)
      }
    }
  }, [router])

  if (!ready) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <aside className="w-64 bg-gray-900/60 border-r border-gray-800/50 flex flex-col fixed h-full">
        <div className="p-6 border-b border-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-900/40 border border-green-700/30 flex items-center justify-center text-lg">⛳</div>
            <div>
              <h1 className="font-bold text-white text-lg leading-tight">SwingAI</h1>
              <p className="text-xs text-gray-500">Admin Portal</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-green-900/30 text-green-400 border border-green-800/40' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'}`}>
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gray-800/50">
          <button onClick={() => { localStorage.removeItem('swingai_admin'); router.push('/') }}
            className="w-full px-4 py-2 text-sm text-gray-500 hover:text-red-400 hover:bg-red-900/10 rounded-xl transition-colors">
            Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  )
}
