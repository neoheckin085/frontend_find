import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import API_CONFIG from '../config/apiConfig';

const ChatGroupInfo = ({ visible, onClose, chatGroup, onLeaveGroup, navigation }) => {
  const { user } = useAuth();

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const storagePath = imagePath.startsWith('storage/') ? imagePath : `storage/${imagePath}`;
    return API_CONFIG.getStorageUrl(storagePath);
  };

  // Get the other user in private chat
  const getOtherUser = () => {
    if (!chatGroup?.users) return null;
    return chatGroup.users.find(u => u.user_id !== user.user_id);
  };

  const handleUserPress = (userId) => {
    if (userId !== user.user_id) {
      navigation.navigate('UserProfile', { userId });
    }
  };

  const renderMember = ({ item }) => (
    <TouchableOpacity 
      style={styles.memberItem}
      onPress={() => handleUserPress(item.user_id)}
      disabled={item.user_id === user.user_id}
    >
      <Image 
        source={
          item.photo 
            ? { uri: API_CONFIG.getStorageUrl(item.photo) }
            : require('../assets/default-avatar.jpg')
        }
        style={styles.memberAvatar}
      />
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        {chatGroup.community?.owner_id === item.user_id && (
          <Text style={styles.adminBadge}>Admin</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  // Render private chat info
  const renderPrivateChatInfo = () => {
    const otherUser = getOtherUser();
    if (!otherUser) return null;

    return (
      <View style={styles.modalContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Chat Info</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.infoSection}
          onPress={() => handleUserPress(otherUser.user_id)}
        >
          <Image 
            source={
              otherUser.photo
                ? { uri: API_CONFIG.getStorageUrl(otherUser.photo) }
                : require('../assets/default-avatar.jpg')
            }
            style={styles.userImage}
          />
          <Text style={styles.userName}>{otherUser.name}</Text>
          {otherUser.nomor_telepon && (
            <Text style={styles.userInfo}>📱 {otherUser.nomor_telepon}</Text>
          )}
          {otherUser.email && (
            <Text style={styles.userInfo}>✉️ {otherUser.email}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.blockButton}
          onPress={() => {
            // TODO: Implement block user functionality
            console.log('Block user:', otherUser.user_id);
          }}
        >
          <Text style={styles.blockButtonText}>Block User</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render group chat info
  const renderGroupChatInfo = () => (
    <View style={styles.modalContent}>
      <View style={styles.header}>
        <Text style={styles.title}>{chatGroup?.name || 'Group Info'}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        {chatGroup?.community && (
          <Image 
            source={
              chatGroup.community.gambar
                ? { uri: getImageUrl(chatGroup.community.gambar) }
                : require('../assets/Find.png')
            }
            style={styles.groupImage}
          />
        )}
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{chatGroup?.users?.length || 0}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{chatGroup?.capacity || 0}</Text>
            <Text style={styles.statLabel}>Capacity</Text>
          </View>
        </View>
      </View>

      <View style={styles.membersSection}>
        <Text style={styles.sectionTitle}>Members</Text>
        <FlatList
          data={chatGroup?.users || []}
          renderItem={renderMember}
          keyExtractor={(item) => item.user_id}
          style={styles.membersList}
        />
      </View>

      {user && chatGroup?.users?.find(u => u.user_id === user.user_id) && (
        <TouchableOpacity 
          style={styles.leaveButton}
          onPress={() => onLeaveGroup(chatGroup.chat_group_id)}
        >
          <Text style={styles.leaveButtonText}>Leave Group</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {chatGroup?.is_private ? renderPrivateChatInfo() : renderGroupChatInfo()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '80%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  userInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  groupImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#666',
  },
  membersSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  membersList: {
    flex: 1,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  memberInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  memberName: {
    flex: 1,
    fontSize: 16,
  },
  adminBadge: {
    color: '#007bff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  leaveButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  leaveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  blockButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  blockButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ChatGroupInfo; 