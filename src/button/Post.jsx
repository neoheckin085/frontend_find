//taruh di D:\find\frontend_find\src\button\Post.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, Platform, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../../context/AuthContext';
import Api from '../../libs/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';

const PostScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const [media, setMedia] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const selectedCommunity = route.params?.community;

  useEffect(() => {
    if (!selectedCommunity) {
      Alert.alert('Error', 'Komunitas tidak dipilih');
      navigation.goBack();
    }
  }, [selectedCommunity]);

  const pickMedia = (fromCamera = false) => {
    const options = {
      mediaType: 'photo', // Hanya foto sesuai dengan backend
      quality: 1,
    };

    const callback = (response) => {
      if (!response.didCancel && !response.errorCode) {
        setMedia(response.assets[0]);
      }
    };

    if (fromCamera) {
      launchCamera(options, callback);
    } else {
      launchImageLibrary(options, callback);
    }
  };

  const createFormData = (photo) => {
    const formData = new FormData();
    
    formData.append('title', title);
    formData.append('description', description);
    formData.append('community_id', selectedCommunity.community_id);
    formData.append('user_id', user.user_id);
    
    if (photo) {
      // Pastikan nama file dan tipe file diatur dengan benar
      const fileType = photo.type || 'image/jpeg';
      const fileName = photo.fileName || `photo_${Date.now()}.${fileType.split('/')[1]}`;
      
      console.log('Uploading photo:', {
        name: fileName,
        type: fileType,
        uri: photo.uri
      });
      
      formData.append('image', {
        name: fileName,
        type: fileType,
        uri: Platform.OS === 'ios' ? photo.uri.replace('file://', '') : photo.uri,
      });
    }
    
    return formData;
  };

  const handlePost = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Judul tidak boleh kosong');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Error', 'Deskripsi tidak boleh kosong');
      return;
    }

    if (!media) {
      Alert.alert('Error', 'Pilih gambar dulu');
      return;
    }
    
    if (!selectedCommunity) {
      Alert.alert('Error', 'Komunitas tidak dipilih');
      return;
    }

    setLoading(true);
    
    try {
      // Buat FormData
      const formData = createFormData(media);
      
      // Log untuk debugging
      console.log('Sending post with data:', {
        title,
        description,
        communityId: selectedCommunity.community_id,
        mediaUri: media.uri,
        mediaType: media.type,
        mediaName: media.fileName
      });
      
      // Kirim request ke server
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Anda perlu login kembali');
        setLoading(false);
        return;
      }
      
      // Gunakan Api.post langsung untuk lebih banyak kontrol
      const response = await Api.post('/post', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Post response:', response.data);
      Alert.alert(
        'Sukses',
        'Postingan berhasil dibuat!',
        [{ text: 'OK', onPress: () => navigation.navigate('MainApp', { screen: 'Home' }) }]
      );
      
      // Reset form
      setTitle('');
      setDescription('');
      setMedia(null);
    } catch (error) {
      console.error('Post error:', error);
      console.error('Error response:', error.response?.data);
      
      // Menangani error khusus untuk izin posting
      if (error.response?.data?.error?.includes('not allowed to post')) {
        Alert.alert('Error', 'Anda tidak memiliki izin untuk posting di komunitas ini. Hanya pemilik yang dapat posting.');
      } else {
        Alert.alert(
          'Error',
          'Terjadi kesalahan saat membuat postingan. Silakan coba lagi.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>New Post</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Judul Postingan</Text>
          <TextInput
            placeholder="Judul postingan"
            value={title}
            onChangeText={setTitle}
            style={styles.titleInput}
          />
        </View>

        {/* Selected Community Info */}
        <View style={styles.communityInfo}>
          <Text style={styles.inputLabel}>Komunitas:</Text>
          <Text style={styles.communityName}>{selectedCommunity?.name}</Text>
        </View>

        {/* Image Preview */}
        <TouchableOpacity style={styles.previewBox} onPress={() => pickMedia(false)}>
          {media ? (
            <>
              <Image source={{ uri: media.uri }} style={styles.previewMedia} />
              <Text style={styles.mediaInfo}>
                {media.fileName || 'Gambar dipilih'}
              </Text>
            </>
          ) : (
            <Text style={styles.placeholder}>Tap untuk memilih gambar</Text>
          )}
        </TouchableOpacity>

        {/* Description Input */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.inputLabel}>Deskripsi Postingan</Text>
          <TextInput
            placeholder="Deskripsi postingan"
            value={description}
            onChangeText={setDescription}
            style={styles.caption}
            multiline={true}
            numberOfLines={8}
            textAlignVertical="top"
            returnKeyType="default"
            blurOnSubmit={false}
          />
        </View>

        {/* Add extra padding at the bottom for buttons */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Button Container */}
      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity style={styles.cameraButton} onPress={() => pickMedia(true)}>
          <Text style={styles.buttonText}>📷 Kamera</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.postButton, loading && styles.disabledButton]} 
          onPress={handlePost}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>🚀 Post</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default PostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  contentContainer: {
    flex: 1,
    marginTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 12,
  },
  titleInput: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  pickerContainer: {
    marginBottom: 12,
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  pickerWrapper: {
    marginBottom: 5,
    marginTop: 5,
  },
  dropdownStyle: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
  },
  dropdownContainerStyle: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
  },
  dropdownTextStyle: {
    fontSize: 16,
  },
  noCommunities: {
    color: 'red',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  previewBox: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewMedia: {
    width: '100%',
    height: '90%',
    resizeMode: 'cover',
  },
  mediaInfo: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  placeholder: {
    color: '#aaa',
    fontSize: 16,
  },
  descriptionContainer: {
    marginTop: 12,
    marginBottom: 12,
  },
  caption: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 200,
    maxHeight: 400,
    textAlignVertical: 'top',
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cameraButton: {
    flex: 1,
    backgroundColor: '#212121',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postButton: {
    flex: 1,
    backgroundColor: '#212121',
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 15,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
    color: '#212121',
  },
  communityInfo: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  communityName: {
    fontSize: 16,
    color: '#212121',
    fontWeight: '500',
    marginTop: 4,
  },
});