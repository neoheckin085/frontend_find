import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

const Comment = () => {
  const navigation = useNavigation();
  const [comment, setComment] = useState('');
  const [reply, setReply] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [comments, setComments] = useState([
    { id: 1, username: 'ruxzy', text: 'ubur ubur ikan lele', likes: 0, liked: false, replies: [] }
  ]);

  const handleAddComment = () => {
    if (comment.trim()) {
      setComments([...comments, { id: comments.length + 1, username: 'You', text: comment, likes: 0, liked: false, replies: [] }]);
      setComment('');
    }
  };

  const handleLikeComment = (id) => {
    setComments(comments.map(comment => 
      comment.id === id ? { ...comment, likes: comment.liked ? comment.likes - 1 : comment.likes + 1, liked: !comment.liked } : comment
    ));
  };

  const handleReplyComment = (id) => {
    setReplyingTo(id);
  };

  const handleAddReply = () => {
    if (reply.trim() && replyingTo !== null) {
      setComments(comments.map(comment =>
        comment.id === replyingTo
          ? { ...comment, replies: [...comment.replies, { id: Date.now(), username: 'You', text: reply, likes: 0, liked: false }] }
          : comment
      ));
      setReply('');
      setReplyingTo(null);
    }
  };

  const handleLikeReply = (commentId, replyId) => {
    setComments(comments.map(comment =>
      comment.id === commentId
        ? { 
            ...comment, 
            replies: comment.replies.map(reply =>
              reply.id === replyId 
                ? { ...reply, likes: reply.liked ? reply.likes - 1 : reply.likes + 1, liked: !reply.liked } 
                : reply
            ) 
          }
        : comment
    ));
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Komentar</Text>
      </View>

      <ScrollView style={styles.commentList}>
        {comments.map((comment) => (
          <View key={comment.id} style={styles.commentContainer}>
            <Icon name="user-circle-o" size={40} color="gray" style={styles.avatar} />
            <View style={styles.commentContent}>
              <Text style={styles.username}>{comment.username}</Text>
              <Text style={styles.commentText}>{comment.text}</Text>
              <View style={styles.commentActions}>
                <TouchableOpacity onPress={() => handleLikeComment(comment.id)}>
                  <Icon name={comment.liked ? "heart" : "heart-o"} size={18} color={comment.liked ? "red" : "black"} />
                </TouchableOpacity>
                <Text style={styles.likeCount}>{comment.likes}</Text>
                <TouchableOpacity onPress={() => handleReplyComment(comment.id)}>
                  <Text style={styles.replyText}>Reply</Text>
                </TouchableOpacity>
              </View>

              {/* Tombol See Replies */}
              {comment.replies.length > 0 && (
                <TouchableOpacity onPress={() => toggleReplies(comment.id)}>
                  <Text style={styles.seeReplyText}>
                    {expandedReplies[comment.id] 
                      ? 'Hide replies' 
                      : `See ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}`}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Menampilkan Reply jika expanded */}
              {expandedReplies[comment.id] && comment.replies.map((reply) => (
                <View key={reply.id} style={styles.replyContainer}>
                  <Icon name="user-circle-o" size={30} color="gray" style={styles.avatarSmall} />
                  <View style={styles.replyContent}>
                    <Text style={styles.username}>{reply.username}</Text>
                    <Text style={styles.commentText}>{reply.text}</Text>
                    <View style={styles.commentActions}>
                      <TouchableOpacity onPress={() => handleLikeReply(comment.id, reply.id)}>
                        <Icon name={reply.liked ? "heart" : "heart-o"} size={16} color={reply.liked ? "red" : "black"} />
                      </TouchableOpacity>
                      <Text style={styles.likeCount}>{reply.likes}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Input Komentar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={replyingTo ? "Reply to comment..." : "Write a comment..."}
          value={replyingTo ? reply : comment}
          onChangeText={text => replyingTo ? setReply(text) : setComment(text)}
        />
        <TouchableOpacity style={styles.sendButton} onPress={replyingTo ? handleAddReply : handleAddComment}>
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
  header: {
     flexDirection: 'row',
      alignItems: 'center',
       padding: 15,
        borderBottomWidth: 1,
         borderColor: '#ddd'
         },
  title: {
     fontSize: 18,
      fontWeight: 'bold',
       marginLeft: 10 
    },
  commentList: {
     padding: 15 
    },
  commentContainer: {
     flexDirection: 'row',
      marginBottom: 15 
    },
  avatar: { 
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
  likeCount: {
     marginLeft: 5 
    },
  replyText: {
     marginLeft: 10,
      color: 'gray' 
    },
  seeReplyText: {
     color: 'blue',
      marginTop: 5 
    },
  replyContainer: {
     flexDirection: 'row',
      marginTop: 5,
       paddingLeft: 20
     },
  avatarSmall: {
     marginRight: 10
     },
  inputContainer: {
     flexDirection: 'row',
      alignItems: 'center',
       padding: 10, borderTopWidth: 1,
        borderColor: '#ddd' 
    },
  input: { flex: 1,
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
