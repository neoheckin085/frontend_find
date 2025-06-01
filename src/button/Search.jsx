import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import Api from '../../libs/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_CONFIG from '../../src/config/apiConfig';

const screenWidth = Dimensions.get('window').width;
const imageSize = screenWidth / 3;

const ExploreScreen = () => {
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [history, setHistory] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // Function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const storagePath = imagePath.startsWith('storage/') ? imagePath : `storage/${imagePath}`;
    return API_CONFIG.getStorageUrl(storagePath);
  };

  // Fetch communities from backend
  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }

      const response = await Api.get('/communities', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setCommunities(response.data);
      }
    } catch (error) {
      console.error('Error fetching communities:', error);
      Alert.alert('Error', 'Failed to load communities');
    } finally {
      setLoading(false);
    }
  };

  const filteredCommunities = communities.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleRemoveHistory = (id) => {
    setHistory(prev => prev.filter(item => item.community_id !== id));
  };

  const handleSelectCommunity = (community) => {
    // Tambahkan ke history jika belum ada
    setHistory((prev) => {
      const exists = prev.find((item) => item.community_id === community.community_id);
      if (exists) return prev;
      return [community, ...prev];
    });

    // Navigate ke halaman Join
    navigation.navigate('Join', { community });
  };

  const handleBack = () => {
    setIsSearching(false);
    setSearch('');
  };

  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleSelectCommunity(item)} style={styles.historyItem}>
      <View style={styles.userInfo}>
        <Image 
          source={item.gambar ? { uri: getImageUrl(item.gambar) } : require('../assets/default-avatar.jpg')} 
          style={{ width: 40, height: 40, borderRadius: 20 }} 
        />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.username}>{item.name}</Text>
          <Text style={styles.name}>{item.description}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleRemoveHistory(item.community_id)}>
        <Ionicons name="close" size={22} color="#888" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderGridItem = ({ item }) => (
    <TouchableOpacity
      style={styles.imageWrapper}
      onPress={() => handleSelectCommunity(item)}
    >
      <Image 
        source={item.gambar ? { uri: getImageUrl(item.gambar) } : require('../assets/default-avatar.jpg')} 
        style={styles.image} 
        resizeMode="cover" 
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        {isSearching ? (
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={22} color="#333" style={styles.searchIcon} />
          </TouchableOpacity>
        ) : (
          <Ionicons name="arrow-back"
          size={24}
          color="#333"
          style={styles.icon}
          onPress={() => navigation.goBack()} />
        )}
        
        <TextInput
          placeholder="Find a community...."
          placeholderTextColor="#888"
          style={styles.searchInput}
          value={search}
          onFocus={() => setIsSearching(true)} 
          onChangeText={(text) => {
            setSearch(text);
            setIsSearching(true); 
          }}
        />
      </View>

      {/* History atau Hasil Pencarian */}
      {isSearching ? (
        <View style={styles.historyContainer}>
          <FlatList
            data={search.trim() === '' ? history : filteredCommunities}
            keyExtractor={(item) => item.community_id}
            renderItem={renderHistoryItem}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={() => (
              <Text style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>
                Not found.
              </Text>
            )}
          />
        </View>
      ) : (
        <FlatList
          data={communities}
          renderItem={renderGridItem}
          keyExtractor={(item) => item.community_id}
          numColumns={3}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginHorizontal: 10,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    marginTop: 12,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  imageWrapper: {
    width: imageSize,
    height: imageSize,
    borderWidth: 0.5,
    borderColor: '#eee',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  historyContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  name: {
    color: '#555',
    fontSize: 13,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
  },
});

export default ExploreScreen;
