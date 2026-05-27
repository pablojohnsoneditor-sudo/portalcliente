import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useUser } from '../context/UserContext'

// Contatos do Diogo — substitua pelos reais
const WA    = '5500000000001'
const EMAIL = 'diogo@opablofilms.com'

const TIPOS    = ['Thumbnail', 'Post / Feed', 'Stories', 'Banner / Capa', 'Logo / Marca', 'Cartão de visita', 'Outro']
const FORMATOS = ['1080×1080 (Feed)', '1080×1350 (Retrato)', '1920×1080 (YouTube)', '1080×1920 (Stories/Reels)', 'Personalizado']

export default function RequestArt() {
  const ref = useRef(null)
  const { user } = useUser()
  const [form,   setForm]   = useState({ tipo: '', formato: '', cores: '', prazo: '', desc: '' })
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.reveal').forEach((el, i) => setTimeout(() => el.classList.add('visible'), i * 80))
          obs.unobserve(e.target)
        }
      })
    }, { threshold: 0.05 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const isValid = form.tipo

  const buildWAMsg = () => encodeURIComponent(
    `🎨 *Solicitação de Arte Gráfica* (via Portal do Cliente)\n\n` +
    `*Nome:* ${user?.name}\n` +
    `*Tipo:* ${form.tipo}\n` +
    (form.formato ? `*Formato:* ${form.formato}\n` : '') +
    (form.cores   ? `*Cores/Estilo:* ${form.cores}\n` : '') +
    (form.prazo   ? `*Prazo:* ${form.prazo}\n` : '') +
    (form.desc    ? `*Descrição:* ${form.desc}\n` : '')
  )

  const submit = async () => {
    if (!isValid) return
    setStatus('saving')
    const { error } = await supabase.from('demands').insert({
      type:        'arte',
      client_name: user?.name ?? 'Desconhecido',
      subtype:     form.tipo,
      details:     { tipo: form.tipo, formato: form.formato, cores: form.cores, prazo: form.prazo, desc: form.desc },
      status:      'pendente',
      assigned_to: 'diogo',
    })
    if (error) { setStatus('error'); return }
    setStatus('saved')
  }

  const reset = () => { setForm({ tipo: '', formato: '', cores: '', prazo: '', desc: '' }); setStatus('idle') }

  return (
    <section ref={ref} className="flex flex-col gap-6">
      <div className="reveal">
        <p className="text-[10px] font-bold tracking-[.2em] uppercase text-lime mb-1">Solicitar</p>
        <h2 className="font-display font-extrabold text-snow leading-tight"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>
          Arte Gráfica
        </h2>
        <p className="text-snow/50 text-sm mt-2 leading-relaxed">
          Descreva a arte que precisa. Diogo entra em contato para alinhar referências e entregas.
        </p>
      </div>

      {status === 'saved' ? (
        <div className="reveal bg-card border border-lime/30 p-10 text-center flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-lime/10 border border-lime/30 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C6FF00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div>
            <p className="font-display font-bold text-snow text-xl mb-1">Demanda registrada!</p>
            <p className="text-snow/50 text-sm mb-4">Diogo entra em contato em breve para alinhar o projeto.</p>
            <a href={`https://wa.me/${WA}?text=${buildWAMsg()}`} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase
                          border border-lime/30 text-lime px-4 py-2.5 hover:bg-lime/5 transition-colors">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.845L.057 23.516a.5.5 0 0 0 .608.63l5.788-1.516A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.898 0-3.677-.526-5.193-1.437l-.372-.222-3.863 1.013 1.03-3.764-.242-.389A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              Notificar Diogo via WhatsApp (opcional)
            </a>
          </div>
          <button onClick={reset}
            className="text-xs font-bold tracking-widest uppercase text-snow/30
                       hover:text-snow/60 transition-colors mt-2">
            Nova solicitação
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="reveal bg-card border border-border px-4 py-2.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-lime" />
            <span className="text-xs text-snow/60">Enviando como <span className="text-snow font-bold">{user?.name}</span></span>
          </div>

          <div className="reveal flex flex-col gap-1.5">
            <label className="text-[10px] font-bold tracking-widest uppercase text-snow/60">Tipo de arte *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TIPOS.map(t => (
                <button key={t} type="button" onClick={() => setForm(f => ({ ...f, tipo: t }))}
                  className={`p-3 border text-left text-xs font-bold transition-all duration-150
                    ${form.tipo === t
                      ? 'border-lime bg-lime/5 text-lime'
                      : 'border-border bg-card text-snow/60 hover:border-snow/20 hover:text-snow'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="reveal flex flex-col gap-1.5">
            <label className="text-[10px] font-bold tracking-widest uppercase text-snow/60">Formato / Dimensões</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FORMATOS.map(f => (
                <button key={f} type="button" onClick={() => setForm(prev => ({ ...prev, formato: f }))}
                  className={`p-3 border text-left text-xs font-bold transition-all duration-150
                    ${form.formato === f
                      ? 'border-lime bg-lime/5 text-lime'
                      : 'border-border bg-card text-snow/60 hover:border-snow/20 hover:text-snow'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="reveal flex flex-col gap-1.5">
            <label className="text-[10px] font-bold tracking-widest uppercase text-snow/60">Cores / Estilo</label>
            <input value={form.cores} onChange={set('cores')} className="inp"
              placeholder="Ex: tons escuros, dourado, minimalista..." />
          </div>

          <div className="reveal flex flex-col gap-1.5">
            <label className="text-[10px] font-bold tracking-widest uppercase text-snow/60">Prazo desejado</label>
            <input type="date" value={form.prazo} onChange={set('prazo')} className="inp" />
          </div>

          <div className="reveal flex flex-col gap-1.5">
            <label className="text-[10px] font-bold tracking-widest uppercase text-snow/60">Descrição / Referências</label>
            <textarea value={form.desc} onChange={set('desc')} rows={4} className="inp resize-none"
              placeholder="Descreva o que precisa, links de referência, texto que deve constar..." />
          </div>

          {status === 'error' && (
            <p className="text-xs text-red-400 text-center">Erro ao registrar. Verifique a configuração do Supabase.</p>
          )}

          <button onClick={submit} disabled={!isValid || status === 'saving'}
            className="reveal w-full py-4 text-xs font-bold tracking-widest uppercase
                       transition-all duration-150 disabled:opacity-40"
            style={{ backgroundColor: '#C6FF00', color: '#080808' }}>
            {status === 'saving' ? 'Enviando...' : 'Enviar solicitação →'}
          </button>
          <p className="reveal text-[10px] text-snow/25 text-center">Campos com * são obrigatórios</p>
        </div>
      )}
    </section>
  )
}
