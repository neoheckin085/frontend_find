// D:\find\frontend_find\src\components\EditProfil.js

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ScrollView, ActivityIndicator, Modal, TouchableWithoutFeedback, ImageBackground, Keyboard, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { launchImageLibrary } from 'react-native-image-picker';
import API_CONFIG from '../../src/config/apiConfig';
import Icon from 'react-native-vector-icons/MaterialIcons';

const EditProfil = ({ navigation }) => {
  const { user, updateProfile, getUserById, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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
  
  // Field validations
  const [errors, setErrors] = useState({
    email: '',
    whatsapp: '',
  });

  // Fetch user data directly 
  const fetchUserData = async () => {
    setLoading(true);
    if (token) {
      await getUserById(setDetailUser, setFetchError, () => {});
    }
    setLoading(false);
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

  // Validate email on change
  const validateEmail = (text) => {
    setEmail(text);
    if (text) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(text)) {
        setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      } else {
        setErrors(prev => ({ ...prev, email: '' }));
      }
    } else {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  // Validate phone number on change
  const validateWhatsapp = (text) => {
    setWhatsapp(text);
    if (text) {
      if (!/^\d+$/.test(text)) {
        setErrors(prev => ({ ...prev, whatsapp: 'Phone number should contain only digits' }));
      } else {
        setErrors(prev => ({ ...prev, whatsapp: '' }));
      }
    } else {
      setErrors(prev => ({ ...prev, whatsapp: '' }));
    }
  };

  const openPhotoModal = () => {
    Keyboard.dismiss();
    setPhotoModalVisible(true);
  };

  const closePhotoModal = () => {
    setPhotoModalVisible(false);
  };
  
  const openBackgroundModal = () => {
    Keyboard.dismiss();
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
    setBackground({ uri: null, deleted: true, useProfilePhoto: true });
    closeBackgroundModal();
  };

  const handleSave = async () => {
    // Check for validation errors first
    if (errors.email || errors.whatsapp) {
      Alert.alert('Validation Error', 'Please fix the errors before saving.');
      return;
    }
    
    setSaving(true);
    try {
      const userData = {
        name,
        tentang,
        nomor_telepon: whatsapp,
        lokasi,
        email,
        photo: photo?.deleted ? { deleted: true } : photo,
        background: background?.deleted ? 
          (background.useProfilePhoto ? { deleted: true, use_profile_photo: true } : { deleted: true }) 
          : background
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
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View>
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
          {background ? 
            (background.deleted ? 
              (background.useProfilePhoto && detailUser?.photo ? 
                <ImageBackground
                  source={{ uri: API_CONFIG.getStorageUrl(detailUser.photo) }}
                  style={styles.backgroundPhoto}
                  blurRadius={5}
                />
                : 
                <ImageBackground
                  source={require('../assets/default-avatar.png')} 
                  style={styles.backgroundPhoto}
                  blurRadius={5}
                />
              ) 
              : 
              <Image
                source={{ uri: background.uri }}
                style={styles.backgroundPhoto}
              />
            ) 
            : displayBackground ? 
              (displayBackground === API_CONFIG.getStorageUrl(detailUser?.photo) ?
                <ImageBackground
                  source={{ uri: displayBackground }}
                  style={styles.backgroundPhoto}
                  blurRadius={5}
                />
                :
                <Image
                  source={{ uri: displayBackground }}
                  style={styles.backgroundPhoto}
                />
              )
              : detailUser?.background ? 
                (detailUser?.background === detailUser?.photo ?
                  <ImageBackground
                    source={{ uri: API_CONFIG.getStorageUrl(detailUser.background) }}
                    style={styles.backgroundPhoto}
                    blurRadius={5}
                  />
                  :
                  <Image
                    source={{ uri: API_CONFIG.getStorageUrl(detailUser.background) }}
                    style={styles.backgroundPhoto}
                  />
                )
                : detailUser?.photo ? 
                  <ImageBackground
                    source={{ uri: API_CONFIG.getStorageUrl(detailUser.photo) }}
                    style={styles.backgroundPhoto}
                    blurRadius={5}
                  />
                  : 
                  <ImageBackground
                    source={require('../assets/default-avatar.png')}
                    style={styles.backgroundPhoto}
                    blurRadius={5}
                  />
          }
          <Text style={styles.changePhotoText}>Change Background Photo</Text>
        </TouchableOpacity>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>About</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell us about yourself"
            value={tentang}
            onChangeText={setTentang}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>WhatsApp</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your WhatsApp number"
            value={whatsapp}
            onChangeText={validateWhatsapp}
            keyboardType="phone-pad"
          />
          {errors.whatsapp ? (
            <Text style={styles.errorText}>{errors.whatsapp}</Text>
          ) : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your location"
            value={lokasi}
            onChangeText={setLokasi}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email address"
            value={email}
            onChangeText={validateEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email ? (
            <Text style={styles.errorText}>{errors.email}</Text>
          ) : null}
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, (saving || Boolean(errors.email) || Boolean(errors.whatsapp)) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving || Boolean(errors.email) || Boolean(errors.whatsapp)}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      
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
                  <View style={styles.optionContent}>
                    <Icon name="photo-library" size={24} color="#007AFF" />
                    <Text style={styles.bottomSheetOptionText}>Choose from Gallery</Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.bottomSheetOption} 
                  onPress={handleDeletePhoto}
                >
                  <View style={styles.optionContent}>
                    <Icon name="delete" size={24} color="#FF3B30" />
                    <Text style={styles.deleteOptionText}>Delete Photo</Text>
                  </View>
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
                  {background ? 
                    (background.deleted ? 
                      (background.useProfilePhoto && detailUser?.photo ? 
                        <ImageBackground
                          source={{ uri: API_CONFIG.getStorageUrl(detailUser.photo) }}
                          style={styles.backgroundPreview}
                          blurRadius={5}
                        />
                        : 
                        <ImageBackground
                          source={require('../assets/default-avatar.png')} 
                          style={styles.backgroundPreview}
                          blurRadius={5}
                        />
                      ) 
                      : 
                      <Image
                        source={{ uri: background.uri }}
                        style={styles.backgroundPreview}
                      />
                    ) 
                    : displayBackground ? 
                      (displayBackground === API_CONFIG.getStorageUrl(detailUser?.photo) ?
                        <ImageBackground
                          source={{ uri: displayBackground }}
                          style={styles.backgroundPreview}
                          blurRadius={5}
                        />
                        :
                        <Image
                          source={{ uri: displayBackground }}
                          style={styles.backgroundPreview}
                        />
                      )
                      : detailUser?.background ? 
                        (detailUser?.background === detailUser?.photo ?
                          <ImageBackground
                            source={{ uri: API_CONFIG.getStorageUrl(detailUser.background) }}
                            style={styles.backgroundPreview}
                            blurRadius={5}
                          />
                          :
                          <Image
                            source={{ uri: API_CONFIG.getStorageUrl(detailUser.background) }}
                            style={styles.backgroundPreview}
                          />
                        )
                        : detailUser?.photo ? 
                          <ImageBackground
                            source={{ uri: API_CONFIG.getStorageUrl(detailUser.photo) }}
                            style={styles.backgroundPreview}
                            blurRadius={5}
                          />
                          : 
                          <ImageBackground
                            source={require('../assets/default-avatar.png')}
                            style={styles.backgroundPreview}
                            blurRadius={5}
                          />
                  }
                </View>
                
                <TouchableOpacity 
                  style={styles.bottomSheetOption} 
                  onPress={() => handleImagePicker(false)}
                >
                  <View style={styles.optionContent}>
                    <Icon name="photo-library" size={24} color="#007AFF" />
                    <Text style={styles.bottomSheetOptionText}>Choose from Gallery</Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.bottomSheetOption} 
                  onPress={handleDeleteBackground}
                >
                  <View style={styles.optionContent}>
                    <Icon name="delete" size={24} color="#FF3B30" />
                    <Text style={styles.deleteOptionText}>Delete Photo</Text>
                  </View>
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
    </View>
  );
};

// Use StyleSheet.create for better performance
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
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
  formGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
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
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomSheetOptionText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 12,
  },
  deleteOptionText: {
    fontSize: 16,
    color: '#FF3B30',
    marginLeft: 12,
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
});

export default EditProfil;