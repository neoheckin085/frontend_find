import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../../context/AuthContext';
import Api from '../../libs/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

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
    const options = { mediaType: 'photo', quality: 1 };

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
      const fileType = photo.type || 'image/jpeg';
      const fileName = photo.fileName || `photo_${Date.now()}.${fileType.split('/')[1]}`;
      formData.append('image', {
        name: fileName,
        type: fileType,
        uri: Platform.OS === 'ios' ? photo.uri.replace('file://', '') : photo.uri,
      });
    }
    return formData;
  };

  const handlePost = async () => {
    if (!title.trim()) return Alert.alert('Error', 'Title cannot be empty');
    if (!description.trim()) return Alert.alert('Error', 'Description cannot be empty');
    if (!media) return Alert.alert('Error', 'Select the image');
    if (!selectedCommunity) return Alert.alert('Error', 'Community not selected');

    setLoading(true);
    try {
      const formData = createFormData(media);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'You need to log back in');
        setLoading(false);
        return;
      }

      const response = await Api.post('/post', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert('Sukses', 'Postingan berhasil dibuat!', [
        { text: 'OK', onPress: () => navigation.navigate('MainApp', { screen: 'Home' }) },
      ]);
      setTitle('');
      setDescription('');
      setMedia(null);
    } catch (error) {
      console.error('Post error:', error);
      if (error.response?.data?.error?.includes('not allowed to post')) {
        Alert.alert('Error', 'You do not have permission to post in this community. Only owners can post.');
      } else {
        Alert.alert('Error', 'An error occurred while creating the post. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New post</Text>
        </View>

        <Text style={styles.label}>Post Title</Text>
        <TextInput
          placeholder="The title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <View style={{ backgroundColor: '#f2f2f2', borderRadius: 16, padding: 12, marginHorizontal: 20, marginBottom: 10 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Community:</Text>
        <Text style={{ fontSize: 16 }}>{selectedCommunity?.name}</Text>
        </View>

        <TouchableOpacity style={styles.previewBox} onPress={() => pickMedia(false)}>
          {media ? (
            <Image source={{ uri: media.uri }} style={styles.previewMedia} />
          ) : (
            <Text style={styles.placeholder}>Press to select an image</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Description</Text>
        <TextInput
          placeholder="Write something..."
          value={description}
          onChangeText={setDescription}
          style={styles.caption}
          multiline
        />
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity style={styles.cameraButton} onPress={() => pickMedia(true)}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <FontAwesome name="camera" size={20} color="#fff" />
            <Text style={styles.buttonText}> Kamera</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.postButton, loading && styles.disabledButton]}
          onPress={handlePost}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesome name="share" size={20} color="#fff" />
              <Text style={styles.buttonText}> Post</Text>
            </View>
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
  },
  scrollContainer: {
    paddingBottom: 150,
  },
  header: {
    backgroundColor: '#000',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  label: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    fontWeight: '500',
    color: '#000',
  },
  input: {
    marginHorizontal: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 24,
  },
  communityName: {
    marginHorizontal: 16,
    marginTop: 4,
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  previewBox: {
    margin: 16,
    height: 200,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewMedia: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    fontSize: 16,
    color: '#444',
  },
  caption: {
    marginHorizontal: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    textAlignVertical: 'top',
    minHeight: 100,
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
    fontSize: 15,
    marginLeft: 6,
  },
});
