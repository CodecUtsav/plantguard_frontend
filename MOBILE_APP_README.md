# PlantGuard AI Mobile App (React Native + Expo)

This is a standalone React Native application built with Expo.

## Setup Instructions

1.  **Initialize Expo Project**:
    ```bash
    npx create-expo-app mobile-app
    cd mobile-app
    ```

2.  **Install Dependencies**:
    ```bash
    npx expo install expo-camera expo-image-picker axios
    ```

3.  **Copy the code below into `App.js`**.

4.  **Run the app**:
    ```bash
    npx expo start
    ```

## App.js Code

```javascript
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  SafeAreaView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import axios from 'axios';

// Replace with your backend URL
const BACKEND_URL = 'https://YOUR_BACKEND_URL/api/analyze';

export default function App() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
      setResult(null);
    }
  };

  const takePhoto = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Camera access is required to take photos.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
      setResult(null);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;

    setLoading(true);
    try {
      // Sending as multipart/form-data
      const formData = new FormData();
      formData.append('image', {
        uri: image.uri,
        name: 'plant.jpg',
        type: 'image/jpeg',
      });

      const response = await axios.post(BACKEND_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to analyze image. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PlantGuard AI</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!image ? (
          <View style={styles.uploadPlaceholder}>
            <Text style={styles.placeholderText}>No image selected</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.iconButton} onPress={takePhoto}>
                <Text style={styles.buttonText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
                <Text style={styles.buttonText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.previewContainer}>
            <Image source={{ uri: image.uri }} style={styles.previewImage} />
            
            {!result && !loading && (
              <TouchableOpacity style={styles.analyzeButton} onPress={analyzeImage}>
                <Text style={styles.analyzeButtonText}>Analyze Plant</Text>
              </TouchableOpacity>
            )}

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#10b981" />
                <Text style={styles.loadingText}>Analyzing plant...</Text>
              </View>
            )}

            {result && (
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>Analysis Result</Text>
                  <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceText}>{result.confidence}</Text>
                  </View>
                </View>

                <View style={styles.resultSection}>
                  <Text style={styles.label}>Disease</Text>
                  <Text style={styles.value}>{result.disease}</Text>
                </View>

                <View style={styles.resultSection}>
                  <Text style={styles.label}>Cause</Text>
                  <Text style={styles.value}>{result.cause}</Text>
                </View>

                <View style={styles.resultSection}>
                  <Text style={styles.label}>Treatment</Text>
                  <Text style={styles.value}>{result.treatment}</Text>
                </View>

                <TouchableOpacity style={styles.resetButton} onPress={() => { setImage(null); setResult(null); }}>
                  <Text style={styles.resetButtonText}>New Analysis</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    height: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#065f46',
  },
  scrollContent: {
    padding: 20,
  },
  uploadPlaceholder: {
    height: 300,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#94a3b8',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  previewContainer: {
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 20,
    marginBottom: 20,
  },
  analyzeButton: {
    backgroundColor: '#059669',
    width: '100%',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#64748b',
  },
  resultCard: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 10,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  confidenceBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  confidenceText: {
    color: '#065f46',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resultSection: {
    marginBottom: 15,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
  },
  resetButton: {
    marginTop: 10,
    padding: 15,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#10b981',
    fontWeight: 'bold',
  }
});
```
