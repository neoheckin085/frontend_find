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
      console.log('>>> onAuthorizer triggered <<<', { channelName, socketId });
      try {
          const authEndpointUrl = `${API_CONFIG.BASE_URL}/api/broadcasting/auth`;
          console.log('Calling authEndpoint manually:', authEndpointUrl);
          
          // Use the Api utility to make the authenticated POST request
          const response = await Api.post(authEndpointUrl, {
              socket_id: socketId,
              channel_name: channelName,
          });
          
          console.log('AuthEndpoint response:', response.data);
          
          // The response data should be in the format { auth: "...", channel_data: "..." } for presence channels
          // The Pusher library expects an object with 'auth' and optionally 'channel_data'
          // Ensure your backend returns the correct JSON structure.
          if (response.data && response.data.auth) {
              console.log('✅ Authentication successful via onAuthorizer.');
              return response.data; // Return the authorization response from your backend
          } else {
              console.error('❌ Authentication failed: Invalid response format from auth endpoint.', response.data);
              throw new Error('Invalid auth response');
          }
      } catch (error) {
          console.error('❌ Authentication request failed in onAuthorizer:', error);
          console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            response: error.response?.data,
            status: error.response?.status,
          });
          // Rethrow the error so Pusher library knows authentication failed
          throw error;
      }
  };
  // --- End onAuthorizer callback ---

  // Initialize Pusher when user logs in
  useEffect(() => {
    console.log('Pusher initialization effect triggered:', {
      hasToken: !!token,
      hasUser: !!user,
      tokenLength: token?.length,
      userId: user?.user_id
    });

    if (token && user) {
      console.log('Starting Pusher initialization with token and user');
      initializePusher();
    } else {
      console.log('Pusher initialization skipped:', {
        missingToken: !token,
        missingUser: !user
      });
    }

    return () => {
      if (pusherClientInstance) {
        console.log('Cleaning up Pusher connection');
        pusherClientInstance.disconnect();
      }
    };
  }, [token, user]);

  // Initialize Pusher
  const initializePusher = async () => {
    try {
      console.log('Starting Pusher initialization process...');
      
      // Initialize Pusher instance
      console.log('Getting Pusher instance...');
      const pusherClient = await Pusher.getInstance();
      
      console.log('Initializing Pusher with config:', {
        apiKey: PUSHER_CONFIG.APP_KEY,
        cluster: PUSHER_CONFIG.APP_CLUSTER,
        authEndpoint: `${API_CONFIG.BASE_URL}/api/broadcasting/auth`,
        wsHost: `ws-${PUSHER_CONFIG.APP_CLUSTER}.pusher.com`,
        wsPort: 443,
        wssPort: 443,
        forceTLS: true
      });

      // Construct and log the full WebSocket URL
      const wsProtocol = true ? 'wss' : 'ws'; // Using forceTLS value
      const wsHost = `ws-${PUSHER_CONFIG.APP_CLUSTER}.pusher.com`;
      const wsPort = true ? 443 : 443; // Using forceTLS value to determine port
      const fullWebSocketUrl = `${wsProtocol}://${wsHost}:${wsPort}/app/${PUSHER_CONFIG.APP_KEY}`;
      console.log('Attempting to connect to WebSocket URL:', fullWebSocketUrl);

      // Log the authEndpoint URL
      const authEndpointUrl = `${API_CONFIG.BASE_URL}/api/broadcasting/auth`;
      console.log('Using authEndpoint URL:', authEndpointUrl);
      
      // Log the authentication headers being passed
      const authHeaders = {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
      };
      console.log('Authentication headers being passed to Pusher init:', authHeaders);

      console.log('Attempting to connect Pusher...');
      
      // Connect Pusher and wait for the 'connected' state
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Pusher connection timed out'));
        }, 15000); // 15 seconds timeout

        // Define the connection state change handler
        const connectionStateChangeHandler = (current, previous) => {
          console.log('Pusher connection state changed:', {
            from: previous,
            to: current,
            timestamp: new Date().toISOString()
          });
          if (current === 'CONNECTED') {
            clearTimeout(timeout);
            console.log('✅ Pusher connected successfully');
            setIsConnected(true);
            resolve();
          } else if (current === 'DISCONNECTED' || current === 'FAILED') {
            clearTimeout(timeout);
            console.log('❌ Pusher connection failed or disconnected.', { state: current });
            setIsConnected(false);
            reject(new Error(`Pusher connection failed or disconnected with state: ${current}`));
          }
        };

        pusherClient.init({
          apiKey: PUSHER_CONFIG.APP_KEY,
          cluster: PUSHER_CONFIG.APP_CLUSTER,
          // Use onAuthorizer callback instead of authEndpoint and auth.headers
          // authEndpoint: `${API_CONFIG.BASE_URL}/api/broadcasting/auth`,
          // auth: {
          //   headers: {
          //     Authorization: `Bearer ${token}`,
          //     Accept: 'application/json',
          //     'Content-Type': 'application/json',
          //   },
          // },
          onAuthorizer: onAuthorizer, // Pass the new onAuthorizer callback
          onConnectionStateChange: connectionStateChangeHandler,
          onError: (error) => {
            console.error('Pusher connection error:', {
              message: error.message,
              code: error.code,
              timestamp: new Date().toISOString()
            });
            clearTimeout(timeout);
            reject(error);
          }
        });
        
        // Now actually connect after setting up listeners
        pusherClient.connect();
      });
      
      console.log('Setting Pusher client instance in state...');
      setPusherClientInstance(pusherClient);
      console.log('✅ Pusher client initialized and set in state. Current connection state:', pusherClient?.connection?.state);
      
      // Load chat groups after Pusher initialization
      console.log('Fetching chat groups...');
      fetchChatGroups();
      
    } catch (error) {
      console.error('❌ Failed to initialize Pusher client:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
        name: error.name,
        code: error.code
      });
      setError('Failed to connect to chat server');
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
      
      // Check if response.data is a valid array before setting messages
      if (response.data && Array.isArray(response.data)) {
        setMessages([...response.data].reverse()); // Reverse to show oldest first
        console.log('Messages successfully processed and set.');
      } else {
        console.warn('Received invalid message data format:', response.data);
        setMessages([]); // Set to empty array if data is invalid
        setError('Failed to load messages: Invalid data format.');
      }

      setActiveChat(groupId);
      
      // Subscribe to the presence channel for this chat group
      // Moved subscription logic to useEffect that watches activeChat and pusherClientInstance state
      // subscribeToChat(groupId);
      
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
      console.log('Sending message to chat:', activeChat);
      const response = await Api.post(`/chat/groups/${activeChat}/messages`, {
        message
      });
      
      console.log('Message sent successfully:', response.data);
      
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
  const subscribeToChat = async (groupId) => {
    console.log('=== Starting Chat Subscription ===');
    console.log('Initial state:', {
      hasPusherClient: !!pusherClientInstance,
      groupId: groupId,
      pusherState: pusherClientInstance?.connection?.state || 'not initialized'
    });

    if (!pusherClientInstance) {
      console.error('❌ Pusher client not initialized - cannot subscribe to chat');
      return null;
    }
    
    // Add detailed pre-subscription checks
    console.log('Pre-subscription check before calling subscribe:', {
      pusherClientInstanceExists: !!pusherClientInstance,
      pusherClientConnectionState: pusherClientInstance?.connection?.state,
      tokenExists: !!token,
      authEndpointUsed: `${API_CONFIG.BASE_URL}/api/broadcasting/auth`,
      groupId: groupId,
      channelNameAttempt: `presence-chat.group.${groupId}`
    });

    console.log('Pusher client is in CONNECTED state (indicated by isConnected state). Proceeding with subscription.');
    
    try {
      console.log('Preparing to subscribe to chat group:', groupId);
      
      // Use the Pusher client to subscribe to the presence channel
      const channelName = `presence-chat.group.${groupId}`;
      console.log('Channel details for subscribe call:', {
        name: channelName,
        type: 'presence',
        groupId: groupId
      });
      
      console.log('Attempting to subscribe with parameters:', {
        channelName: channelName,
        // Note: onEvent, onSubscriptionSucceeded, onSubscriptionError callbacks are also implicitly passed.
      });
      
      // Subscribe using the documented pattern
      const channel = await pusherClientInstance.subscribe({
        channelName: channelName,
        onEvent: (event) => {
          console.log('>>> Raw Channel Event Data <<<', event); // Log all events
          console.log('=== Channel Event Received ===');
          console.log('Event Details:', {
            eventName: event.eventName,
            channelName: event.channelName,
            data: event.data,
            timestamp: new Date().toISOString()
          });

          if (event.eventName === 'App\\Events\\NewMessage') {
            console.log('New message event received');
            try {
              const data = JSON.parse(event.data);
              console.log('Parsed raw message data from event:', data);
              
              // Extract the nested message object from the parsed data
              const messageData = data?.message; 
              
              if (messageData && messageData.message_id) { // Ensure it looks like a message object
                console.log('Processing message data for state update:', {
                  message_id: messageData.message_id,
                  message: messageData.message,
                  userId: messageData.user_id,
                  groupId: messageData.chat_group_id,
                  hasUserObject: !!messageData.user // Check if user object exists
                });
                
                setMessages(prev => {
                  if (prev.some(msg => msg.message_id === messageData.message_id)) {
                    console.log('Message already exists, not adding duplicate');
                    return prev;
                  }
                  console.log('Adding new message object to state:', { message_id: messageData.message_id });
                  // Add the extracted messageData object to the state
                  return [...prev, messageData];
                });
              } else {
                console.warn('No valid message data found in event or data format is unexpected.', messageData);
              }
            } catch (error) {
              console.error('Error processing message event:', error);
              console.error('Raw event data:', event.data);
            }
          }
        },
        onSubscriptionSucceeded: (data) => {
          console.log('=== Subscription Succeeded ===');
          console.log('Channel:', channelName);
          console.log('Data:', data);
          console.log('Timestamp:', new Date().toISOString());
          console.log('Pusher client state on subscription success:', pusherClientInstance?.connection?.state);
        },
        onSubscriptionError: (error) => {
          console.error('=== Subscription Error ===');
          console.error('Channel:', channelName);
          console.error('Error:', error);
          console.error('Timestamp:', new Date().toISOString());
        }
      });
      
      console.log('Channel subscription initiated:', {
        channelName: channelName,
        hasChannel: !!channel
      });
      
      // Store the channel instance in the ref
      currentChannelRef.current = channel;

      console.log('✅ Channel subscription process completed.', channelName);
      return channel;
    } catch (error) {
      console.error('❌ Failed to subscribe to chat:', error);
      console.error('Subscription error details:', {
        error: error.message,
        stack: error.stack,
        groupId: groupId,
        attemptedChannel: `presence-chat.group.${groupId}`,
        pusherState: pusherClientInstance?.connection?.state || 'unknown'
      });
      setError('Failed to connect to chat channel');
      return null;
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

  // Effect to subscribe/unsubscribe when active chat changes OR Pusher is connected
  useEffect(() => {
    console.log('>>> useEffect [activeChat, isConnected] triggered <<<');
    console.log('Active chat or Pusher isConnected state changed.', {
      activeChat: activeChat,
      isConnected: isConnected
    });
    
    // Unsubscribe from the previous channel if it exists and Pusher instance is available
    if (currentChannelRef.current && pusherClientInstance) {
        console.log('Unsubscribing from previous channel:', currentChannelRef.current.name);
        // Use optional chaining as connection might be undefined during cleanup
        // Unsubscribe logic can proceed regardless of connection state during cleanup
        pusherClientInstance.unsubscribe(currentChannelRef.current.name);
        currentChannelRef.current = null; // Clear the ref after unsubscribing
    }

    // Subscribe to the new chat channel if activeChat is set and Pusher is connected
    if (activeChat && isConnected && pusherClientInstance) { // Added pusherClientInstance check for safety
      console.log('--- Conditions met for subscription. Calling subscribeToChat ---');
      console.log('Active chat set and Pusher is CONNECTED, subscribing...', activeChat);
      subscribeToChat(activeChat);
      
    } else if (activeChat && !isConnected) {
       console.warn('Active chat set, but Pusher is not CONNECTED. Subscription will be attempted when connected.');
    } else if (activeChat && isConnected && !pusherClientInstance) {
       console.warn('Active chat set and isConnected is true, but Pusher client instance is missing.');
    }

    return () => {
      // Cleanup function: Unsubscribe when component unmounts or dependencies change
      if (currentChannelRef.current && pusherClientInstance) {
         console.log('Cleanup: Unsubscribing from channel on unmount or dependency change:', currentChannelRef.current.name);
         // Unsubscribe logic can proceed regardless of connection state during cleanup
         pusherClientInstance.unsubscribe(currentChannelRef.current.name);
         currentChannelRef.current = null; // Clear the ref on unmount
      }
    };
    // Depend on active chat and isConnected state
  }, [activeChat, isConnected, pusherClientInstance]); 

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