import { useEffect } from 'react'

export function useReveal(deps: any[] = []) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1 }
    )

    const elements = document.querySelectorAll(
      '.reveal, .reveal-left, .reveal-right'
    )
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, deps)
}