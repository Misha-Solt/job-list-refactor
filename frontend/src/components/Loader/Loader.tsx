import { useEffect, useState } from 'react'
import styles from './loader.module.css'

interface LoaderProps {
  loading: boolean
}

const Loader = ({ loading }: LoaderProps) => {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (loading) {
      timeout = setTimeout(() => setVisible(true), 300)
    } else {
      setVisible(false)
    }
    return () => clearTimeout(timeout)
  }, [loading])

  if (!visible) return null

  return (
    <div className={styles.loaderWrapper}>
      <div className={styles.spinner} />
      <p className={styles.text}>Lade Daten...</p>
    </div>
  )
}

export default Loader
