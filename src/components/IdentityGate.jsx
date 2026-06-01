import { useState } from 'react'
import { useUser, USERS } from '../context/UserContext'

const PROVIDER_PIN = '2003'

export default function IdentityGate() {
  const { login } = useUser()
  const [selected, setSelected] = useState(null)
  const [pin,      setPin]      = useState('')
  const [error,    setError]    = useState(false)

  const handleSelect = (user) => {
    if (user.role === 'client') {
      login(user.id)
    } else {
      setSelected(user)
      setPin('')
      setError(false)
    }
  }

  const handlePin = (digit) => {
    if (pin.length >= 4) return
    const next = pin + digit
    setPin(next)
    setError(false)
    if (next.length === 4) {
      if (next === PROVIDER_PIN) {
        setTimeout(() => login(selected.id), 150)
      } else {
        setTimeout(() => { setPin(''); setError(true) }, 400)
      }
    }
  }

  const handleBack = () => {
    setPin(p => p.slice(0, -1))
    setError(false)
  }

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-xs">

        <div className="text-center mb-10">
          <span className="font-display font-extrabold text-2xl">
            opablo<span className="text-lime">films</span>
          </span>
          <p className="text-snow/40 text-sm mt-2 tracking-wide">Portal exclusivo · Quem é você?</p>
        </div>

        {/* Seleção de usuário */}
        {!selected && (
          <div className="flex flex-col gap-2">
            {USERS.map(u => (
              <button key={u.id} onClick={() => handleSelect(u)}
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
        )}

        {/* PIN para prestador */}
        {selected && (
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <p className="font-display font-bold text-snow text-lg">{selected.name}</p>
              <p className="text-snow/40 text-xs mt-1 tracking-wide">Digite o PIN de acesso</p>
            </div>

            {/* Dots */}
            <div className="flex gap-4">
              {[0,1,2,3].map(i => (
                <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-150
                  ${error
                    ? 'border-red-400 bg-red-400'
                    : i < pin.length
                      ? 'border-lime bg-lime'
                      : 'border-border bg-transparent'}`} />
              ))}
            </div>

            {error && (
              <p className="text-xs text-red-400 -mt-3">PIN incorreto. Tente novamente.</p>
            )}

            {/* Teclado numérico */}
            <div className="grid grid-cols-3 gap-2 w-full">
              {[1,2,3,4,5,6,7,8,9].map(n => (
                <button key={n} onClick={() => handlePin(String(n))}
                  className="bg-card border border-border text-snow font-display font-bold text-xl
                             py-4 hover:border-lime/40 hover:text-lime transition-all duration-150 active:scale-95">
                  {n}
                </button>
              ))}
              <button onClick={() => { setSelected(null); setPin(''); setError(false) }}
                className="bg-card border border-border text-snow/30 text-xs font-bold tracking-widest uppercase
                           py-4 hover:border-snow/20 hover:text-snow/60 transition-all duration-150">
                ←
              </button>
              <button onClick={() => handlePin('0')}
                className="bg-card border border-border text-snow font-display font-bold text-xl
                           py-4 hover:border-lime/40 hover:text-lime transition-all duration-150 active:scale-95">
                0
              </button>
              <button onClick={handleBack}
                className="bg-card border border-border text-snow/30 text-xl
                           py-4 hover:border-snow/20 hover:text-snow/60 transition-all duration-150">
                ⌫
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-[10px] text-snow/20 mt-8 tracking-wide">
          Não compartilhe este link
        </p>
      </div>
    </div>
  )
}
