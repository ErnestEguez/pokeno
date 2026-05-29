import { PlayingCard } from './PlayingCard'

interface Props {
  card: string
  isMarked: boolean
  onClick: () => void
}

export function BoardCell({ card, isMarked, onClick }: Props) {
  return (
    <PlayingCard
      code={card}
      size="small"
      isMarked={isMarked}
      onClick={onClick}
    />
  )
}
