import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const HiddenNotes = () => {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!note.trim()) {
      Alert.alert('Please enter a note');
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, 'hidden_notes'), {
        content: note,
        createdAt: serverTimestamp(),
      });
      setNote('');
      Alert.alert('Note saved securely');
    } catch (error) {
      Alert.alert('Error saving note', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Hidden Notes</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter any text"
        value={note}
        onChangeText={setNote}
        multiline
        numberOfLines={4}
      />
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save Log</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default HiddenNotes;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    paddingTop: 50,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    height: 120,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#2e86de',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#7fb3f1',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});
