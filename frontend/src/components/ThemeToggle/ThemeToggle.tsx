import { useMemo } from 'react'
import { FaRegSun, FaRegMoon, FaDesktop } from 'react-icons/fa6'
import styles from './themeToggle.module.css'
import { useTheme } from '../../hooks/useTheme'

type Mode = 'light' | 'system' | 'dark'

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()

  const options = useMemo(
    () =>
      [
        { key: 'light' as Mode, label: 'Hell', Icon: FaRegSun, variantClass: styles.sun },
        { key: 'system' as Mode, label: 'System', Icon: FaDesktop, variantClass: styles.system },
        { key: 'dark' as Mode, label: 'Dunkel', Icon: FaRegMoon, variantClass: styles.moon },
      ] as const,
    [],
  )

  const index = options.findIndex((o) => o.key === theme)
  const count = options.length

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return
    e.preventDefault()
    let next = index
    if (e.key === 'ArrowRight') next = (index + 1) % count
    if (e.key === 'ArrowLeft') next = (index - 1 + count) % count
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = count - 1
    setTheme(options[next].key)
  }

  return (
    <div
      className={styles.wrapper}
      role="radiogroup"
      aria-label="Theme umschalten"
      onKeyDown={onKeyDown}
    >
      {options.map(({ key, label, Icon, variantClass }) => {
        const active = theme === key
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            className={`${styles.btn} ${variantClass} ${active ? styles.active : ''}`}
            onClick={() => setTheme(key)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setTheme(key)
              }
            }}
          >
            <Icon aria-hidden className={styles.icon} />
            <span className={styles.srOnly}>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default ThemeToggle
