import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TextInput, Image, StyleSheet, Alert, Platform, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';
import Api, { baseURL } from '../../libs/Api';

export default function OpenStreetMapScreen() {
  const mapRef = useRef(null);
  const [searchText, setSearchText] = useState('');
  const [radius, setRadius] = useState('5'); // Default radius in kilometers
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const requestLocationPermission = async () => {
      let permission;
      if (Platform.OS === 'android') {
        permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      } else {
        permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
      }
      const result = await request(permission);
      if (result === RESULTS.GRANTED) {
        // Get current location after permission is granted
        Geolocation.getCurrentPosition(
          position => {
            const { latitude, longitude } = position.coords;
            setCurrentLocation({ latitude, longitude });
            fetchNearbyCommunities(radius);
          },
          error => Alert.alert('Error', 'Could not get your location'),
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
      } else {
        Alert.alert('Permission Denied', 'Location permission is required to use this feature.');
      }
    };
    requestLocationPermission();
  }, []);

  const fetchNearbyCommunities = async (radius) => {
    try {
      setLoading(true);
      
      // Get current position
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          
          console.log('Current location:', { latitude, longitude });
          
          // Make API request with current coordinates
          const response = await Api.get('/getplaces', {
            params: {
              latitude,
              longitude,
              radius
            }
          });

          console.log('API Response:', response.data);

          if (response.data.success) {
            console.log('Communities data:', response.data.data);
            setCommunities(response.data.data);
          }
          setLoading(false);
        },
        (error) => {
          Alert.alert('Error', 'Could not get your current location');
          console.error('Error getting location:', error);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch nearby communities');
      console.error('Error fetching communities:', error);
      setLoading(false);
    }
  };

  const handleRadiusChange = (text) => {
    setRadius(text);
    fetchNearbyCommunities(text);
  };

  const handleMarkerPress = (community) => {
    try {
      console.log('Attempting to navigate to Join screen with community:', community);
      if (!community || !community.community_id) {
        console.error('Invalid community data:', community);
        Alert.alert('Error', 'Invalid community data');
        return;
      }
      
      navigation.navigate('Join', { 
        community: {
          ...community,
          community_id: community.community_id,
          name: community.name,
          gambar: community.gambar,
          latitude: community.latitude,
          longitude: community.longitude,
          description: community.description,
          owner_id: community.owner_id
        }
      });
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Could not navigate to community details');
    }
  };

  const [markers, setMarkers] = useState([
    {
      id: 1,
      latitude: -5.139055,
      longitude: 119.449818,
      title: 'Ikasi Kota Makassar',
      image: require('../assets/IkasiMakassar.png'),
    },
    {
      id: 2,
      latitude: -5.156771,
      longitude: 119.446319,
      title: 'TLCavalryID',
      image: require('../assets/TlCavalary.png'),
    },
    {
      id: 3,
      latitude: -5.170977,
      longitude: 119.436224,
      title: 'PSM Fans',
      image: require('../assets/PsmFans.png'),
    },
  ]);

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If the path is already a full URL, replace localhost with actual IP
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      // Use the storage URL directly
      const url = imagePath.replace('127.0.0.1:8000', '192.168.100.60:8000');
      console.log('Original URL:', imagePath);
      console.log('Modified URL:', url);
      return url; 
    }
    
    // If we have a relative path, construct the storage URL
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    // Remove /api from baseURL for storage paths
    const storageBaseUrl = baseURL.replace('/api', '');
    const fullUrl = `${storageBaseUrl}/storage/${cleanPath}`;
    console.log('Constructed storage URL:', fullUrl);
    return fullUrl;
  };

  // Add console log in the render to check communities state
  console.log('Current communities state:', communities);

  return (
    <View style={styles.container}>
      <MapView ref={mapRef} style={styles.map}
        region={{
          latitude: currentLocation?.latitude || -5.150000,
          longitude: currentLocation?.longitude || 119.440000,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}

        moveOnMarkerPress={false}
      >
        {/* Display markers for all communities */}
        {communities && communities.length > 0 ? (
          communities.map((community) => {
            console.log('Rendering marker for community:', community);
            return (
              <Marker
                key={community.community_id}
                coordinate={{
                  latitude: parseFloat(community.latitude),
                  longitude: parseFloat(community.longitude)
                }}
                anchor={{ x: 0.5, y: 1 }}
                onPress={() => handleMarkerPress(community)}
              >
                <View style={styles.markerContainer}>
                    <Image 
                      source={{ 
                        uri: getFullImageUrl(community.gambar),
                        cache: 'reload'
                      }}
                      style={styles.markerImage}
                      onError={(e) => {
                        console.log('Image loading error:', e.nativeEvent.error);
                        const imageUrl = getFullImageUrl(community.gambar);
                        console.log('Failed URL:', imageUrl);
                        console.log('Community data:', community);
                        
                        // Try to fetch the image directly to check if it's accessible
                        fetch(imageUrl)
                          .then(response => {
                            console.log('Fetch response status:', response.status);
                            console.log('Fetch response headers:', response.headers);
                            return response.text();
                          })
                          .then(text => {
                            console.log('Response body:', text);
                          })
                          .catch(error => {
                            console.log('Fetch error details:', {
                              message: error.message,
                              name: error.name,
                              stack: error.stack
                            });
                          });
                      }}
                      onLoad={() => console.log('Image loaded successfully')}
                    />
                </View>
              </Marker>
            );
          })
        ) : (
          console.log('No communities to display')
        )}
      </MapView>

      {/* Search and Radius Input */}
      <View style={styles.searchBarContainer}>
        <Ionicons
          name="arrow-back"
          size={24}
          color="#333"
          style={styles.icon}
          onPress={() => navigation.goBack()}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a location.."
          placeholderTextColor="#666"
          value={searchText}
          onChangeText={setSearchText}
        />
        <TextInput
          style={styles.radiusInput}
          placeholder="Radius (km)"
          placeholderTextColor="#666"
          value={radius}
          onChangeText={handleRadiusChange}
          keyboardType="numeric"
        />
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject, zIndex: 0 },

  markerContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
  },

  markerText: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 12,
    fontWeight: 'bold',
  },

  markerImage: {
    width: 40,
    height: 40,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: 'white',
  },

  searchBarContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 25,
    paddingHorizontal: 10,
    height: 45,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 10,
    color: '#000',
  },

  icon: {
    paddingHorizontal: 6,
  },

  attributionContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 5,
    borderRadius: 5,
  },
  attributionText: {
    fontSize: 10,
    color: '#666',
  },

  communitiesList: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 10,
    maxHeight: '40%',
  },

  flatList: {
    flex: 1,
  },

  communityItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  communityImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },

  communityInfo: {
    flex: 1,
    justifyContent: 'center',
  },

  communityName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },

  communityDistance: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },

  communityDescription: {
    fontSize: 12,
    color: '#666',
  },

  radiusInput: {
    width: 80,
    height: 35,
    backgroundColor: 'white',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginLeft: 10,
  },

  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    zIndex: 1,
  },
});
