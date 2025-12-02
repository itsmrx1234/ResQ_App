import React, { useState } from 'react';
import { Buffer } from 'buffer';
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
import { encryptBlob, decryptToBlob } from '../utils/crypto';

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

      const response = await fetch(fileUri);
      const blob = await response.blob();
      const encrypted = await encryptBlob(blob);

      const fileRef = ref(storage, `uploads/${Date.now()}_${fileName}`);
      await uploadBytes(fileRef, encrypted.blob, { contentType: 'application/octet-stream' });
      const url = await getDownloadURL(fileRef);

      await addDoc(collection(db, 'uploadedFiles'), {
        name: fileName,
        type: fileType,
        url,
        iv: encrypted.iv,
        tag: encrypted.tag,
        algorithm: encrypted.algorithm,
        keyVersion: encrypted.keyVersion,
        uploadedAt: serverTimestamp(),
      });

      setUploading(false);
      Alert.alert('✅ Success', 'File uploaded securely!');
    } catch (err) {
      console.error('❌ Upload Error:', err);
      setUploading(false);
      Alert.alert('❌ Error', err.message || 'Something went wrong');
    }
  };

  const downloadAndDecrypt = async ({ url, iv, tag, algorithm }) => {
    const response = await fetch(url);
    const cipherBuffer = Buffer.from(await response.arrayBuffer());
    const { blob, migrated, rotated } = await decryptToBlob({
      ciphertext: cipherBuffer,
      iv,
      tag,
      algorithm,
    });
    if (migrated) {
      console.info('Re-encrypted payload available', rotated);
    }
    return blob;
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
