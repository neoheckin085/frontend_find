import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Api from '../../libs/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_CONFIG from '../../src/config/apiConfig';

const KomunitasScreen = ({ navigation }) => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // If it's already a full URL, return it
    if (imagePath.startsWith('http')) return imagePath;
    // Add storage/ prefix if not present
    const storagePath = imagePath.startsWith('storage/') ? imagePath : `storage/${imagePath}`;
    return API_CONFIG.getStorageUrl(storagePath);
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }

      // Get user data first to get user_id
      const userResponse = await Api.get('/user', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!userResponse.data || !userResponse.data.user_id) {
        console.error('Invalid user data:', userResponse.data);
        Alert.alert('Error', 'Gagal mendapatkan data user');
        setLoading(false);
        return;
      }

      const userId = userResponse.data.user_id;

      // Get all communities
      const communitiesResponse = await Api.get('/communities', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!communitiesResponse.data || !Array.isArray(communitiesResponse.data)) {
        console.error('Invalid communities data:', communitiesResponse.data);
        Alert.alert('Error', 'Format data komunitas tidak valid');
        setLoading(false);
        return;
      }

      // Log communities data for debugging
      console.log('All communities data:', communitiesResponse.data);
      communitiesResponse.data.forEach(community => {
        console.log('Community image details:', {
          name: community.name,
          gambar: community.gambar,
          gambar_url: getImageUrl(community.gambar)
        });
      });

      // Filter communities where user is the owner
      const ownedCommunities = communitiesResponse.data.filter(community => {
        const communityOwnerId = String(community.owner_id).trim();
        const currentUserId = String(userId).trim();
        return communityOwnerId === currentUserId;
      });

      console.log('Owned communities:', ownedCommunities);
      setCommunities(ownedCommunities);
    } catch (error) {
      console.error('Error in fetchCommunities:', error);
      Alert.alert('Error', 'Gagal mengambil daftar komunitas: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleCommunityPress = (community) => {
    navigation.navigate('Post', { community });
  };

  const handleMakeNewCommunity = () => {
    navigation.navigate('CommunityInterestScreen');
  };

  const renderCommunityItem = (community) => (
    <TouchableOpacity
      key={community.community_id}
      style={styles.communityItem}
      onPress={() => handleCommunityPress(community)}
      activeOpacity={0.7}
    >
      <Image 
        source={
          community.gambar
            ? { 
                uri: getImageUrl(community.gambar),
                cache: 'reload'
              }
            : require('../assets/Find.png')
        }
        style={styles.avatar}
        onError={(error) => {
          console.log('Image loading error for community:', community.name);
          console.log('Image path:', community.gambar);
          console.log('Full URL:', community.gambar ? getImageUrl(community.gambar) : 'using default image');
          console.log('Error details:', error.nativeEvent);
        }}
      />
      <Text style={styles.communityName}>{community.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#212121" />
          </View>
        ) : (
          <>
            <View style={styles.communitiesList}>
              {communities.map(renderCommunityItem)}
            </View>

            <TouchableOpacity
              style={styles.makeNewCommunityButton}
              onPress={handleMakeNewCommunity}
              activeOpacity={0.7}
            >
              <View style={styles.plusIcon}>
                <Text style={styles.plusText}>+</Text>
              </View>
              <Text style={styles.makeNewCommunityText}>Make new community</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backIcon: {
    fontSize: 20,
    color: '#333333',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginTop: 8,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  communitiesList: {
    paddingTop: 16,
  },
  communityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
    backgroundColor: '#f0f0f0',
  },
  communityName: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  makeNewCommunityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 24,
    backgroundColor: '#ffffff',
  },
  plusIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  plusText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  makeNewCommunityText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
});

export default KomunitasScreen;
