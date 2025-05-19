import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Api from '../../libs/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';

// Mock data untuk komunitas
const communitiesData = [
  {
    id: 1,
    name: 'christyzer.cdm',
    avatar: 'https://via.placeholder.com/50x50/4A90E2/FFFFFF?text=C',
  },
  {
    id: 2,
    name: 'psmfans1915',
    avatar: 'https://via.placeholder.com/50x50/333333/FFFFFF?text=P',
  },
  {
    id: 3,
    name: 'ikasikotamakassar',
    avatar: 'https://via.placeholder.com/50x50/FF5722/FFFFFF?text=I',
  },
];

const KomunitasScreen = () => {
  const handleBackPress = () => {
    // Handle back navigation
    console.log('Back pressed');
  };

  const handleCommunityPress = (community) => {
    // Handle community selection
    console.log('Community pressed:', community.name);
  };

  const handleMakeNewCommunity = () => {
    // Handle make new community
    console.log('Make new community pressed');
  };

  const renderCommunityItem = (community) => (
    <TouchableOpacity
      key={community.id}
      style={styles.communityItem}
      onPress={() => handleCommunityPress(community)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: community.avatar }} style={styles.avatar} />
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
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Komunitas</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.communitiesList}>
          {communitiesData.map(renderCommunityItem)}
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
