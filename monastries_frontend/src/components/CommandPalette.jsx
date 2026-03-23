import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Command } from 'cmdk'
import { Search, MapPin, Compass, User, Shield, Sparkles } from 'lucide-react'
import { useMonasteries } from '../context/MonasteryContext'

function useHotkey(handler) {
  useEffect(() => {
    const onKeyDown = (e) => {
      const isK = e.key?.toLowerCase() === 'k'
      const isMod = e.metaKey || e.ctrlKey
      if (isMod && isK) {
        e.preventDefault()
        handler()
      }
      if (e.key === 'Escape') handler(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handler])
}

export function CommandPalette({ isAdmin }) {
  const navigate = useNavigate()
  const { monasteries } = useMonasteries()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')

  useEffect(() => {
    const onOpen = () => setOpen(true)
    window.addEventListener('cmdk:open', onOpen)
    return () => window.removeEventListener('cmdk:open', onOpen)
  }, [])

  useHotkey((next) => {
    if (typeof next === 'boolean') setOpen(next)
    else setOpen((o) => !o)
  })

  const pages = useMemo(() => {
    const base = [
      { label: 'Home', path: '/', icon: Sparkles },
      { label: 'Explore monasteries', path: '/explore', icon: Compass },
      { label: 'Map', path: '/map', icon: MapPin },
      { label: 'Profile', path: '/profile', icon: User },
    ]
    if (isAdmin) base.push({ label: 'Admin', path: '/admin', icon: Shield })
    return base
  }, [isAdmin])

  const monasteryItems = useMemo(() => {
    return (monasteries || [])
      .filter((m) => m?._id && m?.name)
      .slice(0, 200)
      .map((m) => ({
        label: m.name,
        hint: m.region || m.location?.district || m.location?.village || '',
        path: `/monastery/${m._id}`,
      }))
  }, [monasteries])

  const closeAndGo = (path) => {
    setOpen(false)
    setValue('')
    navigate(path)
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          onMouseDown={() => setOpen(false)}
        />
      )}
      <div className="fixed inset-x-0 top-16 sm:top-20 z-[101] pointer-events-none">
        <div className="max-w-xl mx-auto px-4 pointer-events-auto">
          <Command
            className={`w-full rounded-2xl overflow-hidden border border-amber-900/40 shadow-2xl shadow-black/40 ${open ? '' : 'hidden'}`}
            value={value}
            onValueChange={setValue}
          >
            <div className="bg-stone-950/90">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-amber-900/30">
                <Search className="w-4 h-4 text-amber-400" />
                <Command.Input
                  autoFocus
                  placeholder="Search monasteries, pages…"
                  className="w-full bg-transparent text-stone-100 placeholder:text-stone-500 outline-none"
                />
                <kbd className="text-[10px] text-stone-400 border border-stone-700/60 rounded px-1.5 py-0.5">Esc</kbd>
              </div>

              <Command.List className="max-h-[60vh] overflow-auto p-2">
                <Command.Empty className="p-4 text-sm text-stone-400">No results.</Command.Empty>

                <Command.Group heading="Pages" className="text-xs text-stone-500 px-2 py-1">
                  {pages.map((p) => {
                    const Icon = p.icon
                    return (
                      <Command.Item
                        key={p.path}
                        value={p.label}
                        onSelect={() => closeAndGo(p.path)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-stone-100 aria-selected:bg-amber-500/15 aria-selected:border aria-selected:border-amber-500/25 cursor-pointer"
                      >
                        <Icon className="w-4 h-4 text-amber-300" />
                        <span>{p.label}</span>
                      </Command.Item>
                    )
                  })}
                </Command.Group>

                <Command.Group heading="Monasteries" className="text-xs text-stone-500 px-2 py-1 mt-2">
                  {monasteryItems.map((m) => (
                    <Command.Item
                      key={m.path}
                      value={`${m.label} ${m.hint}`}
                      onSelect={() => closeAndGo(m.path)}
                      className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-sm text-stone-100 aria-selected:bg-amber-500/15 aria-selected:border aria-selected:border-amber-500/25 cursor-pointer"
                    >
                      <div className="min-w-0">
                        <p className="truncate">{m.label}</p>
                        {m.hint ? <p className="text-[11px] text-stone-400 truncate">{m.hint}</p> : null}
                      </div>
                      <span className="text-[10px] text-stone-500 flex-shrink-0">Open</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>
              <div className="px-4 py-2 border-t border-amber-900/30 text-[11px] text-stone-500 bg-stone-950/90">
                Tip: press <span className="text-stone-300">⌘/Ctrl</span> + <span className="text-stone-300">K</span> anywhere.
              </div>
            </div>
          </Command>
        </div>
      </div>
    </>
  )
}

