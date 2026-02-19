'use client'
import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useSimStore, AgentMode } from '@/store/simStore'
import { ATTACK_SEQUENCE, AGENT_THOUGHTS, INITIAL_EDGES } from '@/lib/mockData'
import TopNav from '@/components/TopNav'
import NetworkMap from '@/components/NetworkMap'
import AgentPanel from '@/components/AgentPanel'
import AttackTimeline from '@/components/AttackTimeline'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

function NeonButton({ onClick, disabled, children, variant = 'primary' }: {
  onClick: () => void; disabled?: boolean; children: React.ReactNode; variant?: 'primary' | 'secondary'
}) {
  return (
    <motion.button
      onClick={onClick} disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.05, y: disabled ? 0 : -2 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      style={{
        background: variant === 'primary' ? 'linear-gradient(135deg, #00F5D4, #9D4EDD)' : 'transparent',
        border: variant === 'secondary' ? '1px solid #00F5D488' : 'none',
        borderRadius: 999, padding: '8px 20px',
        color: variant === 'primary' ? '#0B0F14' : '#00F5D4',
        fontFamily: 'monospace', fontWeight: 'bold', fontSize: 12,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: '0 0 15px rgba(0,245,212,0.35)',
        transition: 'box-shadow 0.2s', opacity: disabled ? 0.5 : 1,
      }}>
      {children}
    </motion.button>
  )
}

