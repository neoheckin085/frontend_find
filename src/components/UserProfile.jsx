import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import API_CONFIG from '../config/apiConfig';
import Icon from 'react-native-vector-icons/FontAwesome';
import Logokecil from '../assets/default-avatar.jpg';

const UserProfile = ({ route, navigation }) => {
  const { userId } = route.params;
  const { getUserById } = useAuth();
  const { createChatGroup } = useChat();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        await getUserById(setUserData, setError, setLoading, userId);
      } catch (err) {
        setError('Failed to load user profile');
        setLoading(false);
      }
    };
    fetchUserData();
  }, [userId]);

  const handleSendMessage = async () => {
    try {
      // Create or get existing private chat with this user
      const chatGroup = await createChatGroup(
        `${userData.name}'s Chat`, // Name for the chat
        [userId], // Array of user IDs to add to the chat
        true // Explicitly mark as private chat
      );

      if (chatGroup) {
        // Navigate to the chat screen
        navigation.navigate('Messages', { chatGroup });
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to start chat. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (error || !userData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'User not found'}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Background Image */}
      <Image
        source={
          userData.background 
            ? { uri: API_CONFIG.getStorageUrl(userData.background) }
            : userData.photo
              ? { uri: API_CONFIG.getStorageUrl(userData.photo) }
              : Logokecil
        }
        style={styles.backgroundImage}
        blurRadius={userData.background && userData.background !== userData.photo ? 0 : 5}
      />

      <View style={styles.content}>
        {/* Profile Picture */}
        <Image
          source={
            userData.photo 
              ? { uri: API_CONFIG.getStorageUrl(userData.photo) }
              : Logokecil
          }
          style={styles.profileImage}
        />

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.name}>{userData.name}</Text>
          <Text style={styles.bio}>{userData.tentang || 'No bio available'}</Text>

          {/* Contact Info */}
          <View style={styles.contactInfo}>
            {userData.nomor_telepon && (
              <View style={styles.contactItem}>
                <Icon name="whatsapp" size={20} color="#075E54" />
                <Text style={styles.contactText}>{userData.nomor_telepon}</Text>
              </View>
            )}
            
            {userData.lokasi && (
              <View style={styles.contactItem}>
                <Icon name="map-marker" size={20} color="#FF3B30" />
                <Text style={styles.contactText}>{userData.lokasi}</Text>
              </View>
            )}
            
            {userData.email && (
              <View style={styles.contactItem}>
                <Icon name="envelope" size={20} color="#007AFF" />
                <Text style={styles.contactText}>{userData.email}</Text>
              </View>
            )}
          </View>

          {/* Send Message Button */}
          <TouchableOpacity 
            style={styles.messageButton}
            onPress={handleSendMessage}
          >
            <Icon name="send" size={20} color="#FFFFFF" style={styles.messageIcon} />
            <Text style={styles.messageButtonText}>Send Message</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  backgroundImage: {
    width: '100%',
    height: 200,
  },
  content: {
    flex: 1,
    padding: 15,
    marginTop: -50,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
    alignSelf: 'center',
  },
  userInfo: {
    alignItems: 'center',
    marginTop: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  bio: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  contactInfo: {
    width: '100%',
    marginTop: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  contactText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  messageButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageIcon: {
    marginRight: 8,
  },
  messageButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserProfile; 