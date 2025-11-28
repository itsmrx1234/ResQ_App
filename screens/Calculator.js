import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Calculator = ({ navigation }) => {
  const [input, setInput] = useState('');
  const [expression, setExpression] = useState('');

  const handlePress = async (val) => {
    if (val === 'C') {
      setInput('');
      setExpression('');
      return;
    }

    if (val === '=') {
      try {
        const result = eval(expression).toString();
        setInput(result);
        setExpression(result);
      } catch (error) {
        Alert.alert('Invalid Expression');
        setInput('');
        setExpression('');
      }
      return;
    }

    const newExpression = expression + val;
    setExpression(newExpression);
    setInput(newExpression);

    // Extract only digits
    const onlyDigits = newExpression.replace(/\D/g, '');

    // If entered 6 digits
    if (onlyDigits.length === 6) {
      // Case 1: Reset PIN entered
      if (onlyDigits === '000000') {
        await AsyncStorage.removeItem('userPin');
        setInput('');
        setExpression('');
        Alert.alert(
          'PIN Reset',
          'Your PIN has been reset. Please register a new PIN.'
        );
        navigation.replace('Register');
        return;
      }

      // Case 2: Match stored PIN
      const storedPin = await AsyncStorage.getItem('userPin');
      if (storedPin && onlyDigits === storedPin) {
        setInput('');
        setExpression('');
        navigation.replace('Home');
      }
    }
  };

  const buttons = [
    ['7', '8', '9', '/'],
    ['4', '5', '6', '*'],
    ['1', '2', '3', '-'],
    ['0', 'C', '=', '+'],
  ];

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={input}
        editable={false}
        placeholder="0"
        placeholderTextColor="#999"
      />

      {buttons.map((row, i) => (
        <View key={i} style={styles.row}>
          {row.map((val) => (
            <CalcButton key={val} val={val} onPress={handlePress} />
          ))}
        </View>
      ))}
    </View>
  );
};

const CalcButton = ({ val, onPress }) => (
  <TouchableOpacity style={styles.button} onPress={() => onPress(val)}>
    <Text style={styles.buttonText}>{val}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  input: {
    fontSize: 36,
    height: 70,
    width: '90%',
    borderColor: '#ccc',
    borderWidth: 1,
    textAlign: 'right',
    marginBottom: 20,
    borderRadius: 10,
    paddingHorizontal: 10,
    color: '#000',
  },
  row: { flexDirection: 'row' },
  button: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    margin: 10,
    borderRadius: 10,
    minWidth: 70,
    alignItems: 'center',
  },
  buttonText: { fontSize: 24, color: '#333' },
});

export default Calculator;