export default function Home() {
  const store = useSimStore()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const resetSim = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    store.reset()
  }

  const startSim = () => {
    if (store.running) return
    resetSim()
    store.setRunning(true)
    store.setStatus('scanning')

    let step = 0
    let thoughtIdx = 0

    intervalRef.current = setInterval(() => {
      if (step >= ATTACK_SEQUENCE.length) {
        clearInterval(intervalRef.current!)
        store.setStatus('compromised')
        store.setRunning(false)
        return
      }

      const atk = ATTACK_SEQUENCE[step]
      store.setActiveNode(atk.targetNode)
      store.addTimelineEvent({ ...atk, timestamp: new Date().toLocaleTimeString() })

      if (atk.compromise) {
        store.addCompromised(atk.compromise)
        store.setStatus('executing')
      }
      if (atk.type === 'recon') store.setStatus('scanning')
      if (atk.type === 'complete') store.setStatus('compromised')

      const newThoughts = AGENT_THOUGHTS.slice(thoughtIdx, thoughtIdx + 2)
      const now = new Date().toLocaleTimeString()
      newThoughts.forEach(t => store.addThought({ ...t, timestamp: now }))
      thoughtIdx = Math.min(thoughtIdx + 2, AGENT_THOUGHTS.length)

      const latest = AGENT_THOUGHTS[Math.min(thoughtIdx - 1, AGENT_THOUGHTS.length - 1)]
      store.setConfidence(latest.conf)
      store.setDetectRisk(latest.detect)
      store.addMetric({ t: `T+${step}`, conf: latest.conf, detect: latest.detect, exposure: Math.round(latest.conf * 0.6 + latest.detect * 0.4) })

      step++
    }, 2200)
  }

  const { status, mode, nodes, compromised, timeline, thoughts, metrics, confidence, detectRisk, activeNode } = store

  return (
    <div style={{ background: '#0B0F14', minHeight: '100vh' }}>
      <TopNav status={status} mode={mode} onModeChange={(m: AgentMode) => store.setMode(m)} />

      <div style={{ padding: '20px 24px', maxWidth: 1600, margin: '0 auto' }}>

        {/* TOP STATS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 16 }}>

          {/* Network Status */}
          <motion.div className="glass" style={{ padding: 16 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: '#8B98A5', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2 }}>Network Status</span>
              <span style={{ color: '#00F5D4', fontSize: 10 }}>{nodes.length - 1} hosts</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Compromised', val: compromised.length, color: '#FF4D6D' },
                { label: 'Secure', val: nodes.length - 1 - compromised.length, color: '#2BE88C' },
                { label: 'High Risk', val: nodes.filter(n => n.risk > 65).length, color: '#FFB800' },
                { label: 'Vulns Found', val: timeline.filter(t => t.type === 'vuln').length * 3, color: '#9D4EDD' },
              ].map(s => (
                <div key={s.label} style={{ background: '#0d1520', borderRadius: 8, padding: '8px 12px', border: `1px solid ${s.color}22` }}>
                  <div style={{ color: s.color, fontSize: 20, fontWeight: 'bold', fontFamily: "'Orbitron', monospace" }}>{s.val}</div>
                  <div style={{ color: '#8B98A5', fontSize: 9, textTransform: 'uppercase' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Attack Path Probability */}
          <motion.div className="glass" style={{ padding: 16 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div style={{ marginBottom: 12 }}>
              <span style={{ color: '#8B98A5', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2 }}>Attack Path Probability</span>
            </div>
            <ResponsiveContainer width="100%" height={110}>
              <BarChart data={[{ path:'Path A',prob:78},{path:'Path B',prob:54},{path:'Path C',prob:42},{path:'Path D',prob:23}]} margin={{ top:0,right:0,left:-30,bottom:0 }}>
                <XAxis dataKey="path" tick={{ fontSize:9,fill:'#8B98A5',fontFamily:'monospace' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:9,fill:'#8B98A5' }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background:'#0d1520',border:'1px solid #9D4EDD33',borderRadius:8,fontSize:10 }} cursor={{ fill:'#9D4EDD11' }}/>
                <Bar dataKey="prob" fill="#9D4EDD" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Confidence Meters */}
          <motion.div className="glass" style={{ padding: 16, display: 'flex', flexDirection: 'column' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div style={{ marginBottom: 12 }}>
              <span style={{ color: '#8B98A5', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2 }}>Agent Confidence</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', flex: 1, alignItems: 'center' }}>
              {[{ v: confidence, label: 'Breach %', color: '#00F5D4' }, { v: detectRisk, label: 'Detect Risk', color: '#FF4D6D' }].map(m => {
                const r = 42, circ = 2 * Math.PI * r, dash = (m.v / 100) * circ
                return (
                  <div key={m.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <svg width="110" height="110" viewBox="0 0 110 110">
                      <circle cx="55" cy="55" r={r} fill="none" stroke="#1e2a3a" strokeWidth="8"/>
                      <circle cx="55" cy="55" r={r} fill="none" stroke={m.color} strokeWidth="8"
                        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 55 55)"
                        style={{ filter: `drop-shadow(0 0 6px ${m.color})`, transition: 'stroke-dasharray 1s ease' }}
                      />
                      <text x="55" y="52" textAnchor="middle" fontSize="18" fontWeight="bold" fill={m.color} fontFamily="monospace">{m.v}%</text>
                      <text x="55" y="67" textAnchor="middle" fontSize="9" fill="#8B98A5" fontFamily="monospace">{m.label}</text>
                    </svg>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* NETWORK MAP + AGENT PANEL */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, marginBottom: 16 }}>
          <div className="glass" style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#00F5D4', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2 }}>Live Network Map</span>
                {store.running && <span style={{ color: '#FFB800', fontSize: 9, animation: 'pulse-ring 1.5s infinite' }}>● LIVE</span>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <NeonButton onClick={startSim} disabled={store.running}>
                  {store.running ? '⚙ Running...' : '▶ Start Simulation'}
                </NeonButton>
                <NeonButton onClick={resetSim} variant="secondary">↺ Reset</NeonButton>
              </div>
            </div>
            <div style={{ height: 380 }}>
              <NetworkMap nodes={nodes} edges={INITIAL_EDGES} activeNode={activeNode} compromised={compromised}/>
            </div>
          </div>

          <div style={{ height: 460 }}>
            <AgentPanel thoughts={thoughts}/>
          </div>
        </div>

        {/* TIMELINE + ANALYTICS */}
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 16, marginBottom: 16 }}>
          <div style={{ height: 360 }}>
            <AttackTimeline timeline={timeline}/>
          </div>
          <AnalyticsDashboard metrics={metrics} compromisedCount={compromised.length} timelineLength={timeline.length} confidence={confidence} detectRisk={detectRisk}/>
        </div>

        {/* FOOTER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #1e2a3a', paddingTop: 12 }}>
          <span style={{ color: '#8B98A5', fontSize: 9, fontFamily: 'monospace' }}>⚠ EDUCATIONAL & SIMULATION USE ONLY — NO REAL ATTACKS ARE PERFORMED</span>
          <div style={{ display: 'flex', gap: 16 }}>
            <span style={{ color: '#8B98A5', fontSize: 9 }}>Engine: <span style={{ color: '#9D4EDD' }}>Bayesian Path Scorer v2</span></span>
            <span style={{ color: '#8B98A5', fontSize: 9 }}>Mode: <span style={{ color: '#00F5D4' }}>{mode.toUpperCase()}</span></span>
          </div>
        </div>
      </div>
    </div>
  )
}
