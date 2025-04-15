// TrackTogether Vite + Tailwind Frontend Starter

import { useState, useEffect } from 'react'
import io from 'socket.io-client'
import axios from 'axios'

const socket = io('http://localhost:5000') // Change this to your server URL

export default function App() {
  const [user, setUser] = useState(null)
  const [location, setLocation] = useState({ lat: 0, lng: 0 })

  const token = localStorage.getItem('token')

  useEffect(() => {
    const watch = navigator.geolocation.watchPosition((pos) => {
      const { latitude, longitude } = pos.coords
      setLocation({ lat: latitude, lng: longitude })
      socket.emit('locationUpdate', { lat: latitude, lng: longitude, userId: user?._id })

      if (token) {
        axios.post('http://localhost:5000/api/users/location', { lat: latitude, lng: longitude }, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
    })
    return () => navigator.geolocation.clearWatch(watch)
  }, [user])

  useEffect(() => {
    socket.on('locationBroadcast', (data) => {
      console.log('Broadcasted Location:', data)
    })
  }, [])

  const login = async () => {
    const res = await axios.post('http://localhost:5000/api/users/login', {
      email: 'helly@example.com',
      password: 'Helly'
    })
    localStorage.setItem('token', res.data.token)
    setUser(res.data)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">TrackTogether</h1>
      {!user ? (
        <button onClick={login} className="bg-blue-500 text-white px-6 py-2 rounded-xl shadow">
          Login
        </button>
      ) : (
        <div className="bg-white p-4 rounded-xl shadow-md text-center">
          <p className="text-lg font-medium">Logged in as {user.name}</p>
          <p className="text-sm text-gray-600">Live location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
        </div>
      )}
    </div>
  )
}
