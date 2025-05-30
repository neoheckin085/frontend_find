import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import API_CONFIG from '../config/apiConfig';

const ChatGroupInfo = ({ visible, onClose, chatGroup, onLeaveGroup }) => {
  const { user } = useAuth();

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const storagePath = imagePath.startsWith('storage/') ? imagePath : `storage/${imagePath}`;
    return API_CONFIG.getStorageUrl(storagePath);
  };

  const renderMember = ({ item }) => (
    <View style={styles.memberItem}>
      <Image 
        source={item.profile_image ? { uri: getImageUrl(item.profile_image) } : require('../assets/Find.png')}
        style={styles.memberAvatar}
      />
      <Text style={styles.memberName}>{item.name}</Text>
      {chatGroup.community?.owner_id === item.user_id && (
        <Text style={styles.adminBadge}>Admin</Text>
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
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  memberName: {
    flex: 1,
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
});

export default ChatGroupInfo; 