import { Outlet } from 'react-router-dom'
import { ToastProvider } from './ui/ToastProvider'

const App = () => {
  return (
    // Optionen: 'bottom-right' | 'bottom-center' | 'top-right' | 'top-center'
    <ToastProvider placement="top-center">
      <div>
        <Outlet />
      </div>
    </ToastProvider>
  )
}

export default App
