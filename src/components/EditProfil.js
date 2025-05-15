// D:\find\frontend_find\src\components\EditProfil.js

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ScrollView, ActivityIndicator, Modal, TouchableWithoutFeedback } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { launchImageLibrary } from 'react-native-image-picker';
import API_CONFIG from '../../src/config/apiConfig';

const EditProfil = ({ navigation }) => {
  const { user, updateProfile, getUserById, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [tentang, setTentang] = useState(user?.tentang || '');
  const [whatsapp, setWhatsapp] = useState(user?.nomor_telepon || '');
  const [lokasi, setLokasi] = useState(user?.lokasi || '');
  const [email, setEmail] = useState(user?.email || '');
  const [photo, setPhoto] = useState(null);
  const [background, setBackground] = useState(null);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [backgroundModalVisible, setBackgroundModalVisible] = useState(false);
  const [displayPhoto, setDisplayPhoto] = useState(null);
  const [displayBackground, setDisplayBackground] = useState(null);
  const [detailUser, setDetailUser] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  // Fetch user data directly 
  const fetchUserData = async () => {
    if (token) {
      await getUserById(setDetailUser, setFetchError, () => {});
    }
  };

  // Initialize from detailUser data
  useEffect(() => {
    if (detailUser) {
      if (detailUser.photo) {
        const photoUrl = API_CONFIG.getStorageUrl(detailUser.photo);
        setDisplayPhoto(photoUrl);
      }
      
      if (detailUser.background) {
        const backgroundUrl = API_CONFIG.getStorageUrl(detailUser.background);
        setDisplayBackground(backgroundUrl);
      }
      
      // Also update other fields if not already set
      if (!name && detailUser.name) setName(detailUser.name);
      if (!tentang && detailUser.tentang) setTentang(detailUser.tentang);
      if (!whatsapp && detailUser.nomor_telepon) setWhatsapp(detailUser.nomor_telepon);
      if (!lokasi && detailUser.lokasi) setLokasi(detailUser.lokasi);
      if (!email && detailUser.email) setEmail(detailUser.email);
    }
  }, [detailUser]);

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, [token]);

  const openPhotoModal = () => {
    setPhotoModalVisible(true);
  };

  const closePhotoModal = () => {
    setPhotoModalVisible(false);
  };
  
  const openBackgroundModal = () => {
    setBackgroundModalVisible(true);
  };

  const closeBackgroundModal = () => {
    setBackgroundModalVisible(false);
  };

  const handleImagePicker = async (isProfile = true) => {
    if (isProfile) {
      closePhotoModal();
    } else {
      closeBackgroundModal();
    }
    
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
  
  const handleDeletePhoto = () => {
    setPhoto({ uri: null, deleted: true });
    closePhotoModal();
  };
  
  const handleDeleteBackground = () => {
    setBackground({ uri: null, deleted: true });
    closeBackgroundModal();
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
        photo: photo?.deleted ? { deleted: true } : photo,
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
      <TouchableOpacity style={styles.photoContainer} onPress={openPhotoModal}>
        <Image
          source={photo ? 
            (photo.deleted ? require('../assets/default-avatar.png') : { uri: photo.uri }) : 
            displayPhoto ? { uri: displayPhoto } : 
            detailUser?.photo ? { uri: API_CONFIG.getStorageUrl(detailUser.photo) } :
            require('../assets/default-avatar.png')}
          style={styles.profilePhoto}
        />
        <Text style={styles.changePhotoText}>Change Profile Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backgroundContainer} onPress={openBackgroundModal}>
        <Image
          source={background ? 
            (background.deleted ? require('../assets/default-background.png') : { uri: background.uri }) : 
            displayBackground ? { uri: displayBackground } :
            detailUser?.background ? { uri: API_CONFIG.getStorageUrl(detailUser.background) } : 
            require('../assets/default-background.png')}
          style={styles.backgroundPhoto}
        />
        <Text style={styles.changePhotoText}>Change Background Photo</Text>
      </TouchableOpacity>
      
      {/* Profile Photo Options Modal */}
      <Modal
        visible={photoModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closePhotoModal}
      >
        <TouchableWithoutFeedback onPress={closePhotoModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.bottomSheet}>
                <Text style={styles.bottomSheetTitle}>Profile Photo</Text>
                
                {/* Add profile photo preview */}
                <View style={styles.photoPreviewContainer}>
                  <Image
                    source={photo ? 
                      (photo.deleted ? require('../assets/default-avatar.png') : { uri: photo.uri }) : 
                      displayPhoto ? { uri: displayPhoto } : 
                      detailUser?.photo ? { uri: API_CONFIG.getStorageUrl(detailUser.photo) } :
                      require('../assets/default-avatar.png')}
                    style={styles.photoPreview}
                  />
                </View>
                
                <TouchableOpacity 
                  style={styles.bottomSheetOption} 
                  onPress={() => handleImagePicker(true)}
                >
                  <Text style={styles.bottomSheetOptionText}>Choose from Gallery</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.bottomSheetOption} 
                  onPress={handleDeletePhoto}
                >
                  <Text style={styles.bottomSheetOptionText}>Delete Photo</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={closePhotoModal}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      
      {/* Background Photo Options Modal */}
      <Modal
        visible={backgroundModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeBackgroundModal}
      >
        <TouchableWithoutFeedback onPress={closeBackgroundModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.bottomSheet}>
                <Text style={styles.bottomSheetTitle}>Background Photo</Text>
                
                {/* Add background photo preview */}
                <View style={styles.photoPreviewContainer}>
                  <Image
                    source={background ? 
                      (background.deleted ? require('../assets/default-background.png') : { uri: background.uri }) : 
                      displayBackground ? { uri: displayBackground } : 
                      detailUser?.background ? { uri: API_CONFIG.getStorageUrl(detailUser.background) } :
                      require('../assets/default-background.png')}
                    style={styles.backgroundPreview}
                  />
                </View>
                
                <TouchableOpacity 
                  style={styles.bottomSheetOption} 
                  onPress={() => handleImagePicker(false)}
                >
                  <Text style={styles.bottomSheetOptionText}>Choose from Gallery</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.bottomSheetOption} 
                  onPress={handleDeleteBackground}
                >
                  <Text style={styles.bottomSheetOptionText}>Delete Photo</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={closeBackgroundModal}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

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
  backgroundContainer: {
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
  // Bottom sheet styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  bottomSheetOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  bottomSheetOptionText: {
    fontSize: 16,
    color: '#007AFF',
  },
  cancelButton: {
    marginTop: 20,
    paddingVertical: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: 'red',
    fontWeight: 'bold',
  },
  photoPreviewContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  backgroundPreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
};

export default EditProfil;