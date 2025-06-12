import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, TextInput, Button, KeyboardAvoidingView, Platform, Modal, TouchableHighlight, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import NotificationScreen from '../components/Notifikasi';
import EmojiSelector from 'react-native-emoji-selector';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import API_CONFIG from '../config/apiConfig';
import ChatGroupInfo from '../components/ChatGroupInfo';

const ChatList = ({ navigation }) => {
  const { chatGroups, loading, error, fetchChatGroups } = useChat();
  const { user } = useAuth();

  useEffect(() => {
    fetchChatGroups();
  }, []);

  const rootNavigation = navigation.getParent ? navigation.getParent() : navigation;

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // If it's already a full URL, return it
    if (imagePath.startsWith('http')) return imagePath;
    // Add storage/ prefix if not present
    const storagePath = imagePath.startsWith('storage/') ? imagePath : `storage/${imagePath}`;
    return API_CONFIG.getStorageUrl(storagePath);
  };

  const renderItem = ({ item }) => {
    // Get the other user for private chats
    const otherUser = item.is_private ? item.users?.find(u => u.user_id !== user.user_id) : null;

    return (
      <TouchableOpacity onPress={() => rootNavigation.navigate('Messages', { chatGroup: item })}>
        <View style={styles.chatItem}>
          <Image 
            source={
              item.is_private
                ? otherUser?.photo
                  ? { uri: API_CONFIG.getStorageUrl(otherUser.photo) }
                  : require('../assets/default-avatar.jpg')
                : item.community?.gambar
                  ? { uri: getImageUrl(item.community.gambar) }
                  : require('../assets/Find.png')
            } 
            style={styles.avatar}
            onError={(error) => {
              console.log('Image loading error for chat:', item.name);
              console.log('Community:', item.community);
              console.log('Image path:', item.is_private ? otherUser?.photo : item.community?.gambar);
              console.log('Full URL:', item.is_private 
                ? (otherUser?.photo ? API_CONFIG.getStorageUrl(otherUser.photo) : 'using default avatar')
                : (item.community?.gambar ? getImageUrl(item.community.gambar) : 'using default image'));
              console.log('Error details:', error.nativeEvent);
            }}
          />
          <View style={styles.chatInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>
                {item.is_private 
                  ? otherUser?.name || 'Unknown User'
                  : item.display_name || item.name}
              </Text>
              {item.unread_count > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadCount}>
                    {item.unread_count > 99 ? '99+' : item.unread_count}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[
              styles.message,
              item.unread_count > 0 && styles.unreadMessage
            ]} numberOfLines={1}>
              {item.messages && item.messages.length > 0 ? 
                `${item.messages[0].user?.name || 'User'}: ${item.messages[0].message}` : 
                'No messages yet'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Try Again" onPress={fetchChatGroups} />
      </View>
    );
  }

  if (chatGroups.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No chat groups found</Text>
        <Button title="Refresh" onPress={fetchChatGroups} />
      </View>
    );
  }

  return (
    <FlatList 
      data={chatGroups} 
      keyExtractor={(item) => item.chat_group_id.toString()} 
      renderItem={renderItem}
      refreshing={loading}
      onRefresh={fetchChatGroups}
    />
  );
};

