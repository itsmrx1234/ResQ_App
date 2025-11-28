import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const HiddenNotes = () => {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const trimmedNote = note.trim();

    if (!trimmedNote) {
      Alert.alert('Empty Note', 'Please enter a note before saving.');
      return;
    }

    try {
      setLoading(true);
      Keyboard.dismiss(); // ✅ hides keyboard after save

      await addDoc(collection(db, 'hidden_notes'), {
        content: trimmedNote,
        createdAt: serverTimestamp(),
      });

      setNote('');
      Alert.alert('Success', 'Note saved securely.');
    } catch (error: any) {
      console.error('Error saving note:', error);
      Alert.alert('Error', error?.message || 'Failed to save note.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Hidden Notes</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your private note here..."
        value={note}
        onChangeText={setNote}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={loading}
        activeOpacity={0.8}
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
