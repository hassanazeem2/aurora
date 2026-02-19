'use client'
import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSimStore, NetworkNode, NetworkEdge } from '@/store/simStore'

const NODE_COLORS: Record<string, string> = {
  firewall: '#00F5D4', server: '#9D4EDD', database: '#FFB800',
  critical: '#FF4D6D', client: '#8B98A5', attacker: '#FF4D6D',
}
const ICONS: Record<string, string> = {
  firewall: '🛡', server: '◉', database: '◈', critical: '★',
  client: '⬡', attacker: '☠',
}

interface Props {
  width?: number
  height?: number
}

export default function NetworkMap({ width = 840, height = 420 }: Props) {
  const { nodes, edges, compromised, activeNode, hoveredNode, heatMode, heatMap, setHoveredNode, attackPaths } = useSimStore()
  const svgRef = useRef<SVGSVGElement>(null)
  const [dims, setDims] = useState({ w: width, h: height })

  useEffect(() => {
    if (!svgRef.current) return
    const obs = new ResizeObserver(([e]) => {
      setDims({ w: e.contentRect.width, h: e.contentRect.height })
    })
    obs.observe(svgRef.current.parentElement!)
    return () => obs.disconnect()
  }, [])

  const sx = (x: number) => (x / 820) * dims.w
  const sy = (y: number) => (y / 680) * dims.h

  // Best attack path edges
  const pathEdges = new Set<string>()
  if (attackPaths.length > 0) {
    const best = attackPaths[0].path
    for (let i = 0; i < best.length - 1; i++) {
      pathEdges.add(`${best[i]}→${best[i + 1]}`)
    }
  }

  const getNodeColor = (node: NetworkNode) => {
    if (compromised.includes(node.id)) return '#FF4D6D'
    if (heatMode && heatMap[node.id] !== undefined) {
      const heat = heatMap[node.id]
      if (heat > 0.7) return '#FF4D6D'
      if (heat > 0.5) return '#FFB800'
      if (heat > 0.3) return '#9D4EDD'
      return '#2BE88C'
    }
    return NODE_COLORS[node.type] || '#8B98A5'
  }

  return (
    <svg ref={svgRef} width="100%" height="100%" style={{ minHeight: height }}>
      <defs>
        <filter id="glow-c"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="glow-r"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="glow-g"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <radialGradient id="bg"><stop offset="0%" stopColor="#161e2e"/><stop offset="100%" stopColor="#0a0f18"/></radialGradient>
        <linearGradient id="path-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00F5D4" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#FF4D6D" stopOpacity="0.8"/>
        </linearGradient>
        {/* Scanline overlay */}
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff06" strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)" rx="12"/>
      <rect width="100%" height="100%" fill="url(#grid)" rx="12" opacity="0.5"/>

      {/* Edges */}
      {edges.map((edge, i) => {
        const from = nodes.find(n => n.id === edge.from)
        const to = nodes.find(n => n.id === edge.to)
        if (!from || !to) return null
        const isPath = pathEdges.has(`${edge.from}→${edge.to}`)
        const bothComp = compromised.includes(edge.from) && compromised.includes(edge.to)
        const isActive = activeNode === edge.from || activeNode === edge.to
        const color = bothComp ? '#FF4D6D' : isPath ? 'url(#path-grad)' : isActive ? '#00F5D4' : '#1e2d42'
        const opacity = bothComp ? 0.9 : isPath ? 0.8 : isActive ? 0.5 : 0.25
        return (
          <g key={i}>
            <line
              x1={sx(from.x)} y1={sy(from.y)} x2={sx(to.x)} y2={sy(to.y)}
              stroke={color} strokeWidth={bothComp ? 2.5 : isPath ? 2 : isActive ? 1.5 : 1}
              strokeOpacity={opacity}
              filter={bothComp ? 'url(#glow-r)' : isPath ? 'url(#glow-c)' : undefined}
            />
            {/* Animated dot on active path */}
            {isPath && !bothComp && (
              <circle r="2.5" fill="#00F5D4" opacity="0.9">
                <animateMotion dur="2s" repeatCount="indefinite">
                  <mpath href={`#path-${i}`}/>
                </animateMotion>
              </circle>
            )}
          </g>
        )
      })}

      {/* Nodes */}
      {nodes.map(node => {
        const cx = sx(node.x)
        const cy = sy(node.y)
        const isComp = compromised.includes(node.id)
        const isActive = activeNode === node.id
        const isHov = hoveredNode === node.id
        const baseColor = getNodeColor(node)
        const r = node.id === 'attacker' ? 16 : node.type === 'critical' ? 20 : 15
        const heat = heatMode && heatMap[node.id] !== undefined ? heatMap[node.id] : 0

        return (
          <g key={node.id}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            style={{ cursor: 'pointer' }}>
            {/* Heat ring */}
            {heatMode && heat > 0.2 && (
              <circle cx={cx} cy={cy} r={r + heat * 20} fill={baseColor} fillOpacity={heat * 0.15} />
            )}
            {/* Compromise pulse */}
            {isComp && (
              <>
                <circle cx={cx} cy={cy} r={r + 12} fill="none" stroke="#FF4D6D" strokeWidth="1" strokeOpacity="0.3">
                  <animate attributeName="r" values={`${r+8};${r+22};${r+8}`} dur="2s" repeatCount="indefinite"/>
                  <animate attributeName="stroke-opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite"/>
                </circle>
                <circle cx={cx} cy={cy} r={r + 6} fill="none" stroke="#FF4D6D" strokeWidth="1.5" strokeOpacity="0.5">
                  <animate attributeName="r" values={`${r+4};${r+14};${r+4}`} dur="1.5s" repeatCount="indefinite"/>
                </circle>
              </>
            )}
            {/* Active scanning ring */}
            {isActive && !isComp && (
              <circle cx={cx} cy={cy} r={r + 8} fill="none" stroke="#FFB800" strokeWidth="1.5" strokeOpacity="0.7">
                <animate attributeName="r" values={`${r+5};${r+16};${r+5}`} dur="1.2s" repeatCount="indefinite"/>
                <animate attributeName="stroke-opacity" values="0.8;0.1;0.8" dur="1.2s" repeatCount="indefinite"/>
              </circle>
            )}
            {/* Node circle */}
            <circle cx={cx} cy={cy} r={isHov ? r + 3 : r}
              fill={isComp ? '#220a0a' : '#0e1622'}
              stroke={baseColor}
              strokeWidth={isHov || isActive ? 2.5 : 1.5}
              filter={isComp ? 'url(#glow-r)' : isActive ? 'url(#glow-c)' : undefined}
              style={{ transition: 'r 0.2s, stroke-width 0.2s' }}
            />
            {/* Soft glow circle */}
            <circle cx={cx} cy={cy} r={r - 2} fill={baseColor} fillOpacity="0.06"/>
            {/* Icon */}
            <text x={cx} y={cy + 5} textAnchor="middle" fontSize={r * 0.75}
              fill={baseColor} style={{ userSelect: 'none', fontFamily: 'monospace' }}>
              {ICONS[node.type] || '◉'}
            </text>
            {/* Label */}
            <text x={cx} y={cy + r + 14} textAnchor="middle" fontSize="9"
              fill={isComp ? '#FF4D6D' : '#8B98A5'}
              style={{ fontFamily: 'monospace', userSelect: 'none' }}>
              {node.label}
            </text>
            {/* Risk badge */}
            {node.risk > 0 && (
              <text x={cx + r - 2} y={cy - r + 4} textAnchor="middle" fontSize="7"
                fill={node.risk > 75 ? '#FF4D6D' : node.risk > 50 ? '#FFB800' : '#2BE88C'}
                style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                {node.risk}
              </text>
            )}

            {/* Tooltip */}
            {isHov && (
              <g>
                <rect x={cx - 80} y={cy - r - 82} width={160} height={78} rx="8"
                  fill="#0a1018" stroke={baseColor} strokeWidth="1" strokeOpacity="0.7"
                  filter="url(#glow-c)"/>
                <text x={cx} y={cy - r - 64} textAnchor="middle" fontSize="10"
                  fill="#ffffff" fontFamily="monospace" fontWeight="bold">{node.label}</text>
                <text x={cx} y={cy - r - 50} textAnchor="middle" fontSize="8"
                  fill="#8B98A5" fontFamily="monospace">{node.os || 'Unknown OS'}</text>
                <text x={cx} y={cy - r - 38} textAnchor="middle" fontSize="8"
                  fill="#8B98A5" fontFamily="monospace">Ports: {node.ports.slice(0,4).join(', ') || 'none'}</text>
                <text x={cx} y={cy - r - 26} textAnchor="middle" fontSize="8"
                  fill="#FFB800" fontFamily="monospace">Risk: {node.risk}% · Exposure: {node.exposure}%</text>
                <text x={cx} y={cy - r - 14} textAnchor="middle" fontSize="8"
                  fill={isComp ? '#FF4D6D' : '#2BE88C'} fontFamily="monospace">
                  {isComp ? '⚠ COMPROMISED' : `✓ Secure · ${node.vulns.length} vulns`}
                </text>
              </g>
            )}
          </g>
        )
      })}

      {/* Legend */}
      <g transform={`translate(12, ${dims.h - 60})`}>
        <rect width="200" height="52" rx="6" fill="#0a0f1888" stroke="#1e2d4288"/>
        {[
          { color: '#2BE88C', label: 'Secure' },
          { color: '#FFB800', label: 'Scanning' },
          { color: '#FF4D6D', label: 'Compromised' },
          { color: 'url(#path-grad)', label: 'Attack Path' },
        ].map((item, i) => (
          <g key={i} transform={`translate(${8 + (i % 2) * 96}, ${8 + Math.floor(i / 2) * 20})`}>
            <circle r="4" cx="5" cy="5" fill={item.color}/>
            <text x="13" y="9" fontSize="8" fill="#8B98A5" fontFamily="monospace">{item.label}</text>
          </g>
        ))}
      </g>
    </svg>
  )
}
