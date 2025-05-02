// client/src/pages/LiveLocation.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const API_URL = 'http://192.168.29.191:5000/api/users/location'; // Your backend API
const BASE_URL = 'https://tracktogetherr.onrender.com/live';

const LiveLocation = () => {
  const [userId, setUserId] = useState(null);
  const [location, setLocation] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [duration, setDuration] = useState(15);
  const [notificationStatus, setNotificationStatus] = useState('default');
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const intervalRef = useRef(null);
  const timerRef = useRef(null);

  // Retrieve userId from localStorage (simulating AsyncStorage)
  useEffect(() => {
    const storedId = localStorage.getItem('userId');
    if (storedId) {
      setUserId(storedId);
    } else {
      const newId = Math.random().toString(36).substr(2, 24); // Generate a unique ID
      localStorage.setItem('userId', newId);
      setUserId(newId);
    }
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    mapRef.current = L.map('map').setView([51.505, -0.09], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapRef.current);

    return () => mapRef.current.remove();
  }, []);

  // Get initial location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation({ latitude, longitude });
          mapRef.current.setView([latitude, longitude], 15);
          if (markerRef.current) {
            markerRef.current.setLatLng([latitude, longitude]);
          } else {
            markerRef.current = L.marker([latitude, longitude])
              .addTo(mapRef.current)
              .bindPopup('You are here')
              .openPopup();
          }
        },
        () => alert('Geolocation permission denied')
      );
    } else {
      alert('Geolocation not supported by your browser');
    }
  }, []);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        setNotificationStatus(permission);
      });
    }
  }, []);

  const shareableLink = userId ? `${BASE_URL}/${userId}` : '';

  // Start sharing location
  const startSharing = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }

    setIsSharing(true);
    if (notificationStatus === 'granted') {
      new Notification('Location Sharing Started', {
        body: `Your location is being shared for ${duration} minutes.`,
      });
    }

    intervalRef.current = setInterval(async () => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation({ latitude, longitude });
          if (markerRef.current) {
            markerRef.current.setLatLng([latitude, longitude]);
            mapRef.current.setView([latitude, longitude], 15);
          }

          try {
            const token = localStorage.getItem('token'); // Assuming token is stored
            await axios.put(
              API_URL,
              { lat: latitude, lng: longitude },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
          } catch (error) {
            console.error('Failed to update location:', error.message);
          }
        },
        () => console.error('Failed to get location')
      );
    }, 10000); // Update every 10 seconds

    timerRef.current = setTimeout(() => {
      stopSharing();
    }, duration * 60 * 1000);
  };

  // Stop sharing location
  const stopSharing = () => {
    clearInterval(intervalRef.current);
    clearTimeout(timerRef.current);
    setIsSharing(false);
    if (notificationStatus === 'granted') {
      new Notification('Location Sharing Stopped', {
        body: 'Your location is no longer being shared.',
      });
    }
    alert('Location sharing stopped');
  };

  // Share location link
  const shareLocation = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Live Location',
        text: 'Track my live location here:',
        url: shareableLink,
      }).catch((err) => console.error('Share error:', err));
    } else {
      navigator.clipboard.writeText(shareableLink).then(() => {
        alert('Link copied to clipboard!');
      });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div id="map" className="flex-grow" style={{ height: '60%' }}></div>
      <div className="p-4 flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-2">
          <label className="text-lg">Duration:</label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="border rounded p-2"
          >
            <option value={15}>15 minutes</option>
            <option value={60}>1 hour</option>
            <option value={120}>2 hours</option>
          </select>
        </div>
        {isSharing ? (
          <button
            onClick={stopSharing}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Stop Sharing
          </button>
        ) : (
          <button
            onClick={startSharing}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Start Live Location
          </button>
        )}
        {!isSharing && shareableLink && (
          <button
            onClick={shareLocation}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Share Location Link
          </button>
        )}
      </div>
    </div>
  );
};

export default LiveLocation;