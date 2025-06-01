import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import GoogleMapsScreen from '../button/Maps';
import Api from '../../libs/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_CONFIG from '../../src/config/apiConfig';

const Join = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { community: initialCommunity } = route.params;
  const [community, setCommunity] = useState(initialCommunity);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [joinRequests, setJoinRequests] = useState([]);
  const [showRequestsModal, setShowRequestsModal] = useState(false);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // If it's already a full URL, return it
    if (imagePath.startsWith('http')) return imagePath;
    // Add storage/ prefix if not present
    const storagePath = imagePath.startsWith('storage/') ? imagePath : `storage/${imagePath}`;
    return API_CONFIG.getStorageUrl(storagePath);
  };

  useEffect(() => {
    fetchCommunityDetails();
    checkMembershipStatus();
  }, []);

  const fetchCommunityDetails = async () => {
    try {
      const response = await Api.get(`/communities/${initialCommunity.community_id}`);
      console.log('Community details:', response.data);
      console.log('Community image path:', response.data.gambar);
      console.log('Full image URL:', getImageUrl(response.data.gambar));
      setCommunity(response.data);
      
      // Check if current user is the owner
      const userToken = await AsyncStorage.getItem('token');
      const userResponse = await Api.get('/user', {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      setIsOwner(response.data.owner_id === userResponse.data.user_id);
    } catch (error) {
      console.error('Error fetching community details:', error);
      Alert.alert('Error', 'Failed to load community details');
    }
  };

  const checkMembershipStatus = async () => {
    try {
      const response = await Api.get(`/communities/${initialCommunity.community_id}`);
      const userToken = await AsyncStorage.getItem('token');
      const userResponse = await Api.get('/user', {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      const userId = userResponse.data.user_id;
      setIsFollowing(response.data.anggota?.includes(userId) || false);
    } catch (error) {
      console.error('Error checking membership status:', error);
    }
  };

  const handleFollow = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const userToken = await AsyncStorage.getItem('token');
      const userResponse = await Api.get('/user', {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      const userId = userResponse.data.user_id;

      if (isFollowing) {
        // Leave community
        const currentAnggota = community.anggota || [];
        const updatedAnggota = currentAnggota.filter(id => id !== userId);

        await Api.put(`/communities/${community.community_id}`, {
          ...community,
          anggota: updatedAnggota
        });

        setIsFollowing(false);
      } else {
        // Send join request
        await Api.post(`/communities/${community.community_id}/join-request`);
        Alert.alert('Success', 'Join request sent successfully');
      }

      fetchCommunityDetails();
    } catch (error) {
      console.error('Error updating membership:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update membership');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinResponse = async (userId, action) => {
    try {
      await Api.post(`/communities/${community.community_id}/join-response/${userId}`, {
        action: action
      });
      
      Alert.alert('Success', `Join request ${action}ed successfully`);
      setShowRequestsModal(false);
      fetchCommunityDetails();
    } catch (error) {
      console.error('Error handling join response:', error);
      Alert.alert('Error', 'Failed to process join request');
    }
  };

  const renderJoinRequestsModal = () => (
    <Modal
      visible={showRequestsModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowRequestsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Join Requests</Text>
            <TouchableOpacity onPress={() => setShowRequestsModal(false)}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={joinRequests}
            keyExtractor={(item) => item.user_id}
            renderItem={({ item }) => (
              <View style={styles.requestItem}>
                <Image
                  source={item.profile_image ? { uri: getImageUrl(item.profile_image) } : require('../assets/default-avatar.jpg')}
                  style={styles.requestAvatar}
                />
                <View style={styles.requestInfo}>
                  <Text style={styles.requestName}>{item.name}</Text>
                  <Text style={styles.requestUsername}>@{item.username}</Text>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={[styles.requestButton, styles.acceptButton]}
                    onPress={() => handleJoinResponse(item.user_id, 'accept')}
                  >
                    <Text style={styles.buttonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.requestButton, styles.rejectButton]}
                    onPress={() => handleJoinResponse(item.user_id, 'reject')}
                  >
                    <Text style={styles.buttonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.noRequestsText}>No pending join requests</Text>
            }
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.mapContainer}>
            <GoogleMapsScreen
              latitude={community.latitude}
              longitude={community.longitude}
              name={community.name}
            />
          </View>
          <Image
            source={
              community.gambar
                ? { uri: getImageUrl(community.gambar) }
                : require('../assets/Find.png')
            }
            style={styles.communityLogo}
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.title}>{community.name}</Text>
          <Text style={styles.subtitle}>
            Oleh: {community.owner ? community.owner.name : 'Unknown'}
          </Text>
          <Text style={styles.memberCount}>{community.anggota?.length || 0} Anggota</Text>

          <Text style={styles.sectionTitle}>Deskripsi Komunitas:</Text>
          <Text style={styles.description}>{community.description}</Text>

          {community.gambar && (
            <>
              <Text style={styles.sectionTitle}>Gambar Komunitas:</Text>
              <View style={styles.imageContainer}>
                <Image 
                  source={{ 
                    uri: getImageUrl(community.gambar),
                    cache: 'reload'
                  }}
                  style={styles.communityImage}
                  resizeMode="cover"
                  onError={(error) => {
                    console.log('Community image loading error:', error.nativeEvent);
                  }}
                />
              </View>
            </>
          )}

          {isOwner ? (
            <TouchableOpacity
              style={styles.manageButton}
              onPress={() => setShowRequestsModal(true)}
            >
              <Text style={styles.manageButtonText}>Manage Join Requests</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.followButton,
                {
                  borderColor: isFollowing ? '#000' : '#fff',
                  backgroundColor: isFollowing ? '#fff' : '#000',
                },
              ]}
              onPress={handleFollow}
              disabled={loading}
            >
              <Text style={[styles.followText, { color: isFollowing ? '#000' : '#fff' }]}>
                {loading ? 'Memproses...' : isFollowing ? 'Leave Community' : 'Request to Join'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {renderJoinRequestsModal()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mapContainer: {
    width: '100%',
    height: 200,
  },
  communityLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: -50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  infoContainer: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 14,
    color: 'gray',
  },
  memberCount: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginVertical: 5,
    fontSize: 19,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
  },
  description: {
    fontSize: 16,
    marginTop: 5,
  },
  imageContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  communityImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  followButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderRadius: 5,
    alignItems: 'center',
  },
  followText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  requestAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  requestInfo: {
    flex: 1,
    marginLeft: 10,
  },
  requestName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  requestUsername: {
    fontSize: 14,
    color: '#666',
  },
  requestActions: {
    flexDirection: 'row',
  },
  requestButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noRequestsText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  manageButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#2196F3',
    borderRadius: 5,
    alignItems: 'center',
  },
  manageButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Join;
