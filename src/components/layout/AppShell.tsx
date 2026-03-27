'use client'
import Sidebar from '@/components/layout/Sidebar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <main
        className="main-content"
        style={{ marginLeft: 248, flex: 1, minHeight: '100vh', background: 'var(--bg-primary)' }}
      >
        {children}
      </main>
    </div>
  )
}
