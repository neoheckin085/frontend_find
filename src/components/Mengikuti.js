import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Api from '../../libs/Api';
import API_CONFIG from '../../src/config/apiConfig';

const Mengikuti = () => {
  const [posts, setPosts] = useState([]);
  const [liked, setLiked] = useState([]);
  const [showLikeIcon, setShowLikeIcon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  // Add this function to check auth status
  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Current auth token:', token ? 'Token exists' : 'No token found');
      
      // Try to get user info to verify token is valid
      if (token) {
        const response = await Api.get('/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Current user:', response.data);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      if (error.response) {
        console.error('Auth check response:', error.response.data);
      }
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

      console.log('Fetching posts with token:', token);
      const response = await Api.get('/user/community-posts', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('API Response:', response.data);

      // Check if response.data has pagination structure
      if (response.data && response.data.data) {
        // Use the data array from pagination
        const postsData = response.data.data;
        console.log('Posts data:', postsData);
        setPosts(postsData);
        setLiked(new Array(postsData.length).fill(false));
        setShowLikeIcon(new Array(postsData.length).fill(false));
      } else if (Array.isArray(response.data)) {
        // Handle case where response might be direct array
        setPosts(response.data);
        setLiked(new Array(response.data.length).fill(false));
        setShowLikeIcon(new Array(response.data.length).fill(false));
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
    } finally {
      setLoading(false);
      setRefreshing(false); // End refreshing state
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

  const toggleLike = (index) => {
    const updatedLiked = [...liked];
    updatedLiked[index] = !updatedLiked[index];
    setLiked(updatedLiked);
  };

  const handleDoubleTap = (index) => {
    if (!liked[index]) {
      toggleLike(index);
    }
    const updatedShowLikeIcon = [...showLikeIcon];
    updatedShowLikeIcon[index] = true;
    setShowLikeIcon(updatedShowLikeIcon);
    setTimeout(() => {
      updatedShowLikeIcon[index] = false;
      setShowLikeIcon([...updatedShowLikeIcon]);
    }, 1000);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return it as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Add storage/ prefix if not present
    if (!imagePath.startsWith('storage/')) {
      imagePath = `storage/${imagePath}`;
    }
    
    return `${API_CONFIG.BASE_URL}/${imagePath}`;
  };

  const Card = ({ post, index }) => {
    console.log('Rendering card for post:', post);
    
    // Get community image URL
    const communityImageUrl = post.community?.gambar ? 
      getImageUrl(post.community.gambar) : 
      null;
    
    // Get post image URL
    const postImageUrl = post.image ? 
      getImageUrl(post.image) : 
      null;

    // Define default images
    const defaultAvatar = require('../assets/default-avatar.jpg');
    const defaultPost = require('../assets/default-post.jpg');

    // State for expanded text
    const [isExpanded, setIsExpanded] = useState(false);
    const [shouldShowReadMore, setShouldShowReadMore] = useState(false);
    
    // Character limit for description
    const CHARACTER_LIMIT = 150;

    // Function to handle text layout
    const onTextLayout = ({ nativeEvent: { lines } }) => {
      if (!shouldShowReadMore && lines.length > 2) {
        setShouldShowReadMore(true);
      }
    };

    const handleCommunityPress = async () => {
      try {
        // Fetch community details before navigation
        const response = await Api.get(`/communities/${post.community_id}`);
        navigation.navigate('Join', { community: response.data });
      } catch (error) {
        console.error('Error fetching community details:', error);
        Alert.alert('Error', 'Could not load community details');
      }
    };

    // Function to render description with Read More
    const renderDescription = () => {
      const description = post.description || '';
      
      if (!shouldShowReadMore || isExpanded) {
        return (
          <Text style={styles.cardDescription} onTextLayout={onTextLayout}>
            <Text style={styles.cardTittle}>{post.title}</Text> - {description}
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
          <Text style={styles.cardTittle}>{post.title}</Text> - 
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
        <TouchableOpacity onPress={handleCommunityPress}>
          <View style={styles.cardHeader}>
            <Image 
              style={styles.logo} 
              source={communityImageUrl ? { uri: communityImageUrl } : defaultAvatar}
            />
            <Text style={styles.judul}>{post.community?.name || post.community?.description || 'Community'}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7} onPress={() => handleDoubleTap(index)}>
          <Image 
            style={styles.gambar} 
            source={postImageUrl ? { uri: postImageUrl } : defaultPost}
          />
          {showLikeIcon[index] && (
            <View style={styles.likeIconContainer}>
              <Icon name="heart" size={60} color="#e74c3c" />
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => toggleLike(index)}>
            <Icon name="heart" size={30} color={liked[index] ? '#e74c3c' : '#bdc3c7'} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => navigation.navigate('Comment', { postId: post.post_id })}
          >
            <Icon name="comment-o" size={30} color="#bdc3c7" />  
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

  return (
    <ScrollView 
      style={{ flex: 1 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#0000ff"]} // Android
          tintColor="#0000ff" // iOS
        />
      }
    >
      {posts.length > 0 ? (
        posts.map((post, index) => (
          <Card key={post.post_id} post={post} index={index} />
        ))
      ) : (
        <View style={styles.noPostsContainer}>
          <Text style={styles.noPostsText}>No posts found in your communities</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
  cardTittle: {
    fontWeight: 'bold' 
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
  gambar: {
    width: '100%',
    height: 450,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8
  },
  likeIconContainer: {
    position: 'absolute',
    top: '40%',
    left: '45%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardBody: {
    padding: 15
  },
  cardDescription: {
    fontSize: 16,
    lineHeight: 22 
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10
  },
  actionButton: {
    marginRight: 20
  },
  readMoreText: {
    color: '#666',
    fontWeight: 'bold',
  },
});

export default Mengikuti;