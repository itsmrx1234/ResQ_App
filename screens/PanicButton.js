import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import SendIntentAndroid from 'react-native-send-intent';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
// import { Linking } from 'react-native';

// Linking.openSettings(); // will open device settings

const trustedContacts = ['tel:1234567890', 'tel:9876543210']; // replace with real numbers

const PanicButton = () => {
  const [isSending, setIsSending] = useState(false);

  const requestPermissions = async () => {
    try {
      const locationGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      const smsGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.SEND_SMS
      );

      return (
        locationGranted === PermissionsAndroid.RESULTS.GRANTED &&
        smsGranted === PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const handlePanicPress = async () => {
    setIsSending(true);

    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Location and SMS permissions are required.');
      setIsSending(false);
      return;
    }

    Geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude } = position.coords;
    const message = `🚨 Emergency! I need help. Location: https://maps.google.com/?q=${latitude},${longitude}`;

    trustedContacts.forEach((number) => {
      SendIntentAndroid.sendSms(number.replace('tel:', ''), message);
    });

    Alert.alert('Alert Sent', 'Emergency message sent to trusted contacts.');
    setIsSending(false);
  },
  (error) => {
    Alert.alert(
      'Location Error',
      'GPS seems to be off. Please enable High Accuracy mode in Location Settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
    setIsSending(false);
  },
  { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.panicButton}
        onPress={handlePanicPress}
        disabled={isSending}
      >
        <Text style={styles.panicText}>{isSending ? 'Sending...' : 'PANIC'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PanicButton;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  panicButton: {
    backgroundColor: 'red',
    width: 250,
    height: 250,
    borderRadius: 125,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fff',
    elevation: 10,
  },
  panicText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
});
