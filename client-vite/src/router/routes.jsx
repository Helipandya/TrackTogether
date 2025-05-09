// client/src/routes.jsx
import { createBrowserRouter } from 'react-router-dom'

import Register from '../auth/Register'
import App from '../App'
import Login from '../auth/Login'
import LocationDetails from '../pages/LocationDetails'
import LiveLocation from '../pages/LiveLocation'
import LiveLocationViewer from '../pages/LiveLocationViewer'


const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  { path: '/login', element: <Login /> },
  { path: '/locationdetail', element: <LocationDetails /> },
  {
    path: '/live-location',
    element: <LiveLocation />,
  },
  {
    path: '/live/:userId',
    element: <LiveLocationViewer />,
  },
])

export default router
