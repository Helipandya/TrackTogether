// LiveLocationScreen.jsx
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Button, StyleSheet, Alert, Dimensions, TouchableOpacity } from 'react-native';
import { Share } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

export default function LiveLocationScreen({ route }) {
  const [userId, setUserId] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationSharing, setLocationSharing] = useState(false);
  const [duration, setDuration] = useState(15); // in minutes
  const timerRef = useRef(null);
  const intervalRef = useRef(null);

  // Request notification permissions
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Notification permission denied', 'You may not receive sharing notifications.');
      }
    })();
  }, []);

  // Fetch userId from AsyncStorage
  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      console.log('id', id);
      setUserId(id);
    };
    fetchUserId();
  }, []);

  // Shared link pointing to the web viewer page
  const shareableLink = userId ? `https://tracktogetherr.onrender.com/live/${userId}` : '';

  const API_URL = 'http://192.168.29.191:5000/api/users/location'; // Your backend API

  // Fetch current location once when component loads
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Please allow location access to use this feature.');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  // Start sharing location
  const startSharing = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Please allow location access to use this feature.');
      return;
    }

    setLocationSharing(true);

    // Send notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Location Sharing Started',
        body: `Your location is being shared for ${duration} minutes.`,
      },
      trigger: null,
    });

    intervalRef.current = setInterval(async () => {
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords); // Update map marker

      const token = await AsyncStorage.getItem('token');

      try {
        await axios.put(
          API_URL,
          {
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
            duration, // Send duration to backend
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        console.error('Failed to update location:', error.message);
        Alert.alert('Error', 'Failed to update location. Please try again.');
      }
    }, 10000); // Every 10 seconds

    timerRef.current = setTimeout(() => {
      stopSharing();
    }, duration * 60 * 1000); // Stop after duration
  };

  // Stop sharing
  const stopSharing = async () => {
    clearInterval(intervalRef.current);
    clearTimeout(timerRef.current);
    setLocationSharing(false);

    // Send notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Location Sharing Stopped',
        body: 'Your location is no longer being shared.',
      },
      trigger: null,
    });

    Alert.alert('Location sharing stopped');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timerRef.current);
    };
  }, []);

  // Share live location link
  const shareLiveLocation = async () => {
    if (!shareableLink) {
      Alert.alert('Error', 'User ID not available. Please try again.');
      return;
    }

    try {
      const result = await Share.share({
        message: `Track my live location for ${duration} minutes: ${shareableLink}`,
      });

      if (result.action === Share.sharedAction) {
        console.log('Shared successfully');
      }
    } catch (error) {
      console.error('Error sharing location:', error.message);
      Alert.alert('Error', 'Failed to share location link.');
    }
  };

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          style={styles.map}
          region={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          showsUserLocation={true}
        >
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="You are here"
            description="Live location"
          />
        </MapView>
      )}

      <View style={styles.controls}>
        <Text style={styles.label}>Select Duration:</Text>
        <Picker
          selectedValue={duration}
          style={styles.picker}
          onValueChange={(itemValue) => setDuration(itemValue)}
        >
          <Picker.Item label="15 minutes" value={15} />
          <Picker.Item label="1 hour" value={60} />
          <Picker.Item label="2 hours" value={120} />
        </Picker>

        {locationSharing ? (
          <Button title="Stop Sharing" onPress={stopSharing} color="red" />
        ) : (
          <Button title="Start Live Location" onPress={startSharing} color="green" />
        )}

        {!locationSharing && shareableLink && (
          <Button title="Share Location Link" onPress={shareLiveLocation} color="blue" />
        )}

        {locationSharing && shareableLink && (
          <View style={styles.linkContainer}>
            <Text style={styles.linkLabel}>Live Location Link:</Text>
            <TouchableOpacity onPress={shareLiveLocation}>
              <Text style={styles.linkText}>{shareableLink}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: '60%',
  },
  controls: {
    padding: 20,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  picker: {
    height: 50,
    width: 200,
  },
  linkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  linkText: {
    fontSize: 14,
    color: '#1e90ff',
    textDecorationLine: 'underline',
  },
});