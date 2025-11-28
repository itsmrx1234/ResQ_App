import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../config/firebase';

const FileSave: React.FC = () => {
  const [uploading, setUploading] = useState(false);

  const handleFilePick = async () => {
    try {
      // Ask for permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need access to your files to upload.');
        return;
      }

      // Launch file picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log('User cancelled picker');
        return;
      }

      const file = result.assets[0];
      const fileUri = file.uri;
      if (!fileUri) throw new Error('File URI not found');

      const fileName = file.fileName || `file_${Date.now()}`;
      const fileType = file.type || 'application/octet-stream';

      setUploading(true);

      // Convert URI to Blob
      const response = await fetch(fileUri);
      const blob = await response.blob();

      // Upload to Firebase Storage
      const fileRef = ref(storage, `uploads/${Date.now()}_${fileName}`);
      await uploadBytes(fileRef, blob);
      const url = await getDownloadURL(fileRef);

      // Store metadata in Firestore
      await addDoc(collection(db, 'uploadedFiles'), {
        name: fileName,
        type: fileType,
        url,
        uploadedAt: serverTimestamp(),
      });

      setUploading(false);
      Alert.alert('✅ Success', 'File uploaded successfully!');
    } catch (err) {
      console.error('❌ Upload Error:', err);
      setUploading(false);

      if (err instanceof Error) {
        Alert.alert('❌ Error', err.message);
      } else {
        Alert.alert('❌ Error', 'Something went wrong.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Secure File Upload</Text>

      <TouchableOpacity
        style={[styles.button, uploading && { opacity: 0.6 }]}
        onPress={handleFilePick}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Pick and Upload File</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default FileSave;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
