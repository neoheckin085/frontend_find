import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import Api from '../../libs/Api';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js/react-native';
import PUSHER_CONFIG from '../config/pusherConfig';
import API_CONFIG from '../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationScreen = () => {
  const navigation = useNavigation();
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [echo, setEcho] = useState(null);

  useEffect(() => {
    if (token && user) {
      initializeEcho();
      fetchNotifications();
    }
    return () => {
      if (echo) {
        echo.disconnect();
      }
    };
  }, [token, user]);

  const initializeEcho = () => {
    // Initialize Pusher client
    const pusherClient = new Pusher(PUSHER_CONFIG.APP_KEY, {
      cluster: PUSHER_CONFIG.APP_CLUSTER,
      forceTLS: true,
      authEndpoint: `${API_CONFIG.API_URL}${PUSHER_CONFIG.AUTH_ENDPOINT}`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    });

    // Initialize Laravel Echo with the Pusher client
    const echoInstance = new Echo({
      broadcaster: 'pusher',
      key: PUSHER_CONFIG.APP_KEY,
      cluster: PUSHER_CONFIG.APP_CLUSTER,
      forceTLS: true,
      client: pusherClient, // Pass the Pusher client instance
      authEndpoint: `${API_CONFIG.API_URL}${PUSHER_CONFIG.AUTH_ENDPOINT}`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    });

    // Subscribe to private channel
    echoInstance.private(`user.${user.user_id}`)
      .listen('NewNotification', (e) => {
        console.log('Received notification:', e);
        setNotifications(prev => [e.notification, ...prev]);
      });

    setEcho(echoInstance);
  };

  const fetchNotifications = async () => {
    try {
      // Debug token
      console.log('Fetching notifications with token:', token ? 'Token exists' : 'No token');
      
      // Debug request headers
      const token = await AsyncStorage.getItem('token');
      console.log('Token from AsyncStorage:', token ? 'Token exists' : 'No token');
      
      const response = await Api.get('/notifications');
      console.log('Notifications response:', response.status, response.data);
      
      // Handle both paginated and non-paginated responses
      const notificationsData = response.data.data || response.data;
      if (Array.isArray(notificationsData)) {
        setNotifications(notificationsData);
      } else {
        console.error('Invalid notifications data structure:', notificationsData);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        message: error.message
      });
      // Show error message to user
      Alert.alert(
        'Error',
        'Failed to load notifications. Please try again later.',
        [{ text: 'OK' }]
      );
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await Api.post(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(notif =>
          notif.notification_id === notificationId
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationPress = (notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.notification_id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'like_post':
        navigation.navigate('Post', { postId: notification.reference_id });
        break;
      case 'join_request':
      case 'request_rejected':
        navigation.navigate('KomunitasScreen', { communityId: notification.reference_id });
        break;
      default:
        break;
    }
  };

  const getNotificationImage = (notification) => {
    if (notification.sender?.profile_image) {
      return { uri: API_CONFIG.getStorageUrl(notification.sender.profile_image) };
    }
    // Return default image if no sender image
    return require('../assets/default-avatar.jpg');
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationContainer,
        !item.is_read && styles.unreadNotification
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <Image source={getNotificationImage(item)} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.message}</Text>
        <Text style={styles.time}>
          {new Date(item.created_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.notification_id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Tidak ada notifikasi</Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  notificationContainer: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  unreadNotification: {
    backgroundColor: '#f0f8ff',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  textContainer: {
    marginLeft: 10,
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: '#333',
  },
  time: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default NotificationScreen;
