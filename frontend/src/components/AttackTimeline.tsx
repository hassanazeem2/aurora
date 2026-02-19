'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TimelineEvent } from '@/store/simStore'

export default function AttackTimeline({ timeline }: { timeline: TimelineEvent[] }) {
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <div className="glass flex flex-col" style={{ height: '100%' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #1e2a3a', flexShrink: 0 }}>
        <span style={{ color: '#FFB800', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2 }}>⚔ Attack Timeline</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {timeline.length === 0 ? (
          <div style={{ color: '#8B98A5', fontSize: 10, textAlign: 'center', marginTop: 40 }}>No events yet</div>
        ) : (
          <AnimatePresence>
            {timeline.map((step, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                onClick={() => setExpanded(expanded === i ? null : i)}
                style={{ marginBottom: 8, cursor: 'pointer' }}>
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 12px', borderRadius: 10,
                  background: expanded === i ? `${step.color}11` : 'rgba(18,24,33,0.8)',
                  border: `1px solid ${step.color}33`,
                  transition: 'all 0.2s',
                }}>
                  <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{step.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ color: step.color, fontFamily: 'monospace', fontSize: 11, fontWeight: 'bold' }}>{step.label}</span>
                      <span style={{ background: `${step.color}22`, color: step.color, fontSize: 8, padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace', textTransform: 'uppercase' }}>
                        {step.type}
                      </span>
                    </div>
                    <AnimatePresence>
                      {expanded === i && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                          <p style={{ color: '#8B98A5', fontSize: 10, fontFamily: 'monospace', marginTop: 6, lineHeight: 1.6 }}>{step.detail}</p>
                          {step.targetNode && (
                            <span style={{ color: '#FFB800', fontSize: 9, fontFamily: 'monospace' }}>Target: {step.targetNode}</span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <span style={{ color: '#8B98A5', fontSize: 10, flexShrink: 0 }}>{expanded === i ? '▲' : '▼'}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
