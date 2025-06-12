import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TextInput, Image, StyleSheet, Alert, Platform, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';
import Api from '../../src/api/Api';
import API_CONFIG from '../../src/config/apiConfig';

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
      try {
        let permission;
        if (Platform.OS === 'android') {
          permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
        } else {
          permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
        }

        // First check if we already have permission
        const checkResult = await check(permission);
        console.log('Location permission check result:', checkResult);

        if (checkResult === RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          // Request permission if not granted
          const result = await request(permission);
          console.log('Location permission request result:', result);
          
          if (result === RESULTS.GRANTED) {
            getCurrentLocation();
          } else {
            // If permission denied, use default location
            console.log('Location permission denied, using default location');
            setCurrentLocation({ 
              latitude: -5.150000, 
              longitude: 119.440000 
            });
            fetchNearbyCommunities(radius);
          }
        }
      } catch (error) {
        console.error('Error requesting location permission:', error);
        Alert.alert(
          'Location Error',
          'Could not access location. Using default location instead.',
          [{ text: 'OK' }]
        );
        // Use default location as fallback
        setCurrentLocation({ 
          latitude: -5.150000, 
          longitude: 119.440000 
        });
        fetchNearbyCommunities(radius);
      }
    };

    const getCurrentLocation = () => {
      console.log('Getting current location...');
      Geolocation.getCurrentPosition(
        position => {
          console.log('Location obtained:', position.coords);
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          fetchNearbyCommunities(radius);
        },
        error => {
          console.error('Error getting location:', error);
          Alert.alert(
            'Location Error',
            'Could not get your current location. Using default location instead.',
            [{ text: 'OK' }]
          );
          // Use default location as fallback
          setCurrentLocation({ 
            latitude: -5.150000, 
            longitude: 119.440000 
          });
          fetchNearbyCommunities(radius);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000, 
          maximumAge: 10000,
          forceRequestLocation: true
        }
      );
    };

    requestLocationPermission();
  }, []);

  const fetchNearbyCommunities = async (radius) => {
    try {
      setLoading(true);
      console.log('Fetching communities with radius:', radius);
      
      // Get current position or use fallback
      const location = currentLocation || { 
        latitude: -5.150000, 
        longitude: 119.440000 
      };
      
      console.log('Using location for API request:', location);
      
      // Make API request with coordinates
      const response = await Api.get('/getplaces', {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          radius: '100' // Temporarily increase radius to ensure we get all communities
        }
      });

      console.log('Full API Response:', JSON.stringify(response.data, null, 2));

      if (response.data.success) {
        const communitiesData = response.data.data;
        console.log('=== COMMUNITIES DEBUG INFO ===');
        console.log('Total communities from API:', communitiesData.length);
        console.log('Communities details:');
        communitiesData.forEach((comm, index) => {
          console.log(`Community ${index + 1}:`, {
            id: comm.community_id,
            name: comm.name,
            lat: comm.latitude,
            lng: comm.longitude,
            hasImage: !!comm.gambar,
            distance: comm.distance, // Log distance if available
            rawData: comm // Log all raw data
          });
        });
        console.log('===========================');
        setCommunities(communitiesData);
      } else {
        console.log('API returned success: false');
        setCommunities([]);
      }
    } catch (error) {
      console.error('Error fetching communities:', error);
      Alert.alert(
        'Error',
        'Failed to fetch nearby communities. Please try again.',
        [{ text: 'OK' }]
      );
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  };

  // Add debug function to show all communities
  const showAllCommunities = async () => {
    try {
      setLoading(true);
      const response = await Api.get('/getplaces', {
        params: {
          latitude: -5.150000,
          longitude: 119.440000,
          radius: '1000' // Very large radius to get all communities
        }
      });

      if (response.data.success) {
        const allCommunities = response.data.data;
        console.log('=== ALL COMMUNITIES DEBUG ===');
        console.log('Total communities found:', allCommunities.length);
        allCommunities.forEach((comm, index) => {
          console.log(`Community ${index + 1}:`, {
            id: comm.community_id,
            name: comm.name,
            lat: comm.latitude,
            lng: comm.longitude,
            hasImage: !!comm.gambar,
            distance: comm.distance,
            rawData: comm
          });
        });
        console.log('===========================');
        setCommunities(allCommunities);
      }
    } catch (error) {
      console.error('Error fetching all communities:', error);
    } finally {
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
    console.log('getFullImageUrl called with imagePath:', imagePath);
    
    if (!imagePath) {
      console.log('imagePath is undefined or null, returning null');
      return null;
    }
    
    // Use the API_CONFIG helper function to get the storage URL
    return API_CONFIG.getStorageUrl(imagePath);
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
            console.log('Processing marker for:', {
              id: community.community_id,
              name: community.name,
              lat: community.latitude,
              lng: community.longitude,
              hasImage: !!community.gambar
            });

            // Validate coordinates
            const latitude = parseFloat(community.latitude);
            const longitude = parseFloat(community.longitude);
            
            if (isNaN(latitude) || isNaN(longitude)) {
              console.error('Invalid coordinates for community:', {
                id: community.community_id,
                name: community.name,
                rawLat: community.latitude,
                rawLng: community.longitude
              });
              return null;
            }

            return (
              <Marker
                key={community.community_id}
                coordinate={{
                  latitude,
                  longitude
                }}
                anchor={{ x: 0.5, y: 1 }}
                onPress={() => handleMarkerPress(community)}
              >
                <View style={styles.markerContainer}>
                    {community.gambar ? (
                      <Image 
                        source={{ 
                          uri: getFullImageUrl(community.gambar),
                          cache: 'reload'
                        }}
                        style={styles.markerImage}
                        onError={(e) => {
                          console.error('Image loading error for community:', {
                            id: community.community_id,
                            name: community.name,
                            imageUrl: getFullImageUrl(community.gambar),
                            error: e.nativeEvent.error
                          });
                        }}
                        onLoad={() => console.log('Image loaded successfully for:', community.name)}
                      />
                    ) : (
                      <View style={[styles.markerImage, { backgroundColor: '#ccc' }]} />
                    )}
                </View>
              </Marker>
            );
          }).filter(Boolean)
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
        {/* Debug button */}
        <TouchableOpacity 
          style={styles.debugButton}
          onPress={showAllCommunities}
        >
          <Text style={styles.debugButtonText}>Show All</Text>
        </TouchableOpacity>
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

  debugButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  
  debugButtonText: {
    color: 'white',
    fontSize: 12,
  },
});
