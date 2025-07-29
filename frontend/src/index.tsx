import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import ReactModal from 'react-modal'
import './index.css'

ReactModal.setAppElement('#root')

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<RouterProvider router={router} />)
