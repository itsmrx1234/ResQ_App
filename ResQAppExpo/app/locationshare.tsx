import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import * as Clipboard from 'expo-clipboard';

const LocationShare = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLocation = async () => {
    try {
      setLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required.');
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setLocation(coords);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Unable to get location.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (location) {
      const text = `Latitude: ${location.latitude}, Longitude: ${location.longitude}`;
      await Clipboard.setStringAsync(text);
      Alert.alert('Copied!', 'Location copied to clipboard.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={fetchLocation} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Fetching...' : 'Get Location'}</Text>
      </TouchableOpacity>

      {location && (
        <View style={styles.info}>
          <Text style={styles.coordText}>📍 Latitude: {location.latitude}</Text>
          <Text style={styles.coordText}>📍 Longitude: {location.longitude}</Text>

          <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
            <Text style={styles.copyText}>Copy Location</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default LocationShare;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007aff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  info: {
    marginTop: 30,
    alignItems: 'center',
  },
  coordText: {
    fontSize: 16,
    marginVertical: 5,
    color: '#333',
  },
  copyButton: {
    marginTop: 15,
    backgroundColor: '#34c759',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  copyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
