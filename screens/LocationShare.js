import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, PermissionsAndroid, Platform, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import Clipboard from '@react-native-clipboard/clipboard';

const LocationShare = () => {
  const [location, setLocation] = useState(null);

  const getLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const fetchLocation = async () => {
    const hasPermission = await getLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permission denied');
      return;
    }

    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
      },
      error => {
        Alert.alert('Error getting location', error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const copyToClipboard = () => {
    if (location) {
      Clipboard.setString(`Latitude: ${location.latitude}, Longitude: ${location.longitude}`);
      Alert.alert('Copied to clipboard!');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Get Location" onPress={fetchLocation} />
      {location && (
        <View style={styles.info}>
          <Text>Latitude: {location.latitude}</Text>
          <Text>Longitude: {location.longitude}</Text>
          <Button title="Copy Location" onPress={copyToClipboard} />
        </View>
      )}
    </View>
  );
};

export default LocationShare;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  info: { marginTop: 20 },
});
