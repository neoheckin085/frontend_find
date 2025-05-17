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
    } catch (error) {
      console.error('Error fetching community details:', error);
      Alert.alert('Error', 'Failed to load community details');
    }
  };

  const checkMembershipStatus = async () => {
    try {
      const response = await Api.get(`/communities/${initialCommunity.community_id}`);
      // Check if current user's ID is in the anggota array
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
      const endpoint = `/communities/${community.community_id}`;
      const currentAnggota = community.anggota || [];
      const userToken = await AsyncStorage.getItem('token');
      const userResponse = await Api.get('/user', {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      const userId = userResponse.data.user_id;

      let updatedAnggota;
      if (isFollowing) {
        // Remove user from anggota
        updatedAnggota = currentAnggota.filter(id => id !== userId);
      } else {
        // Add user to anggota
        if (currentAnggota.length >= community.capacity) {
          Alert.alert('Error', 'Community has reached maximum capacity');
          setLoading(false);
          return;
        }
        updatedAnggota = [...currentAnggota, userId];
      }

      await Api.put(endpoint, {
        ...community,
        anggota: updatedAnggota
      });

      setIsFollowing(!isFollowing);
      fetchCommunityDetails(); // Refresh community data
    } catch (error) {
      console.error('Error updating membership:', error);
      Alert.alert('Error', 'Failed to update membership');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.mapContainer}>
            <GoogleMapsScreen 
              initialLatitude={community.latitude}
              initialLongitude={community.longitude}
            />
          </View>
          <Image 
            source={
              community.gambar
                ? { 
                    uri: getImageUrl(community.gambar),
                    cache: 'reload'
                  }
                : require('../assets/default-avatar.jpg')
            } 
            style={styles.communityLogo}
            resizeMode="cover"
            onError={(error) => {
              console.log('Image loading error for community:', community.name);
              console.log('Image path:', community.gambar);
              console.log('Full URL:', community.gambar ? getImageUrl(community.gambar) : 'using default image');
              console.log('Error details:', error.nativeEvent);
            }}
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

          {/* Menampilkan gambar komunitas jika ada */}
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
              {loading ? 'Memproses...' : isFollowing ? 'Mengikuti' : 'Ikuti'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
});

export default Join;
