// client/src/routes.jsx
import { createBrowserRouter } from 'react-router-dom'

import Register from '../auth/Register'
import App from '../App'


const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  },
  {
    path: '/register',
    element: <Register />
  }
])

export default router
