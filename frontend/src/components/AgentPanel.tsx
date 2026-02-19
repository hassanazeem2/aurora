'use client'
import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSimStore } from '@/store/simStore'

const PHASE_COLORS: Record<string, string> = {
  recon: '#00F5D4', analysis: '#FFB800', planning: '#9D4EDD',
  exploit: '#FF4D6D', escalate: '#FF4D6D', lateral: '#9D4EDD',
  complete: '#2BE88C', idle: '#8B98A5',
}

const PHASE_ICONS: Record<string, string> = {
  recon: '🔍', analysis: '⚠️', planning: '🧠',
  exploit: '💥', escalate: '⬆️', lateral: '↔️',
  complete: '✅', idle: '⏸',
}

export default function AgentPanel() {
  const { thoughts, confidence, detectRisk } = useSimStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [thoughts.length])

  return (
    <div className="flex flex-col h-full">
      {/* Panel header with live meters */}
      <div style={{ borderBottom: '1px solid #1e2d42', padding: '12px 16px' }}>
        <div className="flex items-center justify-between mb-3">
          <span style={{ color: '#9D4EDD', fontSize: 11, fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase' }}>
            🧠 Agent Reasoning
          </span>
          <span style={{ color: '#8B98A5', fontSize: 9, fontFamily: 'monospace' }}>
            {thoughts.length} events
          </span>
        </div>
        {/* Mini meters */}
        <div className="flex gap-3">
          <MiniBar label="Breach Conf" value={confidence} color="#00F5D4"/>
          <MiniBar label="Detect Risk" value={detectRisk} color="#FF4D6D"/>
        </div>
      </div>

      {/* Thoughts stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3" style={{ scrollBehavior: 'smooth' }}>
        <AnimatePresence>
          {thoughts.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ textAlign: 'center', marginTop: 40, color: '#8B98A5', fontSize: 11, fontFamily: 'monospace', lineHeight: 2 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🤖</div>
              Agent idle<br/>
              <span style={{ fontSize: 9 }}>Start simulation to observe reasoning</span>
            </motion.div>
          ) : (
            thoughts.map((t, i) => (
              <motion.div key={t.id || i}
                initial={{ opacity: 0, x: -16, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                style={{ marginBottom: 8 }}>
                <div style={{
                  background: '#0a1018',
                  border: `1px solid ${PHASE_COLORS[t.phase] || '#8B98A5'}33`,
                  borderLeft: `3px solid ${PHASE_COLORS[t.phase] || '#8B98A5'}`,
                  borderRadius: 10,
                  padding: '10px 12px',
                }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ fontSize: 10 }}>{PHASE_ICONS[t.phase] || '●'}</span>
                    <span style={{
                      color: PHASE_COLORS[t.phase] || '#8B98A5',
                      fontSize: 9, fontFamily: 'monospace', fontWeight: 'bold',
                      textTransform: 'uppercase', letterSpacing: 1,
                    }}>{t.phase}</span>
                  </div>
                  <p style={{ color: '#b0c4d8', fontSize: 10, fontFamily: 'monospace', lineHeight: 1.6, margin: 0 }}>
                    {t.message}
                  </p>
                  <div className="flex gap-3 mt-2">
                    <span style={{ color: '#2BE88C', fontSize: 8, fontFamily: 'monospace' }}>
                      CONF: {(t.confidence ?? 0).toFixed(1)}%
                    </span>
                    <span style={{ color: '#FF4D6D', fontSize: 8, fontFamily: 'monospace' }}>
                      DETECT: {(t.detection_risk ?? 0).toFixed(1)}%
                    </span>
                    <span style={{ color: '#8B98A5', fontSize: 8, fontFamily: 'monospace', marginLeft: 'auto' }}>
                      {t.timestamp != null ? new Date(t.timestamp * 1000).toLocaleTimeString() : '—'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function MiniBar({ label, value, color }: { label: string; value: number; color: string }) {
  const safeValue = value ?? 0
  return (
    <div style={{ flex: 1 }}>
      <div className="flex justify-between mb-1">
        <span style={{ color: '#8B98A5', fontSize: 8, fontFamily: 'monospace', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ color, fontSize: 8, fontFamily: 'monospace', fontWeight: 'bold' }}>{safeValue.toFixed(1)}%</span>
      </div>
      <div style={{ height: 4, background: '#1e2d42', borderRadius: 2, overflow: 'hidden' }}>
        <motion.div
          style={{ height: '100%', background: color, borderRadius: 2, boxShadow: `0 0 6px ${color}` }}
          animate={{ width: `${safeValue}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
