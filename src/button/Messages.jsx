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

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const storagePath = imagePath.startsWith('storage/') ? imagePath : `storage/${imagePath}`;
    return API_CONFIG.getStorageUrl(storagePath);
  };

  useEffect(() => {
    if (chatGroup?.chat_group_id) {
      loadMessages(chatGroup.chat_group_id);
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
    setEmojiModalVisible(false);
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
            <TouchableOpacity onPress={() => setEmojiModalVisible(true)} style={styles.emojiButton}>
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

export default Messages; 