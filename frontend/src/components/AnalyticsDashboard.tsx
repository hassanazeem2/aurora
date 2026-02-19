'use client'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { MetricPoint } from '@/store/simStore'

interface Props {
  metrics: MetricPoint[]
  compromisedCount: number
  timelineLength: number
  confidence: number
  detectRisk: number
}

function CircularMeter({ value, label, color, size = 110 }: { value: number; label: string; color: string; size?: number }) {
  const r = 42
  const circ = 2 * Math.PI * r
  const dash = (value / 100) * circ
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size} viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="#1e2a3a" strokeWidth="8"/>
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 55 55)"
          style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dasharray 1s ease' }}
        />
        <text x="55" y="52" textAnchor="middle" fontSize="17" fontWeight="bold" fill={color} fontFamily="monospace">{value}%</text>
        <text x="55" y="66" textAnchor="middle" fontSize="8" fill="#8B98A5" fontFamily="monospace">{label}</text>
      </svg>
    </div>
  )
}

const tooltipStyle = { background: '#0d1520', border: '1px solid #00F5D433', borderRadius: 8, fontSize: 9, fontFamily: 'monospace' }

export default function AnalyticsDashboard({ metrics, compromisedCount, timelineLength, confidence, detectRisk }: Props) {
  const sessionSecs = Math.round(timelineLength * 2.2)
  const exposureScore = Math.min(100, Math.round(compromisedCount * 22 + detectRisk * 0.3))

  return (
    <div className="glass" style={{ padding: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <span style={{ color: '#8B98A5', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2 }}>📈 Live Metrics</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 16, alignItems: 'start' }}>

        {/* Breach Confidence */}
        <div>
          <div style={{ color: '#00F5D4', fontSize: 9, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Breach Confidence</div>
          <ResponsiveContainer width="100%" height={110}>
            <LineChart data={metrics} margin={{ top: 0, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid stroke="#1e2a3a" strokeDasharray="3 3"/>
              <XAxis dataKey="t" tick={{ fontSize: 8, fill: '#8B98A5' }} axisLine={false} tickLine={false}/>
              <YAxis domain={[0, 100]} tick={{ fontSize: 8, fill: '#8B98A5' }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={tooltipStyle}/>
              <Line type="monotone" dataKey="conf" stroke="#00F5D4" strokeWidth={2} dot={false} style={{ filter: 'drop-shadow(0 0 4px #00F5D4)' }}/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Detection Risk */}
        <div>
          <div style={{ color: '#FF4D6D', fontSize: 9, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Detection Risk</div>
          <ResponsiveContainer width="100%" height={110}>
            <LineChart data={metrics} margin={{ top: 0, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid stroke="#1e2a3a" strokeDasharray="3 3"/>
              <XAxis dataKey="t" tick={{ fontSize: 8, fill: '#8B98A5' }} axisLine={false} tickLine={false}/>
              <YAxis domain={[0, 100]} tick={{ fontSize: 8, fill: '#8B98A5' }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ ...tooltipStyle, border: '1px solid #FF4D6D33' }}/>
              <Line type="monotone" dataKey="detect" stroke="#FF4D6D" strokeWidth={2} dot={false} style={{ filter: 'drop-shadow(0 0 4px #FF4D6D)' }}/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Exposure Index */}
        <div>
          <div style={{ color: '#9D4EDD', fontSize: 9, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>System Exposure Index</div>
          <ResponsiveContainer width="100%" height={110}>
            <BarChart data={metrics.slice(-8)} margin={{ top: 0, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid stroke="#1e2a3a" strokeDasharray="3 3"/>
              <XAxis dataKey="t" tick={{ fontSize: 8, fill: '#8B98A5' }} axisLine={false} tickLine={false}/>
              <YAxis domain={[0, 100]} tick={{ fontSize: 8, fill: '#8B98A5' }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ ...tooltipStyle, border: '1px solid #9D4EDD33' }}/>
              <Bar dataKey="exposure" fill="#9D4EDD" radius={[3, 3, 0, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stat Cards + Meters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <CircularMeter value={confidence} label="CONF" color="#00F5D4" size={90}/>
            <CircularMeter value={detectRisk} label="DETECT" color="#FF4D6D" size={90}/>
          </div>
          {[
            { label: 'Steps', val: timelineLength, color: '#00F5D4' },
            { label: 'Breached', val: compromisedCount, color: '#FF4D6D' },
            { label: 'Time', val: `${sessionSecs}s`, color: '#FFB800' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 10px', borderRadius: 8, background: '#0d1520', border: `1px solid ${s.color}22` }}>
              <span style={{ color: '#8B98A5', fontSize: 9, textTransform: 'uppercase' }}>{s.label}</span>
              <span style={{ color: s.color, fontSize: 14, fontWeight: 'bold', fontFamily: "'Orbitron', monospace" }}>{s.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
