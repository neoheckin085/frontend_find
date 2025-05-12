import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Api from '../../libs/Api';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [liked, setLiked] = useState([]);
  const [showLikeIcon, setShowLikeIcon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  // Function to fetch posts
  const fetchPosts = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }

      const response = await Api.get('/posts', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        // Debug log for community images
        response.data.forEach(post => {
          if (post.community) {
            console.log('Community image path:', post.community.gambar);
            console.log('Full image URL:', `http://192.168.1.9:8000/storage/${post.community.gambar}`); //ganti ip nya dengan ip yang sesuai

          }
        });
        setPosts(response.data);
        setLiked(new Array(response.data.length).fill(false));
        setShowLikeIcon(new Array(response.data.length).fill(false));
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function untuk handle pull-to-refresh
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchPosts().finally(() => {
      setRefreshing(false);
    });
  }, []);

  useEffect(() => {
    fetchPosts();
  }, []);

  // Function to handle manual refresh
  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  }, []);

  // Add useFocusEffect to refresh when navigating back to Home
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
    
    // Remove any existing 'storage/' prefix
    const cleanPath = imagePath.replace(/^storage\//, '');
    
    // Construct the full URL
    const imageUrl = `http://192.168.245.62:8000/storage/${cleanPath}`;
    console.log('Generated image URL:', imageUrl);
    
    return imageUrl;
  };

  const Card = ({ post, index }) => {
    const communityImage = post.community?.gambar_url || post.community?.gambar;
    console.log('Community data:', {
      name: post.community?.name,
      imagePath: post.community?.gambar,
      imageUrl: post.community?.gambar_url,
      finalUrl: communityImage ? getImageUrl(communityImage) : null
    });

    return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => navigation.navigate('Join', { community: post.community })}>
        <View style={styles.cardHeader}>
          <Image 
            style={styles.logo} 
            source={
              post.community?.gambar && post.community.gambar.trim() !== ''
                ? { 
                    uri: getImageUrl(post.community.gambar),
                    // Add cache control
                    cache: 'reload'
                  }
                : require('../assets/Find.png')
            }
            onLoadStart={() => {
              console.log('Start loading community image:', post.community?.name);
              console.log('Image source:', post.community?.gambar);
              console.log('Full image URL:', post.community?.gambar ? getImageUrl(post.community.gambar) : 'using default');
            }}
            onLoadEnd={() => {
              console.log('Finished loading community image:', post.community?.name);
            }}
            onError={(error) => {
              console.log('Image loading error for community:', post.community?.name);
              console.log('Image path:', post.community?.gambar);
              console.log('Full URL:', post.community?.gambar ? getImageUrl(post.community.gambar) : 'using default image');
              console.log('Error details:', error.nativeEvent);
            }}
          />
          <Text style={styles.judul}>{post.community?.name || 'Community'}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity activeOpacity={0.7} onPress={() => handleDoubleTap(index)}>
        <Image 
          style={styles.gambar} 
          source={{ uri: post.image_url }}
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
        <View style={styles.cardDescription}>
          <Text>
            <Text style={styles.cardTitle}>{post.title}</Text>
            <Text> - </Text>
            <Text>{post.description}</Text>
          </Text>
        </View>
      </View>
    </View>
  )};

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
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
          colors={["#000"]} // Android
          tintColor="#000" // iOS
        />
      }
    >
      {posts.map((post, index) => (
        <Card key={post.post_id} post={post} index={index} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardTitle: {
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
    lineHeight: 22,
    flex: 1
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10
  },
  actionButton: {
    marginRight: 20
  },
});

export default Home;