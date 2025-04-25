import React, { useEffect, useState } from 'react'
import io from 'socket.io-client'
import axios from 'axios'

const socket = io('http://localhost:5000') // Update if using different server

const LocationDetails = () => {
    const [user, setUser] = useState(null)
  const [location, setLocation] = useState({ lat: 0, lng: 0 })
  const token = localStorage.getItem('token')

  // Fetch user info if token exists
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUser(res.data)
      } catch (err) {
        console.error('Error fetching user info', err)
        localStorage.removeItem('token')
      }
    }

    if (token && !user) fetchUser()
  }, [token, user])

  // Track and emit location
  useEffect(() => {
    if (!user) return

    const watch = navigator.geolocation.watchPosition((pos) => {
      const { latitude, longitude } = pos.coords
      setLocation({ lat: latitude, lng: longitude })

      socket.emit('locationUpdate', {
        lat: latitude,
        lng: longitude,
        userId: user._id,
      })

      axios.post(
        'http://localhost:5000/api/users/location',
        { lat: latitude, lng: longitude },
        { headers: { Authorization: `Bearer ${token}` } }
      )
    })

    return () => navigator.geolocation.clearWatch(watch)
  }, [user, token])

  // Listen for broadcasted location updates
  useEffect(() => {
    socket.on('locationBroadcast', (data) => {
      console.log('Broadcasted Location:', data)
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
    <h1 className="text-3xl font-bold text-blue-600 mb-4">TrackTogether</h1>

    {user ? (
      <div className="bg-white p-4 rounded-xl shadow-md text-center">
        <p className="text-lg font-medium">Logged in as {user.name}</p>
        <p className="text-sm text-gray-600">
          Live location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
        </p>
      </div>
    ) : (
      <p className="text-gray-600 text-center">
        Please <a href="/login" className="text-blue-500 underline">login</a> to start tracking.
      </p>
    )}
  </div>
  )
}

export default LocationDetails