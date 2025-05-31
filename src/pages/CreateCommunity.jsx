import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
  Modal,
  FlatList
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import { useAuth } from '../../context/AuthContext';
import Api from '../../libs/Api';
import MapView, { Marker } from 'react-native-maps';
import CheckBox from '@react-native-community/checkbox';
import API_CONFIG from '../config/apiConfig';

const CreateCommunity = ({ navigation }) => {
  const { user, token } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [latLng, setLatLng] = useState({ latitude: null, longitude: null });
  const [createChatGroup, setCreateChatGroup] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);

  useEffect(() => {
    console.log('Component mounted, fetching users...');
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      console.log('API URL:', Api.defaults.baseURL);
      console.log('Token:', token);
      
      const response = await Api.get('/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response data:', JSON.stringify(response.data, null, 2));
      
      if (Array.isArray(response.data)) {
        // Log user photo data
        response.data.forEach(user => {
          console.log('User photo data:', {
            userId: user.user_id,
            name: user.name,
            photo: user.photo,
            photoUrl: user.photo ? getImageUrl(user.photo) : null
          });
        });
        
        setUsers(response.data);
        console.log('Users set successfully:', response.data.length);
      } else {
        console.error('Response data is not an array:', response.data);
        Alert.alert('Error', 'Format data tidak valid');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      Alert.alert('Error', 'Gagal mengambil data pengguna');
    }
  };

  const pickImage = async () => {
    launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
    }, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Gagal memilih gambar');
        return;
      }
      if (response.assets && response.assets.length > 0) {
        setImage(response.assets[0]);
      }
    });
  };

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setLatLng({ latitude, longitude });
    setShowMap(false);
  };

  const handleSubmit = async () => {
    // Check all required fields
    const missingFields = [];
    if (!name) missingFields.push('Nama Komunitas');
    if (!description) missingFields.push('Deskripsi');
    if (!capacity) missingFields.push('Kapasitas');
    if (!latLng.latitude || !latLng.longitude) missingFields.push('Lokasi');
    if (!selectedOwner) missingFields.push('Owner');
    if (!image) missingFields.push('Gambar');
    if (selectedMembers.length === 0) missingFields.push('Member');

    if (missingFields.length > 0) {
      Alert.alert(
        'Data Belum Lengkap',
        `Mohon lengkapi data berikut:\n${missingFields.join('\n')}`
      );
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('capacity', capacity);
      formData.append('latitude', latLng.latitude);
      formData.append('longitude', latLng.longitude);
      formData.append('owner_name', selectedOwner.name);
      selectedMembers.forEach(member => {
        formData.append('anggota[]', member.user_id);
      });
      formData.append('create_chat_group', createChatGroup ? '1' : '0');
      formData.append('gambar', {
        uri: image.uri,
        type: image.type,
        name: image.fileName,
      });

      const response = await Api.post('/communities', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });

      Alert.alert('Sukses', 'Komunitas berhasil dibuat');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating community:', error);
      Alert.alert('Error', error.response?.data?.message || 'Gagal membuat komunitas');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    console.log('Getting image URL for path:', imagePath);
    if (!imagePath) {
      console.log('No image path provided');
      return null;
    }
    if (imagePath.startsWith('http')) {
      console.log('Path is already a URL:', imagePath);
      return imagePath;
    }
    // Remove leading slash if present
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    // Don't add storage/ if it's already in the path
    const storagePath = cleanPath.startsWith('storage/') ? cleanPath : `storage/${cleanPath}`;
    const fullUrl = API_CONFIG.getStorageUrl(storagePath);
    console.log('Generated full URL:', fullUrl);
    return fullUrl;
  };

  const renderUserItem = ({ item }) => {
    console.log('Rendering user item:', {
      userId: item.user_id,
      name: item.name,
      photo: item.photo,
      photoUrl: item.photo ? getImageUrl(item.photo) : null
    });
    
    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => {
          if (showOwnerModal) {
            setSelectedOwner(item);
            setShowOwnerModal(false);
          } else {
            const isSelected = selectedMembers.some(member => member.user_id === item.user_id);
            if (isSelected) {
              setSelectedMembers(selectedMembers.filter(member => member.user_id !== item.user_id));
            } else {
              setSelectedMembers([...selectedMembers, item]);
            }
          }
        }}
      >
        <Image
          source={
            item.photo
              ? { 
                  uri: getImageUrl(item.photo),
                  cache: 'reload'  // Add cache reload to force image refresh
                }
              : require('../assets/default-avatar.jpg')
          }
          style={styles.userAvatar}
          onError={(error) => {
            console.log('Image loading error for user:', item.name);
            console.log('Photo path:', item.photo);
            console.log('Full URL:', item.photo ? getImageUrl(item.photo) : 'using default image');
            console.log('Error details:', error.nativeEvent);
          }}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
        {showMembersModal && selectedMembers.some(member => member.user_id === item.user_id) && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedBadgeText}>Dipilih</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create New Community</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Community Name"
        value={name}
        onChangeText={setName}
      />
      
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Capacity"
        value={capacity}
        onChangeText={setCapacity}
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={styles.ownerSelector}
        onPress={() => setShowOwnerModal(true)}
      >
        <Text style={styles.ownerSelectorText}>
          {selectedOwner ? `Owner: ${selectedOwner.name}` : 'Select Owner'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.membersSelector}
        onPress={() => setShowMembersModal(true)}
      >
        <Text style={styles.membersSelectorText}>
          {selectedMembers.length > 0
            ? `Selected Members: ${selectedMembers.length}`
            : 'Select Members'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.locationButton}
        onPress={() => setShowMap(true)}
      >
        <Text style={styles.locationButtonText}>
          {latLng.latitude ? 'Change Location' : 'Select Location'}
        </Text>
      </TouchableOpacity>

      <Modal visible={showMap} animationType="slide">
        <View style={{ flex: 1 }}>
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: latLng.latitude || -6.175392,
              longitude: latLng.longitude || 106.827153,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            onPress={handleMapPress}
          >
            {latLng.latitude && latLng.longitude && (
              <Marker coordinate={latLng} />
            )}
          </MapView>
          <TouchableOpacity style={styles.closeMapBtn} onPress={() => setShowMap(false)}>
            <Text style={styles.closeMapText}>Tutup Peta</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal visible={showOwnerModal || showMembersModal} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {showOwnerModal ? 'Pilih Owner' : 'Pilih Member'}
            </Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                setShowOwnerModal(false);
                setShowMembersModal(false);
              }}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          {users.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Tidak ada data pengguna</Text>
            </View>
          ) : (
            <FlatList
              data={users}
              renderItem={renderUserItem}
              keyExtractor={item => item.user_id}
              style={styles.userList}
              contentContainerStyle={styles.userListContent}
            />
          )}
        </View>
      </Modal>

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Text style={styles.imagePickerText}>{image ? 'Ganti Gambar' : 'Pilih Gambar Komunitas'}</Text>
      </TouchableOpacity>
      
      {image && (
        <Image source={{ uri: image.uri }} style={styles.previewImage} />
      )}

      <View style={styles.checkboxRow}>
        <CheckBox
          value={createChatGroup}
          onValueChange={setCreateChatGroup}
        />
        <Text style={styles.checkboxLabel}>Buat grup chat untuk komunitas ini</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Buat Komunitas</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  ownerSelector: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  ownerSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  membersSelector: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  membersSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  locationButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  locationButtonText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  imagePicker: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  imagePickerText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeMapBtn: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
  },
  closeMapText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#f8f8f8',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  userList: {
    flex: 1,
  },
  userListContent: {
    paddingBottom: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  selectedBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  selectedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default CreateCommunity; 