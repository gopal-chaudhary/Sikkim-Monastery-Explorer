import { useEffect, useRef, useState } from 'react'

export function AnimatedCounter({ end, suffix = '', duration = 1500, className = '' }) {
  const [count, setCount] = useState(null)
  const ref = useRef(null)
  const [started, setStarted] = useState(false)

  const isInfinity = end === Infinity || end === '∞'

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true)
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    if (isInfinity) return
    const numEnd = typeof end === 'string' ? parseInt(end, 10) : end
    if (Number.isNaN(numEnd)) return
    const startTime = performance.now()
    const step = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(easeOut * numEnd))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [started, end, duration, isInfinity])

  return (
    <span ref={ref} className={className}>
      {started && isInfinity ? `∞${suffix}` : (count !== null ? `${count}${suffix}` : '0')}
    </span>
  )
}
