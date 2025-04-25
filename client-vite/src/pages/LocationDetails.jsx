import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import "ol/ol.css";
import { Map as OLMap } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import View from "ol/View";
import { fromLonLat } from "ol/proj";
import Point from "ol/geom/Point";
import Feature from "ol/Feature";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Icon, Style } from "ol/style";

import { TbRefresh } from "react-icons/tb";

const socket = io("http://localhost:5000"); // Update if using a different server

const LocationDetails = () => {
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [map, setMap] = useState(null); // Store the map instance
  const token = localStorage.getItem("token");

  // Fetch user info if token exists
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user info", err);
        localStorage.removeItem("token");
      }
    };

    if (token && !user) fetchUser();
  }, [token, user]);

  // Track and emit location
  useEffect(() => {
    if (!user) return;

    const watch = navigator.geolocation.watchPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setLocation({ lat: latitude, lng: longitude });

      socket.emit("locationUpdate", {
        lat: latitude,
        lng: longitude,
        userId: user._id,
      });

      axios.post(
        "http://localhost:5000/api/users/location",
        { lat: latitude, lng: longitude },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    });

    return () => navigator.geolocation.clearWatch(watch);
  }, [user, token]);

  // Listen for broadcasted location updates
  useEffect(() => {
    socket.on("locationBroadcast", (data) => {
      console.log("Broadcasted Location:", data);
      // You can handle the broadcasted locations here if needed
    });
  }, []);

  // Initialize OpenLayers map
  useEffect(() => {
    const mapInstance = new OLMap({
      target: "map", // ID of the DOM element for the map
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([location.lng, location.lat]), // Set initial center to user's location
        zoom: 12, // Initial zoom level
      }),
    });

    setMap(mapInstance); // Save the map instance to state

    // Add a marker for the user's location
    const userLocation = new Feature({
      geometry: new Point(fromLonLat([location.lng, location.lat])),
    });

    userLocation.setStyle(
      new Style({
        image: new Icon({
          src: "https://openlayers.org/en/v4.6.5/examples/data/icon.png", // Change to your preferred icon
          scale: 0.5, // Adjust the size of the icon
        }),
      })
    );

    const vectorSource = new VectorSource({
      features: [userLocation],
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    mapInstance.addLayer(vectorLayer);

    // Update marker position on location change
    if (location.lat !== 0 && location.lng !== 0) {
      userLocation
        .getGeometry()
        .setCoordinates(fromLonLat([location.lng, location.lat]));
    }

    return () => mapInstance.setTarget(undefined); // Cleanup on component unmount
  }, [location]);

  // Auto refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (map && location.lat !== 0 && location.lng !== 0) {
        console.log("called");

        const view = map.getView();
        view.setCenter(fromLonLat([location.lng, location.lat])); // Center map on user's location
      }
    }, 5000);

    return () => clearInterval(interval); // Clean up interval on component unmount
  }, [map, location]);

  // Handle manual refresh
  const handleRefresh = () => {
    console.log("handle refresh called");

    if (map && location.lat !== 0 && location.lng !== 0) {
      const view = map.getView();
      view.setCenter(fromLonLat([location.lng, location.lat])); // Center map on user's location
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">TrackTogether</h1>

      {user ? (
        <div className="bg-white p-4 rounded-xl shadow-md text-center">
          <div className="flex flex-row justify-center">
            <div>
              <p className="text-lg font-medium">Logged in as {user.name}</p>
              {/* Refresh Button */}

              <p className="text-sm text-gray-600">
                Live location: {location.lat.toFixed(4)},{" "}
                {location.lng.toFixed(4)}
              </p>
            </div>
            <div>
              {" "}
              <button
                onClick={handleRefresh}
                className="mt-1 px-3 py-2 ml-4 bg-blue-500 text-white rounded-lg"
              >
              <TbRefresh />
              </button>
            </div>
          </div>

          {/* OpenLayers Map */}
          <div
            id="map"
            style={{ width: "90vw", height: "60vh", marginTop: "20px" }}
          ></div>
        </div>
      ) : (
        <p className="text-gray-600 text-center">
          Please{" "}
          <a href="/login" className="text-blue-500 underline">
            login
          </a>{" "}
          to start tracking.
        </p>
      )}
    </div>
  );
};

export default LocationDetails;
