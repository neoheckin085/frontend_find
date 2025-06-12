import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, TextInput, Button, KeyboardAvoidingView, Platform, Modal, ActivityIndicator, SafeAreaView } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import EmojiSelector from 'react-native-emoji-selector';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import API_CONFIG from '../config/apiConfig';
import ChatGroupInfo from '../components/ChatGroupInfo';

const Messages = ({ route, navigation }) => {
  const { chatGroup } = route.params || {};
  const { user } = useAuth();
  const { messages, loading, error, loadMessages, sendMessage, leaveGroup } = useChat();
  const [inputMessage, setInputMessage] = useState('');
  const [emojiModalVisible, setEmojiModalVisible] = useState(false);
  const [groupInfoVisible, setGroupInfoVisible] = useState(false);
  const flatListRef = useRef(null);
  const [inputHeight, setInputHeight] = useState(40);

  // Predefined emoji list to avoid using the emoji selector library
  const commonEmojis = ['😊', '😂', '❤️', '👍', '🎉', '🙏', '😍', '😭', '😡', '🤔'];

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const storagePath = imagePath.startsWith('storage/') ? imagePath : `storage/${imagePath}`;
    return API_CONFIG.getStorageUrl(storagePath);
  };

  useEffect(() => {
    if (chatGroup?.chat_group_id) {
      loadMessages(chatGroup.chat_group_id);
      
      // Set custom header based on chat type
      navigation.setOptions({
        headerTitle: () => (
          <TouchableOpacity 
            onPress={() => setGroupInfoVisible(true)}
            style={styles.headerContainer}
          >
            {chatGroup.is_private ? (
              // Private chat header
              <>
                <Image 
                  source={
                    chatGroup.users?.find(u => u.user_id !== user.user_id)?.photo
                      ? { uri: API_CONFIG.getStorageUrl(chatGroup.users.find(u => u.user_id !== user.user_id).photo) }
                      : require('../assets/default-avatar.jpg')
                  }
                  style={styles.headerAvatar}
                />
                <View style={styles.headerTextContainer}>
                  <Text style={styles.headerTitle}>
                    {chatGroup.users?.find(u => u.user_id !== user.user_id)?.name || 'Unknown User'}
                  </Text>
                  <Text style={styles.headerSubtitle}>Private Chat</Text>
                </View>
              </>
            ) : (
              // Group chat header
              <>
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
              </>
            )}
          </TouchableOpacity>
        ),
        headerTitleAlign: 'left',
      });
    }
  }, [chatGroup?.chat_group_id]);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleEmojiPress = (emoji) => {
    try {
      setInputMessage(prev => prev + emoji);
    } catch (err) {
      console.error('Error adding emoji:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    try {
      await sendMessage(inputMessage);
      setInputMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
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
      messages[index + 1]?.user?.user_id !== item.user?.user_id
    );

    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.otherMessageContainer
      ]}>
        {showAvatar && !isUser && (
          <Image
            source={getAvatar(item)}
            style={styles.avatar}
          />
        )}
        <View style={[
          styles.messageBubble,
          isUser ? styles.userMessageBubble : styles.otherMessageBubble
        ]}>
          {!isUser && showAvatar && (
            <Text style={styles.senderName}>{item.user?.name || 'Unknown User'}</Text>
          )}
          <Text style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.otherMessageText
          ]}>
            {item.message}
          </Text>
          <Text style={styles.messageTime}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 90}
      >
        <View style={{ flex: 1 }}>
          {/* Chat Group Info Modal */}
          <ChatGroupInfo
            visible={groupInfoVisible}
            onClose={() => setGroupInfoVisible(false)}
            chatGroup={chatGroup}
            onLeaveGroup={handleLeaveGroup}
            navigation={navigation}
          />

          {/* Messages List */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.message_id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            keyboardShouldPersistTaps="handled"
            style={{ flex: 1 }}
          />

          {/* Message Input */}
          <View style={styles.inputContainer}>
            <TouchableOpacity 
              onPress={() => setEmojiModalVisible(!emojiModalVisible)}
              style={styles.emojiButton}
            >
              <Text style={styles.emojiButtonText}>😊</Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.input, { height: Math.max(40, Math.min(100, inputHeight)), maxHeight: 100 }]}
              value={inputMessage}
              onChangeText={setInputMessage}
              placeholder="Type a message..."
              multiline
              onContentSizeChange={e => setInputHeight(e.nativeEvent.contentSize.height)}
              scrollEnabled={inputHeight > 100}
            />
            <TouchableOpacity 
              onPress={handleSendMessage}
              style={[styles.sendButton, !inputMessage.trim() && styles.sendButtonDisabled]}
              disabled={!inputMessage.trim()}
            >
              <FontAwesome name="send" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Simple Emoji Picker */}
          {emojiModalVisible && (
            <View style={styles.emojiPickerContainer}>
              <View style={styles.emojiPickerHeader}>
                <Text style={styles.emojiPickerTitle}>Emoji</Text>
                <TouchableOpacity onPress={() => setEmojiModalVisible(false)}>
                  <Text style={styles.closeButton}>Close</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.emojiGrid}>
                {commonEmojis.map((emoji, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.emojiItem}
                    onPress={() => {
                      handleEmojiPress(emoji);
                      setEmojiModalVisible(false);
                    }}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  messageContainer: {
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
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginRight: 8,
    backgroundColor: '#E2E2E2',
  },
  messageBubble: {
    padding: 8,
    paddingHorizontal: 12,
    marginVertical: 1,
    borderRadius: 15,
    maxWidth: '75%',
  },
  userMessageBubble: {
    backgroundColor: '#DCF8C6',
    borderTopRightRadius: 5,
    marginLeft: 40,
    alignSelf: 'flex-end',
  },
  otherMessageBubble: {
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
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#000000',
  },
  userMessageText: {
    color: '#075E54',
  },
  otherMessageText: {
    color: '#666',
  },
  messagesList: {
    padding: 10,
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
  emojiButton: {
    marginRight: 10,
  },
  emojiButtonText: {
    fontSize: 24,
  },
  emojiPickerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 10,
    maxHeight: 200,
  },
  emojiPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  emojiPickerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 10,
  },
  emojiItem: {
    width: '20%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 24,
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
  errorBanner: undefined,
  errorBannerText: undefined,
  errorBannerClose: undefined,
});

export default Messages; 