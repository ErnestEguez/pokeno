import { PATTERN_LABELS } from '@/types/game'
import type { WinningPattern } from '@/types/game'

interface Props {
  patterns: string[]
}

export function PatternIndicator({ patterns }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {patterns.map(p => (
        <span key={p} className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full">
          {PATTERN_LABELS[p as WinningPattern] ?? p}
        </span>
      ))}
    </div>
  )
}
