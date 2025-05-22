import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, TextInput, Button, KeyboardAvoidingView, Platform, Modal, TouchableHighlight, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import NotificationScreen from '../components/Notifikasi';
import EmojiSelector from 'react-native-emoji-selector';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import API_CONFIG from '../config/apiConfig';

const ChatList = ({ navigation }) => {
  const { chatGroups, loading, error, fetchChatGroups } = useChat();

  useEffect(() => {
    fetchChatGroups();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('Messages', { chatGroup: item })}>
      <View style={styles.chatItem}>
        <Image source={{ uri: item.avatar || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRSXBzOgUojdYeF3P-fP4TLuUNPSSbLsJk_Q&s' }} style={styles.avatar} />
        <View style={styles.chatInfo}>
          <Text style={styles.name}>{item.display_name || item.name}</Text>
          <Text style={styles.message} numberOfLines={1}>
            {item.messages && item.messages.length > 0 ? 
              `${item.messages[0].user?.name || 'User'}: ${item.messages[0].message}` : 
              'No messages yet'}
          </Text>
        </View>
        {item.unread_count > 0 && <View style={styles.unreadIndicator} />}
      </View>
    </TouchableOpacity>
  );

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
  const { messages, loading, error, loadMessages, sendMessage } = useChat();
  const [inputMessage, setInputMessage] = useState('');
  const [emojiModalVisible, setEmojiModalVisible] = useState(false);

  useEffect(() => {
    if (chatGroup?.chat_group_id) {
      loadMessages(chatGroup.chat_group_id);
      
      // Set navigation title
      if (chatGroup) {
        navigation.setOptions({ title: chatGroup.display_name || chatGroup.name });
      }
    }
  }, [chatGroup?.chat_group_id]);

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
    if (!msg.user) return null;
    return msg.user.profile_photo_url ? 
      API_CONFIG.getStorageUrl(msg.user.profile_photo_url) : 
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRSXBzOgUojdYeF3P-fP4TLuUNPSSbLsJk_Q&s';
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={({ item }) => {
          const isUser = item.user && item.user.user_id === user.user_id;
          return (
            <View style={[styles.messageBubbleContainer, isUser ? styles.userMessageContainer : styles.otherMessageContainer]}>
              {!isUser && (
                <Image source={{ uri: getAvatar(item) }} style={styles.messageAvatar} />
              )}
              <View style={[styles.chatBubble, isUser ? styles.chatBubbleUser : styles.chatBubbleOther]}>
                <Text style={[styles.senderName, isUser ? styles.senderUser : styles.senderOther]}>
                  {item.user ? item.user.name : 'Unknown User'}
                </Text>
                <Text style={[styles.chatText, { color: '#000' }]}>{item.message}</Text>
              </View>
            </View>
          );
        }}
      />
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={() => setEmojiModalVisible(true)} style={styles.emojiButton}>
          <Text style={styles.emojiText}>😊</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="Ketik pesan..."
        />
        <Button title="Kirim" onPress={handleSendMessage} />
      </View>

      {/* Emoji Modal */}
      <Modal
        visible={emojiModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEmojiModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalBackground} onPress={() => setEmojiModalVisible(false)}>
          <View style={styles.emojiModal}>
            {/* Using EmojiSelector */}
            <EmojiSelector
              onEmojiSelected={handleEmojiSelect}
              showSearchBar={true} // Optional: adds search bar to find emojis
            />
          </View>
        </TouchableOpacity>
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
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  message: {
    fontSize: 14,
    color: '#666',
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007bff',
  },
  chatBubble: {
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  chatBubbleUser: {
    backgroundColor: '#dcf8c6',
    alignSelf: 'flex-end',
  },
  chatBubbleOther: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
  },
  senderName: {
    fontWeight: 'bold',
  },
  senderUser: {
    color: '#007bff',
  },
  senderOther: {
    color: '#000',
  },
  chatText: {
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  icon: {
    marginRight: 20,
  },
  emojiButton: {
    marginRight: 10,
  },
  emojiText: {
    fontSize: 24,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  emojiModal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    height: '70%',
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
    marginVertical: 5,
    marginHorizontal: 10,
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 5,
    alignSelf: 'flex-end',
  },
});

export default App;
