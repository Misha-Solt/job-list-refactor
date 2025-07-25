import styles from './errorMessage.module.css'

interface ErrorMessageProps {
  message: string
}

const ErrorMessage = ({ message }: ErrorMessageProps) => {
  return <div className={styles.error}>Fehler: {message}</div>
}

export default ErrorMessage