const Messages = ({ route, navigation }) => {
  const { chatGroup } = route.params || {};
  const { user } = useAuth();
  const { messages, loading, error, loadMessages, sendMessage, leaveGroup } = useChat();
  const [inputMessage, setInputMessage] = useState('');
  const [emojiModalVisible, setEmojiModalVisible] = useState(false);
  const [groupInfoVisible, setGroupInfoVisible] = useState(false);
  const flatListRef = useRef(null);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const storagePath = imagePath.startsWith('storage/') ? imagePath : `storage/${imagePath}`;
    return API_CONFIG.getStorageUrl(storagePath);
  };

  useEffect(() => {
    if (chatGroup?.chat_group_id) {
      loadMessages(chatGroup.chat_group_id);
      
      // Set custom header with community image and name
      navigation.setOptions({
        headerTitle: () => (
          <TouchableOpacity 
            onPress={() => setGroupInfoVisible(true)}
            style={styles.headerContainer}
          >
            <Image 
              source={
                chatGroup.community?.gambar
                  ? { uri: getImageUrl(chatGroup.community.gambar) }
                  : require('../assets/Find.png')
              }
              style={styles.headerAvatar}
            />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>{chatGroup.display_name || chatGroup.name}</Text>
              <Text style={styles.headerSubtitle}>
                {chatGroup?.users?.length || 0} members
              </Text>
            </View>
          </TouchableOpacity>
        ),
        headerTitleAlign: 'left',
      });
    }
  }, [chatGroup?.chat_group_id]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const handleEmojiSelect = (emoji) => {
    setInputMessage(inputMessage + emoji);
    setEmojiModalVisible(false); // Close emoji modal
  };

  const handleLeaveGroup = async (groupId) => {
    const success = await leaveGroup(groupId);
    if (success) {
      setGroupInfoVisible(false);
      navigation.goBack();
    }
  };

  if (loading && messages.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Try Again" onPress={() => loadMessages(chatGroup.chat_group_id)} />
      </View>
    );
  }

  const getAvatar = (msg) => {
    if (!msg.user) return require('../assets/default-avatar.jpg');
    if (msg.user.photo) {
      return { uri: API_CONFIG.getStorageUrl(msg.user.photo) };
    }
    return require('../assets/default-avatar.jpg');
  };

  const renderMessage = ({ item, index }) => {
    const isUser = item.user && item.user.user_id === user.user_id;
    const showAvatar = !isUser && (
      index === messages.length - 1 || 
      messages[index + 1].user?.user_id !== item.user?.user_id
    );

    return (
      <View style={[
        styles.messageBubbleContainer,
        isUser ? styles.userMessageContainer : styles.otherMessageContainer
      ]}>
        {!isUser && (
          <View style={{ width: 35, marginRight: 8 }}>
            {showAvatar ? (
              <Image 
                source={getAvatar(item)} 
                style={styles.messageAvatar}
              />
            ) : null}
          </View>
        )}
        <View style={[
          styles.chatBubble,
          isUser ? styles.chatBubbleUser : styles.chatBubbleOther
        ]}>
          {!isUser && (
            <Text style={[styles.senderName, styles.senderOther]}>
              {item.user ? item.user.name : 'Unknown User'}
            </Text>
          )}
          <Text style={styles.chatText}>{item.message}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Chat Group Info Modal */}
      <ChatGroupInfo
        visible={groupInfoVisible}
        onClose={() => setGroupInfoVisible(false)}
        chatGroup={chatGroup}
        onLeaveGroup={handleLeaveGroup}
      />

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.message_id.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
      />

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={() => setEmojiModalVisible(true)} style={styles.emojiButton}>
          <Text style={styles.emojiButtonText}>😊</Text>
        </TouchableOpacity>
        
        <TextInput
          style={styles.input}
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="Type a message..."
          multiline
        />
        
        <TouchableOpacity 
          onPress={handleSendMessage}
          style={[styles.sendButton, !inputMessage.trim() && styles.sendButtonDisabled]}
          disabled={!inputMessage.trim()}
        >
          <FontAwesome name="send" size={20} color={inputMessage.trim() ? '#007bff' : '#ccc'} />
        </TouchableOpacity>
      </View>

      {/* Emoji Selector Modal */}
      <Modal
        visible={emojiModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.emojiContainer}>
          <View style={styles.emojiHeader}>
            <TouchableOpacity onPress={() => setEmojiModalVisible(false)}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>
          <EmojiSelector
            onEmojiSelected={emoji => {
              setInputMessage(prev => prev + emoji);
              setEmojiModalVisible(false);
            }}
            showSearchBar={false}
            columns={8}
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const Stack = createStackNavigator();
const App = ({ navigation }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ChatList"
        component={ChatList}
        options={{
          title: 'Chat',
          headerLeft: () => null, 
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.navigate('Notifikasi')}>
              <FontAwesome name="bell" size={22} color="#808080" style={styles.icon}/>
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen name="Messages" component={Messages} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  chatInfo: {
    flex: 1,
    marginLeft: 10,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  message: {
    fontSize: 14,
    color: '#666',
  },
  unreadBadge: {
    backgroundColor: '#007bff',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  unreadMessage: {
    fontWeight: 'bold',
    color: '#000',
  },
  chatBubble: {
    padding: 8,
    paddingHorizontal: 12,
    marginVertical: 1,
    borderRadius: 15,
    maxWidth: '75%',
  },
  chatBubbleUser: {
    backgroundColor: '#DCF8C6',
    borderTopRightRadius: 5,
    marginLeft: 40,
    alignSelf: 'flex-end',
  },
  chatBubbleOther: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 5,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    alignSelf: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    marginBottom: 2,
    fontWeight: '600',
  },
  senderOther: {
    color: '#075E54',
  },
  chatText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#000000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 8,
    minHeight: 60,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    backgroundColor: '#fafafa',
    fontSize: 16,
    color: '#000',
    textAlignVertical: 'top',
  },
  icon: {
    marginRight: 20,
  },
  emojiButton: {
    marginRight: 10,
  },
  emojiButtonText: {
    fontSize: 24,
  },
  emojiContainer: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 'auto',
  },
  emojiHeader: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeButton: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '500',
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
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  messageBubbleContainer: {
    flexDirection: 'row',
    marginVertical: 2,
    marginHorizontal: 8,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginRight: 8,
    backgroundColor: '#E2E2E2',
  },
  messagesList: {
    padding: 10,
  },
  sendButton: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 0,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerTextContainer: {
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
  },
});

export default App;
export { Messages };
