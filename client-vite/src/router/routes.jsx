// client/src/routes.jsx
import { createBrowserRouter } from 'react-router-dom'

import Register from '../auth/Register'
import App from '../App'
import Login from '../auth/Login'


const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  },
  {
    path: '/register',
    element: <Register />
  },
  { path: '/login', element: <Login /> }
])

export default router
