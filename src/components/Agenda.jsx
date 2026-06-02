import { useEffect, useState, useCallback } from 'react'
import { supabase, isConfigured } from '../lib/supabase'
import { useUser, USERS } from '../context/UserContext'

// ── constants ────────────────────────────────────────────────────────────────
const STATUS = {
  pendente:   { label: 'Pendente',   dot: 'bg-amber-400',  badge: 'text-amber-400 border-amber-400/30 bg-amber-400/5' },
  confirmado: { label: 'Confirmado', dot: 'bg-blue-400',   badge: 'text-blue-400  border-blue-400/30  bg-blue-400/5'  },
  entregue:   { label: 'Entregue',   dot: 'bg-lime',       badge: 'text-lime      border-lime/30       bg-lime/5'      },
  cancelado:  { label: 'Cancelado',  dot: 'bg-snow/20',    badge: 'text-snow/30   border-snow/10       bg-snow/5'      },
}

const TYPE = {
  captacao: { label: 'Captação',     emoji: '📅' },
  video:    { label: 'Vídeo',        emoji: '🎬' },
  arte:     { label: 'Arte Gráfica', emoji: '🎨' },
}

const DETAIL_LABELS = {
  captacao: { tipo: 'Tipo', data: 'Data sugerida', hora: 'Horário', local: 'Local', obs: 'Obs.' },
  video:    { tipo: 'Tipo', gravado: 'Material gravado', prazo: 'Prazo desejado', desc: 'Descrição' },
  arte:     { tipo: 'Tipo', formato: 'Formato', cores: 'Cores / Estilo', prazo: 'Prazo desejado', desc: 'Descrição' },
}

const WEEKDAYS  = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']
const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                   'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

const today = new Date().toISOString().split('T')[0]

// ── helpers ───────────────────────────────────────────────────────────────────
function getDays(year, month) {
  const firstDay  = new Date(year, month, 1)
  const lastDate  = new Date(year, month + 1, 0).getDate()
  let startOffset = firstDay.getDay() - 1
  if (startOffset < 0) startOffset = 6
  const days = []
  for (let i = 0; i < startOffset; i++) days.push(null)
  for (let d = 1; d <= lastDate; d++) days.push(d)
  while (days.length % 7 !== 0) days.push(null)
  return days
}

function dateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
}

