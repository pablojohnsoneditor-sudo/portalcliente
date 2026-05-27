import { useUser, USERS } from '../context/UserContext'

export default function IdentityGate() {
  const { login } = useUser()

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-xs">

        <div className="text-center mb-10">
          <span className="font-display font-extrabold text-2xl">
            opablo<span className="text-lime">films</span>
          </span>
          <p className="text-snow/40 text-sm mt-2 tracking-wide">Portal exclusivo · Quem é você?</p>
        </div>

        <div className="flex flex-col gap-2">
          {USERS.map(u => (
            <button key={u.id} onClick={() => login(u.id)}
              className="w-full p-4 border border-border bg-card text-left
                         hover:border-lime/50 hover:bg-lime/5 transition-all duration-150 group">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-lg text-snow group-hover:text-lime transition-colors">
                  {u.name}
                </span>
                <span className={`text-[10px] font-bold tracking-widest uppercase
                  ${u.role === 'provider' ? 'text-lime/60' : 'text-snow/25'}`}>
                  {u.role === 'provider' ? 'Equipe' : 'Cliente'}
                </span>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-[10px] text-snow/20 mt-8 tracking-wide">
          Não compartilhe este link
        </p>
      </div>
    </div>
  )
}
