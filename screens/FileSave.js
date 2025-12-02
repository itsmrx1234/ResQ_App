import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { storage, db } from '../config/firebase';
import { encryptArrayBuffer } from '../utils/crypto';

const FileSave = () => {
  const [uploading, setUploading] = useState(false);

  const handleFilePick = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'mixed', // allows all types: image, video, file
        selectionLimit: 1,
      });

      if (result.didCancel || !result.assets || result.assets.length === 0) {
        console.log('User cancelled picker');
        return;
      }

      const file = result.assets[0];
      const fileUri = file.uri;
      const fileName = file.fileName || `file_${Date.now()}`;
      const fileType = file.type || 'application/octet-stream';

      setUploading(true);

      // Convert to blob
      const response = await fetch(fileUri);
      const blob = await response.blob();
      const encryptedPayload = encryptArrayBuffer(await blob.arrayBuffer());
      const encryptedBlob = new Blob([encryptedPayload], { type: 'text/plain' });

      // Upload to Firebase
      const fileRef = ref(storage, `uploads/${Date.now()}_${fileName}`);
      await uploadBytes(fileRef, encryptedBlob);
      const url = await getDownloadURL(fileRef);

      // Store metadata in Firestore
      await addDoc(collection(db, 'uploadedFiles'), {
        name: fileName,
        type: fileType,
        url,
        uploadedAt: serverTimestamp(),
        encrypted: true,
      });

      setUploading(false);
      Alert.alert('✅ Success', 'File uploaded successfully!');
    } catch (err) {
      console.error('❌ Upload Error:', err);
      setUploading(false);
      Alert.alert('❌ Error', err.message || 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Secure File Upload</Text>

      <TouchableOpacity style={styles.button} onPress={handleFilePick} disabled={uploading}>
        <Text style={styles.buttonText}>
          {uploading ? 'Uploading...' : 'Pick and Upload File'}
        </Text>
        {uploading && <ActivityIndicator color="#fff" style={{ marginLeft: 10 }} />}
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
