'use client'
import { AgentMode, SimStatus } from '@/store/simStore'

const STATUS_CONFIG: Record<SimStatus, { color: string; label: string }> = {
  idle: { color: '#8B98A5', label: 'IDLE' },
  scanning: { color: '#00F5D4', label: 'SCANNING' },
  executing: { color: '#FFB800', label: 'EXECUTING' },
  compromised: { color: '#FF4D6D', label: 'COMPROMISED' },
}

interface Props {
  status: SimStatus
  mode: AgentMode
  onModeChange: (m: AgentMode) => void
}

export default function TopNav({ status, mode, onModeChange }: Props) {
  const cfg = STATUS_CONFIG[status]
  return (
    <nav style={{
      background: 'rgba(13,21,32,0.95)', borderBottom: '1px solid rgba(0,245,212,0.15)',
      padding: '0 24px', height: 56, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(20px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Logo */}
        <svg width="32" height="32" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="12" fill="none" stroke="#00F5D4" strokeWidth="1.5">
            <animate attributeName="r" values="10;14;10" dur="3s" repeatCount="indefinite"/>
            <animate attributeName="stroke-opacity" values="1;0.3;1" dur="3s" repeatCount="indefinite"/>
          </circle>
          <circle cx="16" cy="16" r="6" fill="#00F5D422" stroke="#00F5D4" strokeWidth="1"/>
          <circle cx="16" cy="16" r="2.5" fill="#00F5D4"/>
        </svg>
        <span style={{ fontFamily: "'Orbitron', monospace", color: '#00F5D4', fontSize: 16, fontWeight: 900, letterSpacing: 4 }}>AURORA</span>
        <div style={{ width: 1, height: 20, background: '#1e2a3a' }}/>
        {/* Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, boxShadow: status !== 'idle' ? `0 0 8px ${cfg.color}` : 'none' }}>
            {status !== 'idle' && (
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, animation: 'pulse-ring 1.5s infinite' }}/>
            )}
          </div>
          <span style={{ color: cfg.color, fontFamily: 'monospace', fontSize: 11, fontWeight: 'bold' }}>{cfg.label}</span>
        </div>
        <span style={{ color: '#8B98A5', fontSize: 9, fontFamily: 'monospace' }}>AURORA v1.0 · SAFE SIMULATION PLATFORM</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Mode toggle */}
        <div style={{ display: 'flex', background: '#0d1520', borderRadius: 8, padding: 3, border: '1px solid #1e2a3a' }}>
          {(['manual', 'assisted', 'autonomous'] as AgentMode[]).map(m => (
            <button key={m} onClick={() => onModeChange(m)}
              style={{
                padding: '3px 10px', borderRadius: 6, fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold', cursor: 'pointer', border: 'none',
                background: mode === m ? '#00F5D422' : 'transparent', color: mode === m ? '#00F5D4' : '#8B98A5',
                textTransform: 'uppercase', transition: 'all 0.2s',
              }}>
              {m}
            </button>
          ))}
        </div>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#9D4EDD,#FF4D6D)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>👤</div>
      </div>
    </nav>
  )
}
