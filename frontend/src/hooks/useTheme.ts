import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark' | 'system'

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme | null
    return saved ?? 'system'
  })

  useEffect(() => {
    const root = document.documentElement
    const mql = window.matchMedia('(prefers-color-scheme: dark)')

    const applyEffective = () => {
      const effective: Exclude<Theme, 'system'> =
        theme === 'system' ? (mql.matches ? 'dark' : 'light') : theme

      root.setAttribute('data-theme', effective)
      ;(root as HTMLElement).style.colorScheme = effective
    }

    applyEffective()
    localStorage.setItem('theme', theme)

    if (theme === 'system') {
      mql.addEventListener('change', applyEffective)

      return () => mql.removeEventListener('change', applyEffective)
    }

    return
  }, [theme])

  return { theme, setTheme } as const
}
