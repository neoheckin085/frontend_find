// D:\find\frontend_find\src\components\EditProfil.js

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { launchImageLibrary } from 'react-native-image-picker';
import API_CONFIG from '../../src/config/apiConfig';

const EditProfil = ({ navigation }) => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [tentang, setTentang] = useState(user?.tentang || '');
  const [whatsapp, setWhatsapp] = useState(user?.nomor_telepon || '');
  const [lokasi, setLokasi] = useState(user?.lokasi || '');
  const [email, setEmail] = useState(user?.email || '');
  const [photo, setPhoto] = useState(null);
  const [background, setBackground] = useState(null);

  const handleImagePicker = async (isProfile = true) => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    try {
      const result = await new Promise((resolve) => {
        launchImageLibrary(options, resolve);
      });

      if (!result.didCancel && !result.error) {
        const selectedImage = result.assets[0];
        if (isProfile) {
          setPhoto(selectedImage);
        } else {
          setBackground(selectedImage);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };
  const handleSave = async () => {
    setLoading(true);
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email && !emailRegex.test(email)) {
        Alert.alert('Validation Error', 'Please enter a valid email address');
        setLoading(false);
        return;
      }
      
      // Validate phone number format (simple validation)
      if (whatsapp && !/^\d+$/.test(whatsapp)) {
        Alert.alert('Validation Error', 'Phone number should contain only digits');
        setLoading(false);
        return;
      }

      const userData = {
        name,
        tentang,
        nomor_telepon: whatsapp,
        lokasi,
        email,
        photo,
        background
      };

      console.log('Submitting profile data:', userData);
      const response = await updateProfile(userData);
      
      if (response.success) {
        // Force profile refresh by triggering a getUserById call
        Alert.alert('Success', 'Profile updated successfully', [
          { text: 'OK', onPress: async () => {
            navigation.goBack();
          }}
        ]);
      } else {
        // Check for validation errors
        if (response.error?.validationErrors) {
          const errorMessages = [];
          Object.entries(response.error.validationErrors).forEach(([field, messages]) => {
            errorMessages.push(`${field}: ${messages.join(', ')}`);
          });
          Alert.alert('Validation Error', errorMessages.join('\n'));
        } else {
          Alert.alert('Error', response.error?.message || 'Failed to update profile');
        }
      }
    } catch (error) {
      console.error('Error in handleSave:', error);
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.photoContainer} onPress={() => handleImagePicker(true)}>
        <Image
          source={photo ? { uri: photo.uri } : user?.photo ? { uri: API_CONFIG.getStorageUrl(user.photo) } : require('../assets/default-avatar.png')}
          style={styles.profilePhoto}
        />
        <Text style={styles.changePhotoText}>Change Profile Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backgroundContainer} onPress={() => handleImagePicker(false)}>
        <Image
          source={background ? { uri: background.uri } : user?.background ? { uri: API_CONFIG.getStorageUrl(user.background) } : require('../assets/default-background.png')}
          style={styles.backgroundPhoto}
        />
        <Text style={styles.changePhotoText}>Change Background Photo</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="About"
        value={tentang}
        onChangeText={setTentang}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="WhatsApp"
        value={whatsapp}
        onChangeText={setWhatsapp}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={lokasi}
        onChangeText={setLokasi}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TouchableOpacity 
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = {
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  backgroundPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  changePhotoText: {
    color: '#007AFF',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
};

export default EditProfil;