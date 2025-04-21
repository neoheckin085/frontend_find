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

const screenWidth = Dimensions.get('window').width;
const imageSize = screenWidth / 3;

const dummyData = Array(60).fill(require('../assets/logoliquid.jpg'));

// Dummy akun untuk simulasi hasil pencarian/history
const dummyAccounts = [
  { id: '1', username: 'esl_indonesia', name: 'ESL Indonesia' },
  { id: '2', username: 'eslmlbb', name: 'ESL Mobile Legends: Bang Bang' },
  { id: '3', username: 'mpl.id.official', name: 'MPL Indonesia', verified: true, followers: '7,2JT' },
  { id: '4', username: 'sobrut.el.braga', name: 'El Braga' },
  { id: '5', username: 'mpl.ph', name: 'MPL Philippines' },
  { id: '6', username: 'mdl.indonesia', name: 'MDL Indonesia' },
];

const ExploreScreen = () => {
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [history, setHistory] = useState(dummyAccounts);

  const renderGridItem = ({ item }) => (
    <TouchableOpacity style={styles.imageWrapper}>
      <Image source={item} style={styles.image} resizeMode="cover" />
    </TouchableOpacity>
  );

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <View style={styles.userInfo}>
        <Ionicons name="person-circle-outline" size={40} color="#000" />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.name}>{item.name}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleRemoveHistory(item.id)}>
        <Ionicons name="close" size={22} color="#888" />
      </TouchableOpacity>
    </View>
  );

  const handleRemoveHistory = (id) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleBack = () => {
    setIsSearching(false);
    setSearch('');
  };

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
          placeholder="Cari"
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

      {/* Tampilan hasil pencarian/history */}
      {isSearching ? (
        <View style={styles.historyContainer}>
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={renderHistoryItem}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      ) : (
        <FlatList
          data={dummyData}
          renderItem={renderGridItem}
          keyExtractor={(item, index) => index.toString()}
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
