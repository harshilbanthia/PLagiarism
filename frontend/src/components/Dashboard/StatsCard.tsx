import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: string | number
  icon: ReactNode
  change?: number
  changeLabel?: string
  accent?: 'cyan' | 'purple' | 'green' | 'red' | 'yellow'
}

const accentMap: Record<string, string> = {
  cyan:   'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 text-cyan-400',
  purple: 'from-purple-500/10 to-purple-500/5 border-purple-500/20 text-purple-400',
  green:  'from-green-500/10 to-green-500/5 border-green-500/20 text-green-400',
  red:    'from-red-500/10 to-red-500/5 border-red-500/20 text-red-400',
  yellow: 'from-yellow-500/10 to-yellow-500/5 border-yellow-500/20 text-yellow-400',
}

const iconBgMap: Record<string, string> = {
  cyan:   'bg-cyan-500/10 text-cyan-400',
  purple: 'bg-purple-500/10 text-purple-400',
  green:  'bg-green-500/10 text-green-400',
  red:    'bg-red-500/10 text-red-400',
  yellow: 'bg-yellow-500/10 text-yellow-400',
}

export default function StatsCard({
  label,
  value,
  icon,
  change,
  changeLabel,
  accent = 'cyan',
}: StatsCardProps) {
  const colors = accentMap[accent]
  const iconColors = iconBgMap[accent]
  const isPositive = change !== undefined && change >= 0

  return (
    <div className={`card-hover bg-gradient-to-br ${colors} rounded-xl p-5 border`}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            {label}
          </span>
          <span className="text-2xl font-bold text-white">{value}</span>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              {isPositive ? (
                <TrendingUp size={12} className="text-green-400" />
              ) : (
                <TrendingDown size={12} className="text-red-400" />
              )}
              <span className={`text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}{change}%
              </span>
              {changeLabel && (
                <span className="text-xs text-gray-500">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${iconColors}`}>{icon}</div>
      </div>
    </div>
  )
}
