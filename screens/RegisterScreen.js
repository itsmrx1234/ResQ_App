import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  const handleRegister = async () => {
    if (!username.trim()) {
      Alert.alert('Username required', 'Please enter a username.');
      return;
    }

    if (pin.length !== 6 || isNaN(pin)) {
      Alert.alert('Invalid PIN', 'PIN must be a 6-digit number.');
      return;
    }

    if (pin === '000000') {
      Alert.alert('Invalid PIN', '000000 is reserved for resetting. Please choose another PIN.');
      return;
    }

    try {
      await AsyncStorage.multiSet([
        ['username', username],
        ['userPin', pin],
        ['isRegistered', 'true']  // <-- Mark as registered
      ]);
      Alert.alert('Success', 'Account created!', [
        { text: 'OK', onPress: () => navigation.replace('Calculator') },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save details. Try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Register</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter username"
        value={username}
        onChangeText={setUsername}
        placeholderTextColor="#999"
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.pinInput}
          keyboardType="numeric"
          secureTextEntry={!showPin}
          maxLength={6}
          placeholder="Enter 6-digit PIN"
          value={pin}
          onChangeText={setPin}
          placeholderTextColor="#999"
        />
        <TouchableOpacity onPress={() => setShowPin(!showPin)}>
          <Icon
            name={showPin ? 'eye-off-outline' : 'eye-outline'}
            size={24}
            color="#333"
          />
        </TouchableOpacity>
      </View>

      {/* ⚠️ Security Note */}
      <Text style={styles.note}>
        Note: Do not set your PIN as 000000. It is reserved for resetting and reopening registration.
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  heading: { fontSize: 22, marginBottom: 30, fontWeight: 'bold' },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    color: '#000',
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  pinInput: {
    flex: 1,
    height: 50,
    fontSize: 18,
    color: '#000',
  },
  note: {
    fontSize: 14,
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  buttonText: { color: '#fff', fontSize: 18 },
});

export default RegisterScreen;
