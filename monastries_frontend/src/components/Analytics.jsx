import { useEffect } from 'react'

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) return resolve()
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = () => resolve()
    s.onerror = reject
    document.head.appendChild(s)
  })
}

export function Analytics() {
  const gaId = import.meta.env.VITE_GA_ID
  const plausibleDomain = import.meta.env.VITE_PLAUSIBLE_DOMAIN

  useEffect(() => {
    if (gaId) {
      const gtagSrc = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`
      loadScript(gtagSrc).then(() => {
        window.dataLayer = window.dataLayer || []
        function gtag(){ window.dataLayer.push(arguments) }
        gtag('js', new Date())
        gtag('config', gaId, { anonymize_ip: true })
      }).catch(() => {
        // ignore analytics load failure
      })
      return
    }

    if (plausibleDomain) {
      loadScript('https://plausible.io/js/script.js').catch(() => {
        // ignore analytics load failure
      })
    }
  }, [gaId, plausibleDomain])

  // Plausible needs a data-domain attribute on its script; easiest is to inject a 2nd script tag.
  useEffect(() => {
    if (!plausibleDomain || gaId) return
    const id = 'plausible-script'
    if (document.getElementById(id)) return
    const s = document.createElement('script')
    s.id = id
    s.defer = true
    s.dataset.domain = plausibleDomain
    s.src = 'https://plausible.io/js/script.js'
    document.head.appendChild(s)
  }, [gaId, plausibleDomain])

  return null
}

