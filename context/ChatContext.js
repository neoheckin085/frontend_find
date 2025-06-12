import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Api from '../libs/Api';
import { useAuth } from './AuthContext';
import { Pusher } from '@pusher/pusher-websocket-react-native';
import API_CONFIG from '../src/config/apiConfig';
import PUSHER_CONFIG from '../src/config/pusherConfig';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [pusherClientInstance, setPusherClientInstance] = useState(null);
  const [chatGroups, setChatGroups] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Ref to store the currently active channel
  const currentChannelRef = useRef(null);

  // --- New onAuthorizer callback ---
  const onAuthorizer = async (channelName, socketId) => {
      console.log('>>> onAuthorizer triggered <<<', { 
          channelName, 
          socketId,
          token: token ? 'present' : 'missing',
          tokenLength: token?.length,
          apiBaseUrl: API_CONFIG.BASE_URL
      });
      try {
          const authEndpointUrl = `${API_CONFIG.BASE_URL}/api/broadcasting/auth`;
          console.log('Calling authEndpoint manually:', authEndpointUrl);
          
          // Log the request payload
          const requestPayload = {
              socket_id: socketId,
              channel_name: channelName,
          };
          console.log('Auth request payload:', requestPayload);
          
          // Use the Api utility to make the authenticated POST request
          const response = await Api.post(authEndpointUrl, requestPayload);
          
          console.log('AuthEndpoint response:', {
              status: response.status,
              statusText: response.statusText,
              data: response.data,
              headers: response.headers
          });
          
          // The response data should be in the format { auth: "...", channel_data: "..." } for presence channels
          if (response.data && response.data.auth) {
              console.log('✅ Authentication successful via onAuthorizer.');
              return response.data;
          } else {
              console.error('❌ Authentication failed: Invalid response format from auth endpoint.', {
                  hasAuth: !!response.data?.auth,
                  hasChannelData: !!response.data?.channel_data,
                  responseData: response.data
              });
              throw new Error('Invalid auth response');
          }
      } catch (error) {
          console.error('❌ Authentication request failed in onAuthorizer:', {
              message: error.message,
              stack: error.stack,
              response: error.response?.data,
              status: error.response?.status,
              statusText: error.response?.statusText,
              headers: error.response?.headers,
              config: {
                  url: error.config?.url,
                  method: error.config?.method,
                  headers: error.config?.headers
              }
          });
          throw error;
      }
  };
  // --- End onAuthorizer callback ---

  // Initialize Pusher
  const initializePusher = async () => {
    try {
      console.log('Starting Pusher initialization process...');
      
      const pusherClient = await Pusher.getInstance();
      
      const pusherConfig = {
        apiKey: PUSHER_CONFIG.APP_KEY,
        cluster: PUSHER_CONFIG.APP_CLUSTER,
        wsHost: `ws-${PUSHER_CONFIG.APP_CLUSTER}.pusher.com`,
        wsPort: 443,
        wssPort: 443,
        forceTLS: true,
        enabledTransports: ['ws', 'wss'],
        disabledTransports: [],
        activityTimeout: 30000,
        pongTimeout: 5000,
        maxReconnectionAttempts: 6,
        maxReconnectGap: 10000
      };

      await pusherClient.init({
        ...pusherConfig,
        onAuthorizer: async (channelName, socketId) => {
          try {
            const result = await onAuthorizer(channelName, socketId);
            return result;
          } catch (error) {
            console.error('Pusher authorizer error:', error);
            throw error;
          }
        },
        onConnectionStateChange: (current, previous) => {
          console.log('Pusher connection state changed:', { from: previous, to: current });
          if (current === 'CONNECTED') {
            setIsConnected(true);
            // Resubscribe to all chat groups when reconnected
            if (chatGroups.length > 0) {
              subscribeToAllChatGroups();
            }
          } else if (current === 'DISCONNECTED' || current === 'FAILED') {
            setIsConnected(false);
          }
        },
        onError: (error) => {
          console.error('Pusher connection error:', error);
        }
      });

      await pusherClient.connect();
      setPusherClientInstance(pusherClient);
      
      // Subscribe to all chat groups after initialization
      if (chatGroups.length > 0) {
        subscribeToAllChatGroups();
      }
      
    } catch (error) {
      console.error('Failed to initialize Pusher:', error);
      setError('Failed to connect to chat server');
    }
  };

  // Function to subscribe to all chat groups
  const subscribeToAllChatGroups = async () => {
    if (!pusherClientInstance || !isConnected) {
      console.warn('Cannot subscribe: Pusher not connected');
      return;
    }

    try {
      console.log('Subscribing to all chat groups...');
      chatGroups.forEach(async (group) => {
        const channelName = `presence-chat.group.${group.chat_group_id}`;
        
        // Skip if already subscribed
        if (currentChannelRef.current?.name === channelName) {
          return;
        }

        console.log('Subscribing to channel:', channelName);
        const channel = await pusherClientInstance.subscribe({
          channelName,
          onEvent: (event) => {
            if (event.eventName === 'App\\Events\\NewMessage') {
              console.log('New message event received for group:', group.chat_group_id);
              try {
                const data = JSON.parse(event.data);
                console.log('Parsed message data:', data);
                
                // Update messages and unread count immediately
                if (data.message) {
                  handleNewMessage(data.message);
                }
              } catch (error) {
                console.error('Error processing message event:', error);
              }
            }
          },
        });

        // Store channel reference for active chat
        if (group.chat_group_id === activeChat) {
          currentChannelRef.current = channel;
        }
      });
    } catch (error) {
      console.error('Failed to subscribe to chat groups:', error);
    }
  };

  // Update chat groups when new message is received
  const handleNewMessage = (messageData) => {
    if (!messageData || !messageData.message_id) {
      console.warn('Invalid message data received:', messageData);
      return;
    }

    console.log('Handling new message:', {
      messageId: messageData.message_id,
      chatGroupId: messageData.chat_group_id,
      activeChat: activeChat,
      isActiveChat: messageData.chat_group_id === activeChat,
      senderId: messageData.user?.user_id,
      currentUserId: user?.user_id,
      isOwnMessage: messageData.user?.user_id === user?.user_id
    });

    // Update messages list if we're in the active chat
    if (messageData.chat_group_id === activeChat) {
      setMessages(prev => {
        if (prev.some(msg => msg.message_id === messageData.message_id)) {
          return prev;
        }
        return [...prev, messageData];
      });

      // Reset unread count for active chat
      setChatGroups(prev => {
        return prev.map(group => {
          if (group.chat_group_id === messageData.chat_group_id) {
            return {
              ...group,
              messages: [messageData],
              unread_count: 0
            };
          }
          return group;
        });
      });
    } else {
      // Update chat groups with new message and increment unread count
      // Only increment unread count if the message is not from the current user
      setChatGroups(prev => {
        const updatedGroups = prev.map(group => {
          if (group.chat_group_id === messageData.chat_group_id) {
            const currentUnreadCount = group.unread_count || 0;
            const isOwnMessage = messageData.user?.user_id === user?.user_id;
            
            console.log('Updating chat group:', {
              groupId: group.chat_group_id,
              currentCount: currentUnreadCount,
              isOwnMessage,
              senderId: messageData.user?.user_id,
              currentUserId: user?.user_id
            });

            return {
              ...group,
              messages: [messageData],
              // Only increment unread count if it's not our own message
              unread_count: isOwnMessage ? currentUnreadCount : currentUnreadCount + 1
            };
          }
          return group;
        });
        console.log('Updated chat groups:', updatedGroups);
        return updatedGroups;
      });
    }
  };

  // Fetch user's chat groups
  const fetchChatGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const userToken = await AsyncStorage.getItem('token')
      console.log('Fetching chat groups...');
      const response = await Api.get('/chat/groups', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Chat groups response:', response.data);
      
      // Filter out private chats that have no messages
      const filteredGroups = response.data.filter(group => {
        if (!group.is_private) return true; // Always show group chats
        if (group.messages && group.messages.length > 0) return true; // Show private chats with messages
        return false; // Hide private chats without messages
      });
      
      setChatGroups(filteredGroups);

      // Subscribe to all chat groups for real-time updates
      if (pusherClientInstance && isConnected) {
        console.log('Subscribing to all chat groups for real-time updates');
        filteredGroups.forEach(group => {
          if (group.chat_group_id !== activeChat) { // Don't resubscribe to active chat
            const channelName = `presence-chat.group.${group.chat_group_id}`;
            console.log('Subscribing to channel:', channelName);
            pusherClientInstance.subscribe({
              channelName,
              onEvent: (event) => {
                if (event.eventName === 'App\\Events\\NewMessage') {
                  console.log('New message event received for group:', group.chat_group_id);
                  try {
                    const data = JSON.parse(event.data);
                    console.log('Parsed message data:', data);
                    handleNewMessage(data.message);
                  } catch (error) {
                    console.error('Error processing message event:', error);
                  }
                }
              },
            });
          }
        });
      }
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
      console.log('Loading messages for group:', groupId);
      const response = await Api.get(`/chat/groups/${groupId}/messages`);
      console.log('Messages loaded:', response.data);

      console.log('Is response.data an Array?', Array.isArray(response.data));
      console.log('Full messages response.data:', response.data); // Log the full response data

      let messagesData = response.data;

      // Explicitly parse if data is a string
      if (typeof messagesData === 'string') {
        console.log('Response data is a string. Content:', messagesData);
        try {
          console.log('Attempting to parse string response data as JSON...');
          messagesData = JSON.parse(messagesData);
          console.log('JSON parsing successful. Parsed data type:', typeof messagesData);
          console.log('Is parsed data an Array?', Array.isArray(messagesData));
        } catch (parseError) {
          console.error('Failed to parse string response data as JSON:', parseError);
          setError('Failed to load messages: Invalid data format received.');
          setMessages([]);
          setLoading(false);
          return; // Stop further processing if parsing fails
        }
      } else {
        // Log the data if it's not a string AND not an array (unexpected)
        if (!Array.isArray(messagesData)) {
            console.warn('Response data is neither a string nor an array. Data:', messagesData);
        }
      }

      // NOW, access the 'data' property from the response object
      const messageArray = messagesData?.data; // Use optional chaining in case messagesData is null/undefined

      // Check if the extracted 'data' property is a valid array
      if (messageArray && Array.isArray(messageArray)) {
        console.log('Extracted message array length:', messageArray.length);
        // Log the first few items to see their structure
        console.log('First 3 extracted messages:', messageArray.slice(0, 3));

        setMessages([...messageArray].reverse()); // Reverse to show oldest first
        console.log('Messages successfully processed and set.');
      } else {
        console.warn('Received invalid message data format:', messagesData);
        setMessages([]); // Set to empty array if data is invalid
        setError('Failed to load messages: Invalid data format.');
      }

      // Update chat groups to reset unread count for this chat
      setChatGroups(prev => {
        return prev.map(group => {
          if (group.chat_group_id === groupId) {
            return {
              ...group,
              unread_count: 0
            };
          }
          return group;
        });
      });

      setActiveChat(groupId);
      
    } catch (error) {
      console.error('Failed to load messages:', error);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Send a message to the active chat
  const sendMessage = async (message) => {
    if (!activeChat) {
      console.warn('No active chat selected');
      return null;
    }
    
    try {
      console.log('Sending message to chat:', activeChat);
      const response = await Api.post(`/chat/groups/${activeChat}/messages`, {
        message: message.trim()
      });
      
      if (!response.data || !response.data.message) {
        console.error('Invalid response format:', response.data);
        throw new Error('Invalid response from server');
      }

      const messageData = response.data.message;
      console.log('Message sent successfully:', messageData);
      
      // Validate message data before adding to state
      if (!messageData.message_id || !messageData.message || !messageData.chat_group_id) {
        console.error('Invalid message data:', messageData);
        throw new Error('Invalid message data received');
      }

      // Add message immediately for better UX
      setMessages(prev => {
        // Check if message already exists
        if (prev.some(msg => msg.message_id === messageData.message_id)) {
          return prev;
        }
        // Ensure the message has all required fields
        const newMessage = {
          ...messageData,
          user: messageData.user || { user_id: user.user_id, name: user.name },
          created_at: messageData.created_at || new Date().toISOString()
        };
        return [...prev, newMessage];
      });

      // If this is a private chat and it's not in the chat list yet, add it
      const chatGroup = chatGroups.find(g => g.chat_group_id === activeChat);
      if (!chatGroup && messageData.chat_group?.is_private) {
        try {
          // Fetch the chat group details and add to list
          const groupResponse = await Api.get(`/chat/groups/${activeChat}`);
          if (groupResponse.data) {
            const newGroup = {
              ...groupResponse.data,
              messages: [messageData]
            };
            setChatGroups(prev => [...prev, newGroup]);
          }
        } catch (groupError) {
          console.error('Failed to fetch chat group details:', groupError);
          // Don't throw here, just log the error
        }
      }
      
      return messageData;
    } catch (error) {
      console.error('Failed to send message:', error);
      let errorMessage = 'Failed to send message';
      
      if (error.response) {
        console.error('Response error:', error.response.data);
        errorMessage = error.response.data.error || errorMessage;
      } else if (error.request) {
        console.error('Request error:', error.request);
        errorMessage = 'No response from server';
      } else {
        console.error('Error:', error.message);
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      return null;
    }
  };

  // Subscribe to a chat group's presence channel
  const subscribeToChat = async (groupId) => {
    if (!pusherClientInstance || !isConnected) {
      console.warn('Cannot subscribe: Pusher not connected');
      return;
    }

    try {
      // Unsubscribe from previous channel if exists
      if (currentChannelRef.current) {
        await pusherClientInstance.unsubscribe(currentChannelRef.current.name);
      }

      const channelName = `presence-chat.group.${groupId}`;
      console.log('Subscribing to channel:', channelName);

      const channel = await pusherClientInstance.subscribe({
        channelName,
        onEvent: (event) => {
          if (event.eventName === 'App\\Events\\NewMessage') {
            console.log('New message event received');
            try {
              const data = JSON.parse(event.data);
              console.log('Parsed raw message data from event:', data);
              
              const messageData = data?.message;
              handleNewMessage(messageData);
            } catch (error) {
              console.error('Error processing message event:', error);
              console.error('Raw event data:', event.data);
            }
          }
        },
      });

      currentChannelRef.current = channel;
      console.log('Successfully subscribed to channel:', channelName);
    } catch (error) {
      console.error('Failed to subscribe to chat channel:', error);
      setError('Failed to connect to chat');
    }
  };

  // Function to unsubscribe from a channel (optional, but good practice)
  const unsubscribeFromChat = (groupId) => {
    if (!pusherClientInstance) {
      console.error('❌ Pusher client not initialized - cannot unsubscribe');
      return;
    }

    const channelName = `presence-chat.group.${groupId}`;
    console.log('Attempting to unsubscribe from channel:', channelName);
    pusherClientInstance.unsubscribe(channelName);
    console.log('✅ Unsubscribed from channel:', channelName);
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
      
      // Remove the group from the local state and unsubscribe
      setChatGroups(prev => prev.filter(group => group.chat_group_id !== groupId));
      unsubscribeFromChat(groupId);
      
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

  // Effect to handle Pusher initialization and chat group subscriptions
  useEffect(() => {
    if (token && user) {
      initializePusher();
    }

    return () => {
      if (pusherClientInstance) {
        pusherClientInstance.disconnect();
      }
    };
  }, [token, user]);

  // Effect to handle chat group updates
  useEffect(() => {
    if (isConnected && pusherClientInstance && chatGroups.length > 0) {
      subscribeToAllChatGroups();
    }
  }, [isConnected, chatGroups]);

  // Effect to handle active chat changes
  useEffect(() => {
    if (activeChat && isConnected && pusherClientInstance) {
      subscribeToAllChatGroups();
    }
  }, [activeChat, isConnected]);

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