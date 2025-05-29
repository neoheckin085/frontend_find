import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js/react-native';
import Api from '../libs/Api';
import { useAuth } from './AuthContext';
import API_CONFIG from '../src/config/apiConfig';
import PUSHER_CONFIG from '../src/config/pusherConfig';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [echo, setEcho] = useState(null);
  const [chatGroups, setChatGroups] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize Echo when user logs in
  useEffect(() => {
    if (token && user) {
      initializeEcho();
    }
    return () => {
      if (echo) {
        echo.disconnect();
      }
    };
  }, [token, user]);

  // Initialize Laravel Echo with Pusher
  const initializeEcho = async () => {
    try {
      // Configure Pusher for React Native
      Pusher.logToConsole = __DEV__;
      
      // Initialize Pusher instance first
      const pusherClient = new Pusher(PUSHER_CONFIG.APP_KEY, {
        cluster: PUSHER_CONFIG.APP_CLUSTER,
        authEndpoint: `${API_CONFIG.BASE_URL}${PUSHER_CONFIG.AUTH_ENDPOINT}`,
        auth: {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
        forceTLS: true,
        encrypted: true,
        enabledTransports: ['ws', 'wss'],
        disabledTransports: ['xhr_polling', 'xhr_streaming', 'sockjs'],
      });
      
      const newEcho = new Echo({
        broadcaster: 'pusher',
        client: pusherClient,
      });
      
      setEcho(newEcho);
      console.log('Echo initialized with Pusher in React Native');
      
      // Load chat groups after Echo initialization
      fetchChatGroups();
      
    } catch (error) {
      console.error('Failed to initialize Echo:', error);
      setError('Failed to connect to chat server');
    }
  };

  // Fetch user's chat groups
  const fetchChatGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching chat groups...');
      const response = await Api.get('/chat/groups');
      console.log('Chat groups response:', response.data);
      setChatGroups(response.data);
    } catch (error) {
      console.error('Failed to fetch chat groups:', error);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        setError(`Failed to load chat groups: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        setError('Failed to load chat groups: No response from server');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        setError(`Failed to load chat groups: ${error.message}`);
      }
      
      // For development: let's try the test endpoint
      try {
        console.log('Trying test endpoint...');
        const testResponse = await Api.get('/test/chat-groups');
        console.log('Test endpoint response:', testResponse.data);
      } catch (testError) {
        console.error('Test endpoint also failed:', testError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load messages for a specific chat group
  const loadMessages = async (groupId) => {
    setLoading(true);
    try {
      const response = await Api.get(`/chat/groups/${groupId}/messages`);
      setMessages(response.data.data.reverse()); // Reverse to show newest at the bottom
      setActiveChat(groupId);
      
      // Subscribe to the presence channel for this chat group
      subscribeToChat(groupId);
      
    } catch (error) {
      console.error('Failed to load messages:', error);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Send a message to the active chat
  const sendMessage = async (message) => {
    if (!activeChat) return;
    
    try {
      const response = await Api.post(`/chat/groups/${activeChat}/messages`, {
        message
      });
      
      // Add message immediately for better UX
      setMessages(prev => {
        // Check if message already exists
        if (prev.some(msg => msg.message_id === response.data.message_id)) {
          return prev;
        }
        return [...prev, response.data];
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message');
      return null;
    }
  };

  // Subscribe to a chat group's presence channel
  const subscribeToChat = (groupId) => {
    if (!echo) {
      console.error('Echo not initialized');
      return;
    }
    
    try {
      // Join the presence channel
      const channel = echo.join(`chat.group.${groupId}`);
      
      // Listen for new messages
      channel.listen('.App\\Events\\NewMessage', (e) => {
        console.log('New message received:', e);
        setMessages(prev => {
          // Check if message already exists
          if (prev.some(msg => msg.message_id === e.message.message_id)) {
            return prev;
          }
          return [...prev, e.message];
        });
      });
      
      // Handle user joining
      channel.here((users) => {
        console.log('Users in the chat:', users);
      });
      
      // Handle user joining after you
      channel.joining((user) => {
        console.log('User joined:', user);
      });
      
      // Handle user leaving
      channel.leaving((user) => {
        console.log('User left:', user);
      });
      
      return channel;
    } catch (error) {
      console.error('Failed to subscribe to chat:', error);
      setError('Failed to connect to chat channel');
      return null;
    }
  };

  // Create a new chat group
  const createChatGroup = async (name, userIds) => {
    try {
      const response = await Api.post('/chat/groups', {
        name,
        capacity: userIds.length + 1, // +1 for the current user
        is_private: userIds.length === 1, // If only one other user, it's a private chat
        user_ids: userIds
      });
      
      // Refresh chat groups
      fetchChatGroups();
      
      return response.data;
    } catch (error) {
      console.error('Failed to create chat group:', error);
      setError('Failed to create chat group');
      return null;
    }
  };

  return (
    <ChatContext.Provider value={{
      chatGroups,
      messages,
      activeChat,
      loading,
      error,
      fetchChatGroups,
      loadMessages,
      sendMessage,
      createChatGroup,
      setActiveChat
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext); 