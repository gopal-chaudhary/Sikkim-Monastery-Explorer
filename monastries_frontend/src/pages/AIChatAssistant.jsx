import { useEffect, useRef, useState, useCallback } from 'react'
import {
  Send, Trash2, LogIn, Copy, Check, ThumbsUp, ThumbsDown,
  Sparkles, Bot, User, RefreshCw, ChevronDown, Info, Zap
} from 'lucide-react'
import { useAI } from '../context/AIContext'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import { Layout } from '../components/Layout'
import { useNavigate } from 'react-router-dom'

// ── Simple markdown-ish renderer ─────────────────────────────────────────────
function renderContent(text) {
  if (!text) return null
  const lines = text.split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Bullet point
    if (line.match(/^[-•*]\s/)) {
      const items = []
      while (i < lines.length && lines[i].match(/^[-•*]\s/)) {
        items.push(lines[i].replace(/^[-•*]\s/, ''))
        i++
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-none space-y-1 my-2">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2 text-amber-100/85 text-sm leading-relaxed">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500/70 flex-shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: renderInline(item) }} />
            </li>
          ))}
        </ul>
      )
      continue
    }

    // Numbered list
    if (line.match(/^\d+\.\s/)) {
      const items = []
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        items.push(lines[i].replace(/^\d+\.\s/, ''))
        i++
      }
      elements.push(
        <ol key={`ol-${i}`} className="list-none space-y-1 my-2">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2 text-amber-100/85 text-sm leading-relaxed">
              <span className="text-amber-500/70 text-xs font-bold flex-shrink-0 mt-0.5 w-4">{j + 1}.</span>
              <span dangerouslySetInnerHTML={{ __html: renderInline(item) }} />
            </li>
          ))}
        </ol>
      )
      continue
    }

    // Heading-like (bold line)
    if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
      elements.push(
        <p key={`h-${i}`} className="font-semibold text-amber-300 text-sm mt-3 mb-1">
          {line.slice(2, -2)}
        </p>
      )
      i++
      continue
    }

    // Empty line
    if (line.trim() === '') {
      elements.push(<div key={`sp-${i}`} className="h-2" />)
      i++
      continue
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${i}`} className="text-amber-100/85 text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: renderInline(line) }} />
    )
    i++
  }

  return elements
}

function renderInline(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-300 font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-amber-200/90">$1</em>')
    .replace(/`(.*?)`/g, '<code class="text-amber-400 bg-amber-500/10 px-1 rounded text-xs font-mono">$1</code>')
}

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handleCopy}
      className="p-1 rounded text-amber-500/40 hover:text-amber-400 transition"
      title="Copy">
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

// ── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg, onRate }) {
  const isUser = msg.role === 'user'
  const isSystem = msg.role === 'system'

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
          <Info className="w-3.5 h-3.5" />
          {msg.content}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-stone-900 shadow-lg
        ${isUser
          ? 'bg-gradient-to-br from-amber-500 to-amber-600'
          : 'bg-gradient-to-br from-rose-700 to-amber-600'}`}>
        {isUser ? <User className="w-4 h-4 text-stone-900" /> : <Bot className="w-4 h-4 text-amber-50" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[78%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`px-4 py-3 rounded-2xl shadow-sm ${
          isUser
            ? 'bg-gradient-to-br from-amber-600/40 to-amber-700/30 border border-amber-500/40 rounded-tr-sm'
            : 'bg-stone-900/70 border border-amber-500/15 rounded-tl-sm'
        }`}>
          {isUser
            ? <p className="text-amber-50 text-sm leading-relaxed">{msg.content}</p>
            : <div className="space-y-1">{renderContent(msg.content)}</div>
          }
        </div>

        {/* Footer */}
        <div className={`flex items-center gap-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity
          ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-[10px] text-stone-600">
            {msg.timestamp instanceof Date
              ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : ''}
          </span>
          {!isUser && (
            <>
              <CopyButton text={msg.content} />
              <button onClick={() => onRate?.(msg.id, 1)}
                className={`p-1 rounded transition ${msg.rated === 1 ? 'text-emerald-400' : 'text-amber-500/40 hover:text-emerald-400'}`}
                title="Good response">
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onRate?.(msg.id, -1)}
                className={`p-1 rounded transition ${msg.rated === -1 ? 'text-rose-400' : 'text-amber-500/40 hover:text-rose-400'}`}
                title="Bad response">
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
              {msg.model && (
                <span className="text-[9px] text-stone-700 font-mono">{msg.model.split('-').slice(-2).join('-')}</span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-700 to-amber-600 flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-amber-50" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-stone-900/70 border border-amber-500/15 flex items-center gap-1.5">
        <span className="typing-dot w-1.5 h-1.5 bg-amber-400/70 rounded-full" />
        <span className="typing-dot w-1.5 h-1.5 bg-amber-400/70 rounded-full" style={{ animationDelay: '0.2s' }} />
        <span className="typing-dot w-1.5 h-1.5 bg-amber-400/70 rounded-full" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  )
}

// ── Suggested questions ───────────────────────────────────────────────────────
const SUGGESTED = [
  { icon: '🏯', text: 'What is the oldest monastery in Sikkim?' },
  { icon: '🙏', text: 'Explain the significance of prayer flags' },
  { icon: '🗓️', text: 'Best time of year to visit monasteries?' },
  { icon: '🧘', text: 'What Buddhist sects are in Sikkim?' },
  { icon: '📸', text: 'Photography tips for monastery visits' },
  { icon: '🏔️', text: 'Which monastery has the highest altitude?' },
]

// ── Main component ────────────────────────────────────────────────────────────
export default function AIChatAssistant() {
  const {
    chatHistory, addMessage, clearChat,
    loading, setLoading, error, setError, clearError,
    getConversationHistory, setLastModel,
  } = useAI()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [inputValue, setInputValue] = useState('')
  const [ratings, setRatings] = useState({}) // msgId -> 1 | -1
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [chatHistory, loading, scrollToBottom])

  // Show scroll-to-bottom button when user scrolls up
  const handleScroll = useCallback((e) => {
    const el = e.currentTarget
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 120)
  }, [])

  const handleSend = useCallback(async (messageText) => {
    const message = (messageText || inputValue).trim()
    if (!message || loading) return
    clearError()
    setInputValue('')
    addMessage('user', message)
    setLoading(true)

    try {
      const history = getConversationHistory()
      const { data } = await api.post('/ai/chat', {
        message,
        monasteryContext: null,
        conversationHistory: history,
      })

      addMessage('assistant', data.response, { model: data.model })
      setLastModel(data.model)
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to get response'
      setError(msg)
      addMessage('system', msg)
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [inputValue, loading, clearError, addMessage, setLoading, getConversationHistory, setLastModel, setError])

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSend()
  }

  const handleRate = useCallback((msgId, value) => {
    setRatings(r => ({ ...r, [msgId]: r[msgId] === value ? 0 : value }))
  }, [])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const charCount = inputValue.length
  const charMax = 2000

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!user) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="glass rounded-3xl p-10 border border-amber-500/20">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-rose-700/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-6">
              <LogIn className="w-10 h-10 text-amber-500/60" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-amber-50 mb-3">Sign in to talk to DharmaGuide</h2>
            <p className="text-amber-200/60 mb-8 max-w-sm mx-auto">
              Your personal AI guide to Sikkim's Buddhist monasteries. Ask anything about history, culture, travel, and more.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate('/login')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-900 font-semibold hover:brightness-110 transition shadow-lg">
                Sign in
              </button>
              <button onClick={() => navigate('/signup')}
                className="px-6 py-3 rounded-xl border border-amber-700/50 text-amber-100 hover:bg-amber-900/30 transition">
                Create account
              </button>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // ── Main chat UI ──────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col h-[calc(100vh-80px)] gap-0">

        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-700 to-amber-600 flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-amber-50" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold text-amber-50 flex items-center gap-2">
                DharmaGuide AI
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">Live</span>
              </h1>
              <p className="text-xs text-amber-200/50">Powered by Llama 3.3 · Expert on Sikkim monasteries</p>
            </div>
          </div>

          {chatHistory.length > 0 && (
            <button onClick={clearChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-900/50 text-amber-200/50 hover:text-amber-200 hover:border-amber-700/50 transition text-xs">
              <RefreshCw className="w-3.5 h-3.5" /> New chat
            </button>
          )}
        </div>

        {/* Chat window */}
        <div className="flex-1 min-h-0 glass rounded-2xl flex flex-col overflow-hidden border border-amber-500/10">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 relative" onScroll={handleScroll}>

            {chatHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-6 py-8">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-700/30 to-amber-600/30 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-7 h-7 text-amber-400/70" />
                  </div>
                  <h2 className="font-heading text-lg text-amber-50">Ask DharmaGuide anything</h2>
                  <p className="text-amber-200/50 text-sm max-w-sm">
                    Your expert companion for exploring Sikkim's sacred monasteries, Buddhist culture, and travel wisdom.
                  </p>
                </div>

                {/* Suggestion chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
                  {SUGGESTED.map((q, i) => (
                    <button key={i}
                      onClick={() => handleSend(q.text)}
                      className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-100/70 hover:text-amber-50 hover:border-amber-500/40 hover:bg-amber-500/10 transition text-sm text-left flex items-center gap-2.5 group">
                      <span className="text-base">{q.icon}</span>
                      <span className="leading-snug">{q.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {chatHistory.map(msg => (
                  <div key={msg.id} className="slide-in-left">
                    <MessageBubble
                      msg={{ ...msg, rated: ratings[msg.id] }}
                      onRate={handleRate}
                    />
                  </div>
                ))}
                {loading && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </>
            )}

            {/* Scroll to bottom button */}
            {showScrollBtn && (
              <button
                onClick={scrollToBottom}
                className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-amber-600/80 border border-amber-500/50 flex items-center justify-center shadow-lg hover:bg-amber-600 transition">
                <ChevronDown className="w-4 h-4 text-amber-50" />
              </button>
            )}
          </div>

          {/* Error bar */}
          {error && (
            <div className="px-5 py-2 bg-red-500/10 border-t border-red-500/20 text-red-300 text-xs flex items-center gap-2">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              {typeof error === 'object' ? JSON.stringify(error) : String(error)}
            </div>
          )}

          {/* Input area */}
          <div className="border-t border-amber-500/10 p-4">
            <form onSubmit={handleSubmit}>
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value.slice(0, charMax))}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about monasteries, culture, travel tips…"
                    disabled={loading}
                    rows={1}
                    style={{ resize: 'none', minHeight: '44px', maxHeight: '120px' }}
                    className="w-full px-4 py-3 rounded-xl bg-stone-900/60 border border-amber-500/20 text-amber-50 placeholder-amber-200/30 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-amber-500/40 text-sm leading-relaxed transition"
                    onInput={e => {
                      e.target.style.height = 'auto'
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                    }}
                  />
                  {charCount > charMax * 0.8 && (
                    <span className={`absolute bottom-2 right-3 text-[10px] ${charCount >= charMax ? 'text-red-400' : 'text-amber-500/50'}`}>
                      {charCount}/{charMax}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={loading || !inputValue.trim()}
                    className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-stone-900 flex items-center justify-center hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg">
                    {loading
                      ? <Zap className="w-4 h-4 animate-pulse" />
                      : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-stone-700 mt-2 text-center">
                Press Enter to send · Shift+Enter for new line · DharmaGuide may make mistakes
              </p>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  )
}
