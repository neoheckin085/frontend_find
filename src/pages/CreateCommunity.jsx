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
import { launchImageLibrary } from 'react-native-image-picker';
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
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await Api.get('/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        Alert.alert('Error', 'Format data tidak valid');
      }
    } catch (error) {
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
    const missingFields = [];
    if (!name) missingFields.push('Nama Komunitas');
    if (!description) missingFields.push('Deskripsi');
    if (!capacity) missingFields.push('Kapasitas');
    if (!latLng.latitude || !latLng.longitude) missingFields.push('Lokasi');
    if (!image) missingFields.push('Gambar');

    if (missingFields.length > 0) {
      Alert.alert('Data Belum Lengkap', `Mohon lengkapi data berikut:\n${missingFields.join('\n')}`);
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
      formData.append('create_chat_group', createChatGroup ? 'true' : 'false');
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
      if (navigation.getParam('onCommunityCreated')) {
        navigation.getParam('onCommunityCreated')();
      }
      navigation.navigate('KomunitasScreen');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Gagal membuat komunitas');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    const storagePath = cleanPath.startsWith('storage/') ? cleanPath : `storage/${cleanPath}`;
    return API_CONFIG.getStorageUrl(storagePath);
  };

  const renderUserItem = ({ item }) => {
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
          source={item.photo ? { uri: getImageUrl(item.photo) } : require('../assets/default-avatar.jpg')}
          style={styles.userAvatar}
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
        style={[
          styles.selectButton,
          latLng.latitude && styles.selectButtonWithLocation
        ]} 
        onPress={() => setShowMap(true)}
      >
        <Text style={[
          styles.selectButtonText,
          latLng.latitude && styles.selectButtonTextWithLocation
        ]}>
          {latLng.latitude ? `Lokasi: ${latLng.latitude.toFixed(6)}, ${latLng.longitude.toFixed(6)}` : 'Select Location'}
        </Text>
        {latLng.latitude && (
          <Text style={styles.locationSubText}>Tap to change location</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
        <Text style={styles.imagePickerText}>{image ? 'Change Image' : 'Select Community Image'}</Text>
      </TouchableOpacity>

      {image && (
        <Image source={{ uri: image.uri }} style={styles.imagePreview} />
      )}

      <View style={styles.checkboxRow}>
        <CheckBox value={createChatGroup} onValueChange={setCreateChatGroup} />
        <Text style={styles.checkboxLabel}>Create a chat group for this community</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Community</Text>}
        </TouchableOpacity>
      </View>

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
            {latLng.latitude && latLng.longitude && <Marker coordinate={latLng} />}
          </MapView>
          <TouchableOpacity style={styles.closeMapBtn} onPress={() => setShowMap(false)}>
            <Text style={styles.closeMapText}>Close Map</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal visible={showOwnerModal || showMembersModal} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{showOwnerModal ? 'Select Owner' : 'Select Member'}</Text>
            <TouchableOpacity onPress={() => { setShowOwnerModal(false); setShowMembersModal(false); }}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={users}
            renderItem={renderUserItem}
            keyExtractor={item => item.user_id}
            contentContainerStyle={styles.userListContent}
          />
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    padding: 24, 
    backgroundColor: '#F1F5F9' 
  },
  title: {
   fontSize: 28,
   fontWeight: '700', 
   marginBottom: 24, 
   color: '#0F172A', 
   textAlign: 'center' 
  },
  input: {
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    padding: 16, marginBottom: 16,
    fontSize: 16, 
    color: '#0F172A', 
    borderWidth: 1, 
    borderColor: '#E2E8F0'
  },
  textArea: {
    height: 140, 
    textAlignVertical: 'top', 
    lineHeight: 22, 
    paddingTop: 12 
  },
  selectButton: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 16,
    borderWidth: 1, 
    borderColor: '#E2E8F0'
  },
  selectButtonWithLocation: {
    paddingBottom: 12
  },
  selectButtonText: { 
    fontSize: 16, 
    color: '#0F172A', 
    fontWeight: '500'
  },
  selectButtonTextWithLocation: {
    marginBottom: 4
  },
  imagePickerButton: {
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 16,
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    alignItems: 'center'
  },
  imagePickerText: {
    fontSize: 16, 
    color: '#0F172A', 
    fontWeight: '500' 
  },
  imagePreview: {
    width: '100%', 
    height: 200, 
    borderRadius: 16, 
    backgroundColor: '#E2E8F0', 
    marginBottom: 16 },
  checkboxRow: {
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16,
    backgroundColor: '#FFFFFF', 
    borderRadius: 16,
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    marginBottom: 16
  },
  checkboxLabel: {
    marginLeft: 12, 
     fontSize: 15, 
     fontWeight: '500', 
     color: '#0F172A' 
    },
  buttonContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
  },
  buttonDisabled: {
    backgroundColor: '#CBD5E1' 
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16, 
    fontWeight: '600'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700', 
    color: '#0F172A' 
  },
  closeButtonText: {
    fontSize: 28, 
    color: '#0F172A' 
  },
  userItem: {
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16,
    borderRadius: 16, 
    backgroundColor: '#FFFFFF', 
    marginBottom: 12,
    borderWidth: 1, 
    borderColor: '#E2E8F0'
  },
  userAvatar: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    marginRight: 12 
  },
  userInfo: { 
    flex: 1 
  },
  userName: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#0F172A' 
  },
  userEmail: { 
    fontSize: 14, 
    color: '#64748B' 
  },
  selectedBadge: {
    backgroundColor: '#2563EB', 
    paddingHorizontal: 12,
    paddingVertical: 6, 
    borderRadius: 12
  },
  selectedBadgeText: { 
    color: '#FFFFFF', 
    fontSize: 12, 
    fontWeight: '600' 
  },
  closeMapBtn: {
    position: 'absolute', 
    bottom: 30, 
    alignSelf: 'center',
    backgroundColor: '#2563EB', 
    paddingHorizontal: 24,
    paddingVertical: 14, 
    borderRadius: 16
  },
  closeMapText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  userListContent: { 
    padding: 20 
  },
  locationSubText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '400'
  },
});

export default CreateCommunity;
