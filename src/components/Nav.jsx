import { useUser } from '../context/UserContext'

export default function Nav() {
  const { user, logout } = useUser()

  return (
    <header className="px-6 py-5 flex items-center justify-between border-b border-border">
      <span className="font-display font-extrabold text-lg tracking-tight">
        opablo<span className="text-lime">films</span>
      </span>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
            <span className="text-xs font-bold text-snow/70">{user.name}</span>
            <button onClick={logout}
              className="text-[10px] font-bold tracking-widest uppercase text-snow/25
                         hover:text-snow/60 transition-colors border-b border-transparent hover:border-snow/30">
              Trocar
            </button>
          </>
        ) : (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
            <span className="text-[10px] font-bold tracking-[.2em] uppercase text-snow/40">
              Portal Exclusivo
            </span>
          </>
        )}
      </div>
    </header>
  )
}
