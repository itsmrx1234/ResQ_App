import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';

const SOSDial = () => {
  const handleEmergencyCall = () => {
    Alert.alert(
      'Confirm Emergency Call',
      'This will call 112 (India National Emergency Number). Do you want to proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            Linking.openURL('tel:112');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.alertText}>⚠️ Use only in case of emergency</Text>

      <Text style={styles.title}>Emergency Number</Text>
      <Text style={styles.number}>112</Text>

      <TouchableOpacity style={styles.callButton} onPress={handleEmergencyCall}>
        <Text style={styles.callText}>Call 112</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SOSDial;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  alertText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  number: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 30,
  },
  callButton: {
    backgroundColor: 'red',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  callText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