function fmtDate(d) {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function userName(id) {
  return USERS.find(u => u.id === id)?.name ?? id
}

// ── DemandCard ────────────────────────────────────────────────────────────────
function DemandCard({ demand: d, isProvider, userId, onUpdate }) {
  const [showCancel, setShowCancel] = useState(false)

  const update = async (patch) => {
    await supabase.from('demands').update(patch).eq('id', d.id)
    onUpdate()
  }

  const deleteDemand = async () => {
    if (!window.confirm('Deletar esta demanda permanentemente?')) return
    await supabase.from('demands').delete().eq('id', d.id)
    onUpdate()
  }

  const s = STATUS[d.status] ?? STATUS.pendente

  return (
    <div className={`bg-card border-l-2 border border-border/60 p-4
      ${d.status === 'pendente'   ? 'border-l-amber-400'
      : d.status === 'confirmado' ? 'border-l-blue-400'
      : d.status === 'entregue'   ? 'border-l-lime'
      :                             'border-l-snow/20'}`}>

      {/* header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base leading-none">{TYPE[d.type]?.emoji}</span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-snow/50">
            {TYPE[d.type]?.label}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 border ${s.badge}`}>
            {s.label}
          </span>
          {isProvider && (
            <button onClick={deleteDemand} title="Deletar demanda"
              className="text-snow/20 hover:text-red-400 transition-colors duration-150 p-0.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* meta */}
      <p className="font-display font-bold text-snow text-sm mb-1">{d.client_name}</p>
      <p className="text-[10px] text-snow/30 mb-3">
        Enviado em {fmtDate(d.created_at?.split('T')[0])}
        {d.assigned_to ? ` · Responsável: ${userName(d.assigned_to)}` : ''}
      </p>

      {/* scheduled date (if confirmed) */}
      {d.scheduled_date && (
        <div className="flex items-center gap-2 mb-3 bg-blue-400/5 border border-blue-400/20 px-3 py-2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span className="text-xs font-bold text-blue-400">
            {fmtDate(d.scheduled_date)}{d.scheduled_time ? ` às ${d.scheduled_time.slice(0,5)}` : ''}
          </span>
        </div>
      )}

      {/* details */}
      <div className="flex flex-col gap-1 mb-4">
        {Object.entries(d.details || {})
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k} className="flex gap-2 text-xs">
              <span className="text-snow/30 w-28 shrink-0">{DETAIL_LABELS[d.type]?.[k] ?? k}</span>
              <span className="text-snow/65">{v}</span>
            </div>
          ))}
      </div>

      {/* provider actions */}
      {isProvider && (
        <div className="border-t border-border pt-3 mt-1 flex flex-col gap-2">

          {d.status === 'pendente' && !showCancel && (
            <div className="flex gap-2">
              <button onClick={() => update({ status: 'confirmado', assigned_to: userId })}
                className="flex-1 py-2 text-[10px] font-bold tracking-widest uppercase transition-all"
                style={{ backgroundColor:'#C6FF00', color:'#080808' }}>
                Confirmar
              </button>
              <button onClick={() => setShowCancel(true)}
                className="px-4 py-2 border border-border text-[10px] font-bold tracking-widest
                           uppercase text-snow/40 hover:text-snow/70 hover:border-snow/30 transition-all">
                Cancelar
              </button>
            </div>
          )}

          {d.status === 'confirmado' && !showCancel && (
            <div className="flex gap-2">
              <button onClick={() => update({ status: 'entregue' })}
                className="flex-1 py-2 text-[10px] font-bold tracking-widest uppercase transition-all"
                style={{ backgroundColor:'#C6FF00', color:'#080808' }}>
                ✓ Marcar como entregue
              </button>
              <button onClick={() => setShowCancel(true)}
                className="px-4 py-2 border border-border text-[10px] font-bold tracking-widest
                           uppercase text-snow/40 hover:text-snow/70 hover:border-snow/30 transition-all">
                Cancelar
              </button>
            </div>
          )}

          {showCancel && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-snow/60">Cancelar esta demanda?</p>
              <div className="flex gap-2">
                <button onClick={() => { update({ status: 'cancelado' }); setShowCancel(false) }}
                  className="flex-1 py-2 text-[10px] font-bold tracking-widest uppercase border
                             border-snow/20 text-snow/50 hover:border-snow/50 hover:text-snow transition-all">
                  Sim, cancelar
                </button>
                <button onClick={() => setShowCancel(false)}
                  className="flex-1 py-2 text-[10px] font-bold tracking-widest uppercase transition-all"
                  style={{ backgroundColor:'#C6FF00', color:'#080808' }}>
                  Manter
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Agenda ────────────────────────────────────────────────────────────────────
export default function Agenda() {
  const { user } = useUser()
  const isProvider = user?.role === 'provider'

  const [demands,      setDemands]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType,   setFilterType]   = useState('all')
  const [selectedDay,  setSelectedDay]  = useState(null)
  const [currentMonth, setCurrentMonth] = useState(() => new Date())

  const year  = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const days  = getDays(year, month)

  const fetchDemands = useCallback(async () => {
    if (!isConfigured) { setLoading(false); return }
    const { data } = await supabase.from('demands').select('*').order('created_at', { ascending: false })
    setDemands(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchDemands()
    if (!isConfigured) return
    const ch = supabase.channel('agenda-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'demands' }, fetchDemands)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [fetchDemands])

  const prevMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const nextMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))

  const getDate = (d) => d.scheduled_date || d.details?.data || null

  const demandsOnDay = (day) =>
    day ? demands.filter(d => getDate(d) === dateStr(year, month, day)) : []

  const agendamentosOnDay = (day) =>
    day ? demands.filter(d =>
      getDate(d) === dateStr(year, month, day) &&
      ['confirmado', 'pendente'].includes(d.status)
    ) : []

  const entregasOnDay = (day) =>
    day ? demands.filter(d =>
      getDate(d) === dateStr(year, month, day) &&
      d.status === 'entregue'
    ) : []

  const selectedDateStr = selectedDay ? dateStr(year, month, selectedDay) : null

  const filtered = demands.filter(d => {
    if (filterStatus !== 'all' && d.status !== filterStatus) return false
    if (filterType   !== 'all' && d.type   !== filterType)   return false
    if (selectedDateStr) return getDate(d) === selectedDateStr
    return true
  })

  // pending count badge
  const pendingCount = demands.filter(d => d.status === 'pendente').length

  if (!isConfigured) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <div className="w-14 h-14 rounded-full border border-border flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C6FF00" strokeWidth="1.5">
            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          </svg>
        </div>
        <div>
          <p className="font-display font-bold text-snow text-lg mb-1">Supabase não configurado</p>
          <p className="text-snow/40 text-sm max-w-xs leading-relaxed">
            Siga o <span className="text-lime">SUPABASE_SETUP.md</span> para conectar o banco de dados e ativar o calendário em tempo real.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <p className="text-[10px] font-bold tracking-[.2em] uppercase text-lime">Agenda</p>
          {pendingCount > 0 && (
            <span className="text-[10px] font-bold bg-amber-400 text-ink px-1.5 py-0.5 leading-none">
              {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <h2 className="font-display font-extrabold text-snow leading-tight"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>
          Todas as demandas
        </h2>
      </div>

      {/* Calendar */}
      <div className="bg-card border border-border p-4">
        {/* month nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth}
            className="p-1.5 hover:bg-snow/5 text-snow/50 hover:text-snow transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <span className="font-display font-bold text-snow text-sm uppercase tracking-wider">
            {MONTHS_PT[month]} {year}
          </span>
          <button onClick={nextMonth}
            className="p-1.5 hover:bg-snow/5 text-snow/50 hover:text-snow transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

        {/* weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-center text-[9px] font-bold uppercase text-snow/25 py-1">{d}</div>
          ))}
        </div>

        {/* day cells */}
        <div className="grid grid-cols-7 gap-0.5">
          {days.map((day, i) => {
            if (!day) return <div key={i} />
            const ds           = dateStr(year, month, day)
            const agendamentos = agendamentosOnDay(day)
            const entregas     = entregasOnDay(day)
            const hasEvents    = agendamentos.length > 0 || entregas.length > 0
            const isToday      = ds === today
            const isSel        = selectedDay === day
            // Cor de fundo do dia
            const bgColor = isSel
              ? 'bg-lime/20 border border-lime text-lime'
              : entregas.length > 0 && agendamentos.length === 0
                ? 'bg-lime text-ink font-extrabold'
                : agendamentos.length > 0
                  ? 'bg-amber-400 text-ink font-extrabold'
                  : isToday
                    ? 'border border-snow/30 text-snow'
                    : 'text-snow/40 hover:bg-snow/5'

            return (
              <button key={i} onClick={() => setSelectedDay(isSel ? null : day)}
                className={`relative flex flex-col items-center justify-center min-h-[3rem] transition-all duration-150 ${bgColor}`}>
                <span className="text-xs font-bold leading-none">{day}</span>
                {/* Ambos agendamento e entrega no mesmo dia */}
                {agendamentos.length > 0 && entregas.length > 0 && (
                  <div className="flex gap-0.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-ink/40" />
                    <span className="w-1.5 h-1.5 rounded-full bg-lime" />
                  </div>
                )}
                {(agendamentos.length > 1 && entregas.length === 0) && (
                  <span className="text-[8px] font-extrabold mt-0.5 text-ink/60">×{agendamentos.length}</span>
                )}
                {(entregas.length > 1 && agendamentos.length === 0) && (
                  <span className="text-[8px] font-extrabold mt-0.5 text-ink/60">×{entregas.length}</span>
                )}
              </button>
            )
          })}
        </div>

        {/* dot legend */}
        <div className="flex items-center gap-5 mt-3 pt-3 border-t border-border justify-center flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-[9px] uppercase tracking-wider text-snow/40">Agendamento</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-lime" />
            <span className="text-[9px] uppercase tracking-wider text-snow/40">Entrega</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2">
        {/* status filter */}
        <div className="flex gap-1 flex-wrap">
          {[['all','Todos'], ['pendente','Pendente'], ['confirmado','Confirmado'], ['entregue','Entregue'], ['cancelado','Cancelado']].map(([v, l]) => (
            <button key={v} onClick={() => setFilterStatus(v)}
              className={`px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase border transition-all
                ${filterStatus === v
                  ? 'border-lime/40 bg-lime/5 text-lime'
                  : 'border-border text-snow/40 hover:border-snow/20 hover:text-snow/70'}`}>
              {l}
            </button>
          ))}
        </div>
        {/* type filter */}
        <div className="flex gap-1 flex-wrap">
          {[['all','Tudo'], ['captacao','📅 Captação'], ['video','🎬 Vídeo'], ['arte','🎨 Arte']].map(([v, l]) => (
            <button key={v} onClick={() => setFilterType(v)}
              className={`px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase border transition-all
                ${filterType === v
                  ? 'border-lime/40 bg-lime/5 text-lime'
                  : 'border-border text-snow/40 hover:border-snow/20 hover:text-snow/70'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Selected day banner */}
      {selectedDay && (
        <div className="flex items-center justify-between bg-lime/5 border border-lime/20 px-4 py-2">
          <span className="text-xs font-bold text-lime">
            {fmtDate(dateStr(year, month, selectedDay))}
            {' · '}{filtered.length} demanda{filtered.length !== 1 ? 's' : ''}
          </span>
          <button onClick={() => setSelectedDay(null)} className="text-lime/50 hover:text-lime text-xs">✕</button>
        </div>
      )}

      {/* Demand list */}
      {loading ? (
        <div className="text-center py-12 text-snow/30 text-sm">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-snow/25 text-sm">
          {demands.length === 0 ? 'Nenhuma demanda ainda.' : 'Nenhum item com esses filtros.'}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(d => (
            <DemandCard key={d.id} demand={d} isProvider={isProvider}
                        userId={user?.id} onUpdate={fetchDemands} />
          ))}
        </div>
      )}
    </div>
  )
}
