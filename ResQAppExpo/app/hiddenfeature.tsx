import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  BackHandler,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FEATURES } from '../config/features'; // ✅ Make sure path is correct

const HiddenFeature = () => {
  const router = useRouter();

  const revealNotes = () => {
    if (FEATURES.hiddenNotes) {
      router.push('/hiddennotes');
    } else {
      Alert.alert('Feature Disabled', 'Hidden Notes are not available.');
    }
  };

  const disguiseExit = () => {
    Alert.alert('🕵️ Exit', 'App will now exit silently.');
    BackHandler.exitApp();
  };

  const logoutUser = async () => {
    try {
      await AsyncStorage.multiRemove(['username', 'userPin', 'isRegistered']);
      Alert.alert('Logged out', 'You have been logged out.', [
        { text: 'OK', onPress: () => router.replace('/register') },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to log out. Try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔒 Hidden Features</Text>

      <TouchableOpacity style={styles.button} onPress={revealNotes}>
        <Text style={styles.buttonText}>Reveal Hidden Notes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={disguiseExit}>
        <Text style={styles.buttonText}>Discreet Exit</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={logoutUser}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HiddenFeature;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#333',
    padding: 14,
    marginVertical: 10,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#e53935',
    padding: 14,
    marginTop: 30,
    borderRadius: 12,
  },
  logoutText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
