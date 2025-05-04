import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;
const imageSize = screenWidth / 3;

// Dummy komunitas untuk simulasi
const dummyCommunities = [
  {
    id: '1',
    name: 'TL Cavalary',
    members: 123,
    description: 'Komunitas pecinta tim Liquid dari seluruh dunia.',
    logo: require('../assets/logoliquid.jpg'),
    images: [require('../assets/logoliquid.jpg'), require('../assets/logoliquid.jpg')],
  },
  {
    id: '2',
    name: 'IkasiMakassar',
    members: 8000,
    description: 'Komunitas pecinta olahraga di Makassar',
    logo: require('../assets/IkasiMakassar.png'),
    images: [require('../assets/IkasiMakassar.png')],
  },
  {
    id: '3',
    name: 'Psm Fans',
    members: 8000,
    description: 'Komunitas supporter PSM Makassar',
    logo: require('../assets/PsmFans.png'),
    images: [require('../assets/PsmFans.png')],
  },
];

const ExploreScreen = () => {
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [history, setHistory] = useState([]);
  const navigation = useNavigation();

  const filteredCommunities = dummyCommunities.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleRemoveHistory = (id) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleSelectCommunity = (community) => {
    // Tambahkan ke history jika belum ada
    setHistory((prev) => {
      const exists = prev.find((item) => item.id === community.id);
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
        <Image source={item.logo} style={{ width: 40, height: 40, borderRadius: 20 }} />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.username}>{item.name}</Text>
          <Text style={styles.name}>{item.description}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleRemoveHistory(item.id)}>
        <Ionicons name="close" size={22} color="#888" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderGridItem = ({ item }) => (
    <TouchableOpacity
      style={styles.imageWrapper}
      onPress={() => handleSelectCommunity(item)}
    >
      <Image source={item.logo} style={styles.image} resizeMode="cover" />
    </TouchableOpacity>
  );
  

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        {isSearching ? (
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={22} color="#333" style={styles.searchIcon} />
          </TouchableOpacity>
        ) : (
          <Ionicons name="search-outline" size={22} color="#888" style={styles.searchIcon} />
        )}

        <TextInput
          placeholder="Cari komunitas"
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
            keyExtractor={(item) => item.id}
            renderItem={renderHistoryItem}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={() => (
              <Text style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>
                Tidak ditemukan.
              </Text>
            )}
          />
        </View>
      ) : (
        <FlatList
          data={dummyCommunities}
          renderItem={renderGridItem}
          keyExtractor={(item) => item.id}
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
