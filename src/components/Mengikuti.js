import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Api from '../../libs/Api';
import API_CONFIG from '../../src/config/apiConfig';

const Mengikuti = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  // Add this function to check auth status
  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
  };

  // Function to fetch posts
  const fetchPosts = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }

      const response = await Api.get('/user/community-posts', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.data) {
        setPosts(response.data.data);
      } else if (Array.isArray(response.data)) {
        setPosts(response.data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchPosts();
  }, []);

  useEffect(() => {
    checkAuthStatus();
    fetchPosts();
  }, []);

  // Add useFocusEffect to refresh when navigating back
  useFocusEffect(
    React.useCallback(() => {
      fetchPosts();
    }, [])
  );

  const handleLike = async (postId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await Api.post(`/posts/${postId}/toggle-like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update the posts state with the new like status
      setPosts(currentPosts => 
        currentPosts.map(post => 
          post.post_id === postId 
            ? { 
                ...post, 
                is_liked: response.data.is_liked,
                likes_count: response.data.likes_count 
              }
            : post
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (!imagePath.startsWith('storage/')) {
      imagePath = `storage/${imagePath}`;
    }
    
    return `${API_CONFIG.BASE_URL}/${imagePath}`;
  };

  const Card = ({ post }) => {
    const [lastTap, setLastTap] = useState(0);
    const [showHeart, setShowHeart] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [shouldShowReadMore, setShouldShowReadMore] = useState(false);

    const onImagePress = () => {
      const now = Date.now();
      if (now - lastTap < 300) {
        // Double tap detected
        if (!post.is_liked) {
          handleLike(post.post_id);
          setShowHeart(true);
          setTimeout(() => setShowHeart(false), 1000);
        }
        setLastTap(0);
      } else {
        setLastTap(now);
      }
    };

    const renderDescription = () => {
      const description = post.description || '';
      const CHARACTER_LIMIT = 150;

      // Function to handle text layout
      const onTextLayout = ({ nativeEvent: { lines } }) => {
        if (!shouldShowReadMore && lines.length > 2) {
          setShouldShowReadMore(true);
        }
      };

      if (!shouldShowReadMore || isExpanded) {
        return (
          <Text style={styles.cardDescription} onTextLayout={onTextLayout}>
            {description}
            {shouldShowReadMore && (
              <Text 
                style={styles.readMoreText} 
                onPress={() => setIsExpanded(false)}
              >
                {' '}Lebih sedikit
              </Text>
            )}
          </Text>
        );
      }

      return (
        <Text style={styles.cardDescription} onTextLayout={onTextLayout}>
          {description.slice(0, CHARACTER_LIMIT)}...
          <Text 
            style={styles.readMoreText} 
            onPress={() => setIsExpanded(true)}
          >
            {' '}Selengkapnya
          </Text>
        </Text>
      );
    };

    return (
      <View style={styles.card}>
        <TouchableOpacity onPress={() => navigation.navigate('Join', { community: post.community })}>
          <View style={styles.cardHeader}>
            <Image 
              style={styles.logo} 
              source={post.community?.gambar ? { uri: getImageUrl(post.community.gambar) } : require('../assets/default-avatar.jpg')}
            />
            <Text style={styles.judul}>{post.community?.name || post.community?.description || 'Community'}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.imageContainer}>
          <TouchableOpacity 
            activeOpacity={1}
            onPress={onImagePress}
          >
            <Image 
              style={styles.gambar} 
              source={post.image ? { uri: getImageUrl(post.image) } : require('../assets/default-post.jpg')}
            />
          </TouchableOpacity>
          {showHeart && (
            <View style={styles.heartOverlay}>
              <Icon name="heart" size={80} color="#fff" />
            </View>
          )}
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleLike(post.post_id)}
          >
            <Icon 
              name="heart" 
              size={30} 
              color={post.is_liked ? '#e74c3c' : '#bdc3c7'} 
            />
            <Text style={styles.likeCount}>{post.likes_count || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => navigation.navigate('Comment', { postId: post.post_id })}
          >
            <Icon name="comment-o" size={30} color="#bdc3c7" />  
            <Text style={styles.likeCount}>{post.comments?.length || 0}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.cardBody}>
          {renderDescription()}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View style={styles.noPostsContainer}>
        <Text style={styles.noPostsText}>No posts found in your communities</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#000"]}
          tintColor="#000"
        />
      }
    >
      {posts.map((post) => (
        <Card key={post.post_id} post={post} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  noPostsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  noPostsText: {
    fontSize: 16,
    color: '#666'
  },
  card: {
    margin: 3,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 10 
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 50,
    marginRight: 10
  },
  judul: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 2,
  },
  imageContainer: {
    position: 'relative',
  },
  gambar: {
    width: '100%',
    height: 450,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8
  },
  heartOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10
  },
  actionButton: {
    marginRight: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  likeCount: {
    marginLeft: 5,
    color: '#666'
  },
  cardBody: {
    padding: 15
  },
  cardDescription: {
    fontSize: 16,
    lineHeight: 22 
  },
  readMoreText: {
    color: '#666',
    fontWeight: 'bold',
  },
});

export default Mengikuti;