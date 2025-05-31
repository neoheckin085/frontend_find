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
      
      // Filter out private chats that have no messages
      const filteredGroups = response.data.filter(group => {
        if (!group.is_private) return true; // Always show group chats
        if (group.messages && group.messages.length > 0) return true; // Show private chats with messages
        return false; // Hide private chats without messages
      });
      
      setChatGroups(filteredGroups);
    } catch (error) {
      console.error('Failed to fetch chat groups:', error);
      
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        setError(`Failed to load chat groups: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        setError('Failed to load chat groups: No response from server');
      } else {
        console.error('Error message:', error.message);
        setError(`Failed to load chat groups: ${error.message}`);
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
      setMessages([...response.data.data].reverse()); // Reverse agar urut lama ke baru
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

      // If this is a private chat and it's not in the chat list yet, add it
      const chatGroup = chatGroups.find(g => g.chat_group_id === activeChat);
      if (!chatGroup && response.data.chat_group?.is_private) {
        // Fetch the chat group details and add to list
        const groupResponse = await Api.get(`/chat/groups/${activeChat}`);
        const newGroup = groupResponse.data;
        // Add the message to the group data
        newGroup.messages = [response.data];
        setChatGroups(prev => [...prev, newGroup]);
      }
      
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

  // Create a new chat group or get existing private chat
  const createChatGroup = async (name, userIds, isPrivate = false) => {
    try {
      // If this is a private chat, check if it already exists
      if (isPrivate && userIds.length === 1) {
        // Get all chat groups
        const groupsResponse = await Api.get('/chat/groups');
        const existingGroups = groupsResponse.data;
        
        // Look for an existing private chat with this user
        const existingPrivateChat = existingGroups.find(group => 
          group.is_private && 
          group.users.some(u => u.user_id === userIds[0]) &&
          group.users.length === 2 && // Must be exactly 2 users (current user + target user)
          group.messages && group.messages.length > 0 // Must have messages
        );

        if (existingPrivateChat) {
          console.log('Found existing private chat:', existingPrivateChat);
          return existingPrivateChat;
        }

        // For new private chats, create but don't add to chat list yet
        const privateChatResponse = await Api.post('/chat/groups', {
          name,
          capacity: 2, // Always 2 for private chats
          is_private: true,
          user_ids: userIds
        });

        // Don't refresh chat groups for new private chats
        return privateChatResponse.data;
      }

      // For group chats, create and add to chat list immediately
      const groupChatResponse = await Api.post('/chat/groups', {
        name,
        capacity: userIds.length + 1,
        is_private: false,
        user_ids: userIds
      });
      
      // Only refresh chat groups for group chats
      fetchChatGroups();
      
      return groupChatResponse.data;
    } catch (error) {
      console.error('Failed to create chat group:', error);
      setError('Failed to create chat group');
      return null;
    }
  };

  // Add leaveGroup function
  const leaveGroup = async (groupId) => {
    try {
      await Api.delete(`/chat/groups/${groupId}/users`);
      
      // Remove the group from the local state
      setChatGroups(prev => prev.filter(group => group.chat_group_id !== groupId));
      
      // If this was the active chat, clear it
      if (activeChat === groupId) {
        setActiveChat(null);
        setMessages([]);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to leave chat group:', error);
      setError('Failed to leave chat group');
      return false;
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
      leaveGroup,
      setActiveChat
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext); 