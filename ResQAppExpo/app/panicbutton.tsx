import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import * as Location from 'expo-location';

const trustedContacts = ['1234567890', '9876543210']; // replace with real contacts

const panicbutton = () => {
  const [isSending, setIsSending] = useState(false);

  const handlePanicPress = async () => {
    try {
      setIsSending(true);

      // Ask location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        setIsSending(false);
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      const message = `🚨 Emergency! I need help. Location: https://maps.google.com/?q=${latitude},${longitude}`;

      // Open default SMS app with prefilled message
      const smsUrl = `sms:${trustedContacts.join(',')}?body=${encodeURIComponent(message)}`;
      await Linking.openURL(smsUrl);

      Alert.alert('Alert Ready', 'SMS opened with your emergency message.');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to send alert.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.panicButton}
        onPress={handlePanicPress}
        disabled={isSending}
      >
        <Text style={styles.panicText}>
          {isSending ? 'Sending...' : 'PANIC'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default panicbutton;

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
    elevation: 10,
  },
  panicText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
});
