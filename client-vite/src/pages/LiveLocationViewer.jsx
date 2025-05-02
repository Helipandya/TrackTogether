// client/src/pages/LiveLocationViewer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const API_URL = 'http://192.168.29.191:5000/api/users/location'; // Adjust as needed

const LiveLocationViewer = () => {
  const { userId } = useParams();
  const [location, setLocation] = useState(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Initialize map
  useEffect(() => {
    mapRef.current = L.map('map').setView([51.505, -0.09], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapRef.current);

    return () => mapRef.current.remove();
  }, []);

  // Fetch location periodically
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await axios.get(`${API_URL}/${userId}`);
        const { lat, lng } = response.data;
        setLocation({ latitude: lat, longitude: lng });
        mapRef.current.setView([lat, lng], 15);
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng])
            .addTo(mapRef.current)
            .bindPopup('Shared location')
            .openPopup();
        }
      } catch (error) {
        console.error('Failed to fetch location:', error.message);
      }
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [userId]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div id="map" className="flex-grow" style={{ height: '100%' }}></div>
    </div>
  );
};

export default LiveLocationViewer;