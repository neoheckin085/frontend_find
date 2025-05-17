import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
//import Icon from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/Ionicons';
import Api from '../../libs/Api';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_CONFIG from '../../src/config/apiConfig';

const Comment = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { postId } = route.params;
  const { user } = useAuth();
  
  const [comment, setComment] = useState('');
  const [reply, setReply] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyingToUser, setReplyingToUser] = useState('');
  const [expandedReplies, setExpandedReplies] = useState({});
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  const fetchComments = async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await Api.get(`/posts/${postId}/comments`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setComments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (comment.trim()) {
      try {
        const token = await getAuthToken();
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await Api.post('/comments', {
          post_id: postId,
          content: comment,
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Add the new comment to the list
        setComments([...comments, response.data.comment]);
        setComment('');
        
        // Refresh comments to get the latest data
        fetchComments();
      } catch (error) {
        console.error('Error adding comment:', error);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
          console.error('Response headers:', error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          console.error('Request error:', error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error message:', error.message);
        }
      }
    }
  };

  const handleReplyComment = (id, username) => {
    setReplyingTo(id);
    setReplyingToUser(username);
    setReply(`@${username} `);
  };

  const handleAddReply = async () => {
    if (reply.trim() && replyingTo !== null) {
      try {
        const token = await getAuthToken();
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await Api.post('/comments', {
          post_id: postId,
          content: reply,
          parent_id: replyingTo
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Refresh comments to get the latest data including the new reply
        fetchComments();
        
        setReply('');
        setReplyingTo(null);
        setReplyingToUser('');
      } catch (error) {
        console.error('Error adding reply:', error);
      }
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const renderComments = (comments, depth = 0) => {
    return comments.map(comment => (
      <View key={comment.comment_id} style={[styles.commentContainer, { marginLeft: depth * 20 }]}> 
        <Image 
          source={
            comment.user?.photo 
              ? { uri: API_CONFIG.getStorageUrl(comment.user.photo) }
              : require('../assets/default-avatar.jpg')
          }
          style={styles.avatar}
        />
        <View style={styles.commentContent}>
          <Text style={styles.username}>{comment.user?.name || 'Unknown User'}</Text>
          <Text style={styles.commentText}>{comment.content}</Text>
          <View style={styles.commentActions}>
            <TouchableOpacity onPress={() => handleReplyComment(comment.comment_id, comment.user?.name)}>
              <Text style={styles.replyText}>Reply</Text>
            </TouchableOpacity>
          </View>

          {comment.replies && comment.replies.length > 0 && (
            <TouchableOpacity onPress={() => toggleReplies(comment.comment_id)}>
              <Text style={styles.seeReplyText}>
                {expandedReplies[comment.comment_id] ? 'Hide replies' : `See ${comment.replies.length} reply${comment.replies.length > 1 ? 'ies' : ''}`}
              </Text>
            </TouchableOpacity>
          )}

          {expandedReplies[comment.comment_id] && comment.replies && renderComments(comment.replies, depth + 1)}
        </View>
      </View>
    ));
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Komentar</Text>
      </View>

      <ScrollView style={styles.commentList}>
        {loading ? (
          <Text style={styles.loadingText}>Loading comments...</Text>
        ) : comments.length > 0 ? (
          renderComments(comments)
        ) : (
          <Text style={styles.noCommentsText}>No comments yet. Be the first to comment!</Text>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={replyingTo ? `Reply to ${replyingToUser}...` : "Write a comment..."}
          value={replyingTo ? reply : comment}
          onChangeText={text => (replyingTo ? setReply(text) : setComment(text))}
        />
        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={replyingTo ? handleAddReply : handleAddComment}
        >
          <Icon name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  commentList: {
    padding: 15,
    marginTop: 90,
  },
  loadingText: {
    textAlign: 'center',
    color: 'gray',
    marginTop: 20,
  },
  noCommentsText: {
    textAlign: 'center',
    color: 'gray',
    marginTop: 20,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 10
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10
  },
  commentContent: {
    flex: 1
  },
  username: {
    fontWeight: 'bold'
  },
  commentText: {
    color: '#333'
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5
  },
  replyText: {
    marginLeft: 10,
    color: 'gray'
  },
  seeReplyText: {
    color: 'blue',
    marginTop: 5
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd'
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0'
  },
  sendButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 20
  },
});

export default Comment;
