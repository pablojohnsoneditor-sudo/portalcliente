import { useState } from 'react'
import { UserProvider, useUser } from './context/UserContext'
import IdentityGate from './components/IdentityGate'
import Nav from './components/Nav'
import Agenda from './components/Agenda'
import BookCapture from './components/BookCapture'
import RequestVideo from './components/RequestVideo'
import RequestArt from './components/RequestArt'
import Footer from './components/Footer'

const TABS = [
  { id: 'agenda',   label: 'Agenda', icon: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      <line x1="8" y1="14" x2="8" y2="14"/><line x1="12" y1="14" x2="12" y2="14"/>
      <line x1="16" y1="14" x2="16" y2="14"/>
    </svg>
  )},
  { id: 'captacao', label: 'Captação', icon: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  )},
  { id: 'video',    label: 'Vídeo', icon: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
    </svg>
  )},
  { id: 'arte',     label: 'Arte', icon: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
    </svg>
  )},
]

function Portal() {
  const { user } = useUser()
  // providers default to agenda, clients to captacao
  const [tab, setTab] = useState(() => user?.role === 'provider' ? 'agenda' : 'captacao')

  if (!user) return <IdentityGate />

  return (
    <div className="min-h-screen bg-ink text-snow">
      <Nav />

      {/* Tab bar */}
      <div className="sticky top-0 z-40 bg-ink border-b border-border">
        <div className="max-w-2xl mx-auto px-6 flex">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`tab-btn flex items-center justify-center gap-2
                ${tab === t.id ? 'active' : ''}`}>
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden text-[10px]">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        {tab === 'agenda'   && <Agenda />}
        {tab === 'captacao' && <BookCapture />}
        {tab === 'video'    && <RequestVideo />}
        {tab === 'arte'     && <RequestArt />}
      </div>

      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <UserProvider>
      <Portal />
    </UserProvider>
  )
}
