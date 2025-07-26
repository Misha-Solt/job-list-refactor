import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import JobList from './pages/JobList/JobList'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <JobList />,
      },
    ],
  },
])
