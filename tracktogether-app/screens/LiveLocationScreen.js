import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Button, StyleSheet, Alert, Dimensions } from 'react-native';
import { Share } from 'react-native';

import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
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
  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      console.log("id" , id);
      
      setUserId(id);
    };
    fetchUserId();
  }, []);
  
  const shareableLink = `https://tracktogether.onrender.com/live/${userId}`;


  const API_URL = 'http://192.168.29.191:5000/api/users/location'; // your local API

  // Fetch current location once when component loads
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied');
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
      Alert.alert('Permission denied');
      return;
    }

    setLocationSharing(true);

    intervalRef.current = setInterval(async () => {
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords); // update map marker too

      const token = await AsyncStorage.getItem('token');

      try {
        await axios.put(
          API_URL,
          {
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        console.error('Failed to update location:', error.message);
      }
    }, 10000); // every 10 seconds

    timerRef.current = setTimeout(() => {
      stopSharing();
    }, duration * 60 * 1000);
  };

  // Stop sharing
  const stopSharing = () => {
    clearInterval(intervalRef.current);
    clearTimeout(timerRef.current);
    setLocationSharing(false);
    Alert.alert('Location sharing stopped');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timerRef.current);
    };
  }, []);

  const shareLiveLocation = async () => {
    try {
      const result = await Share.share({
        message: `Track my live location here: ${shareableLink}`,
      });
  
      if (result.action === Share.sharedAction) {
        console.log('Shared successfully');
      }
    } catch (error) {
      console.error('Error sharing location:', error.message);
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
        <Text>Select Duration:</Text>
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
  <Button title="Share Location Link" onPress={shareLiveLocation} />
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
  picker: {
    height: 50,
    width: 200,
  },
});
