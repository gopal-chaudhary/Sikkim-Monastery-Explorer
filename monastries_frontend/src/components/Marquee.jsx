import { Star } from 'lucide-react'

const TAGS_STRIP = ['Meditation', 'Peace', 'Heritage', 'Sikkim', 'Buddhism', 'Himalayas', 'Spiritual', 'Retreat', 'Ancient', 'Wisdom', 'Serenity', 'Pilgrimage', 'Meditation', 'Peace', 'Heritage', 'Sikkim']

const RUNNING_ITEMS = [
  { name: 'Rumtek Monastery', tag: 'Golden Stupa', rating: 4.8 },
  { name: 'Pemayangtse', tag: 'Ancient Art', rating: 4.7 },
  { name: 'Enchey Monastery', tag: 'Chaam Dance', rating: 4.6 },
  { name: 'Tashiding', tag: 'Panoramic Views', rating: 4.9 },
  { name: 'Dubdi Monastery', tag: 'Oldest in Sikkim', rating: 4.8 },
  { name: 'Ralang Monastery', tag: 'Peaceful Gardens', rating: 4.5 },
  { name: 'Phodong Monastery', tag: 'Architecture', rating: 4.7 },
  { name: 'Labrang Monastery', tag: 'Spiritual Learning', rating: 4.6 },
  { name: 'Rumtek Monastery', tag: 'Golden Stupa', rating: 4.8 },
  { name: 'Pemayangtse', tag: 'Ancient Art', rating: 4.7 },
  { name: 'Enchey Monastery', tag: 'Chaam Dance', rating: 4.6 },
  { name: 'Tashiding', tag: 'Panoramic Views', rating: 4.9 },
]

function Card({ name, tag, rating }) {
  return (
    <div className="flex-shrink-0 w-[220px] sm:w-[260px] mx-2 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] backdrop-blur p-4 hover:border-[var(--accent-border)] hover:bg-[var(--bg-hover)] transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-medium">{tag}</span>
        <span className="flex items-center gap-0.5 text-[var(--text-primary)] text-xs">
          <Star className="w-3.5 h-3.5 fill-[var(--accent-primary)]" /> {rating}
        </span>
      </div>
      <p className="font-heading font-semibold text-[var(--text-primary)] text-sm sm:text-base leading-tight">{name}</p>
    </div>
  )
}

export function Marquee() {
  const duplicated = [...RUNNING_ITEMS, ...RUNNING_ITEMS]
  const tagsDuplicated = [...TAGS_STRIP, ...TAGS_STRIP]
  return (
    <>
      <div className="relative overflow-hidden py-3 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]">
        <div className="marquee-track-reverse flex gap-8">
          {tagsDuplicated.map((tag, i) => (
            <span key={`tag-${i}`} className="flex-shrink-0 text-xs sm:text-sm font-medium text-[var(--text-secondary)] uppercase tracking-widest whitespace-nowrap">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="relative overflow-hidden py-4 border-b border-[var(--border-primary)] bg-[var(--bg-card)]">
        <div className="marquee-track">
          {duplicated.map((item, i) => (
            <Card key={`${item.name}-${i}`} name={item.name} tag={item.tag} rating={item.rating} />
          ))}
        </div>
      </div>
    </>
  )
}
