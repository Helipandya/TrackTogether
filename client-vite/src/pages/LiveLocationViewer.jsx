// client/src/pages/LiveLocationViewer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const API_URL = 'http://192.168.29.191:5000/api/users/location';

const LiveLocationViewer = () => {
  const { userId } = useParams();
  const [location, setLocation] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
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
        const { lat, lng, expiresAt } = response.data.location;

        if (expiresAt && new Date(expiresAt) < new Date()) {
          setIsExpired(true);
          return;
        }

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
        setIsExpired(true);
      }
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 10000);

    return () => clearInterval(interval);
  }, [userId]);

  if (isExpired) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-2xl font-bold">Location Sharing Expired</h1>
        <p>The live location link is no longer active.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div id="map" className="flex-grow" style={{ height: '100%' }}></div>
    </div>
  );
};

export default LiveLocationViewer;