// D:\find\frontend_find\src\button\Profil.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, StatusBar, Image, ImageBackground, ActivityIndicator, RefreshControl, ScrollView, Alert, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Logokecil from '../assets/default-avatar.jpg';
import Logobesar from '../assets/makassar.jpg';
import { useAuth } from '../../context/AuthContext';
import API_CONFIG from '../../src/config/apiConfig';

const Profil = () => {
  const [detailUser, setDetailUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const { getUserById, token, user } = useAuth();

  const fetchUserData = async () => {
    if (token) {
      await getUserById(setDetailUser, setError, setLoading);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchUserData();
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const userId = user?.user_id;
      if (token) {
        await fetchUserData();
      }
    };
    fetchUser();
  }, [token, user?.user_id]);

  // Add test function to check image accessibility
  const testImageAccess = async (imageUrl) => {
    try {
      console.log('Testing image access with URL:', imageUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(imageUrl, {
        method: 'GET',
        headers: {
          'Accept': 'image/*',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const headers = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      
      console.log('Image access test response:', {
        url: imageUrl,
        status: response.status,
        statusText: response.statusText,
        headers: headers,
        type: response.type,
        ok: response.ok,
        platform: Platform.OS,
        isEmulator: Platform.constants.Brand === 'google'
      });
      
      if (!response.ok) {
        const text = await response.text();
        console.error('Error response body:', text);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.ok;
    } catch (error) {
      console.error('Image access test failed:', {
        url: imageUrl,
        error: error.message,
        stack: error.stack,
        code: error.code,
        name: error.name,
        platform: Platform.OS,
        isEmulator: Platform.constants.Brand === 'google'
      });
      return false;
    }
  };

  useEffect(() => {
    if (detailUser) {
      console.log('User berhasil dimuat:', {
        ...detailUser,
        platform: Platform.OS,
        isEmulator: Platform.constants.Brand === 'google',
        baseUrl: API_CONFIG.BASE_URL,
        photoUrl: detailUser.photo ? API_CONFIG.getStorageUrl(detailUser.photo) : null
      });
      
      if (detailUser.photo) {
        const photoUrl = API_CONFIG.getStorageUrl(detailUser.photo);
        console.log('Testing image access...');
        
        // Test image access with more detailed logging
        fetch(photoUrl)
          .then(async (response) => {
            const headers = {};
            response.headers.forEach((value, key) => {
              headers[key] = value;
            });
            
            console.log('Image access test response:', {
              url: photoUrl,
              status: response.status,
              statusText: response.statusText,
              headers: headers,
              type: response.type,
              ok: response.ok
            });
            
            if (!response.ok) {
              const text = await response.text();
              console.error('Error response body:', text);
            }
          })
          .catch(error => {
            console.error('Image access test failed:', {
              url: photoUrl,
              error: error.message,
              stack: error.stack,
              code: error.code
            });
          });
      }
    }
  }, [detailUser]);

  return (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#000"]} // For Android
          tintColor="#000" // For iOS
        />
      }
    >
      <StatusBar backgroundColor="#000" barStyle="light-content" />

      {/* Background Image */}
      <ImageBackground
        source={
          detailUser?.background 
            ? { uri: API_CONFIG.getStorageUrl(detailUser.background) }
            : detailUser?.photo
              ? { uri: API_CONFIG.getStorageUrl(detailUser.photo) }
              : Logokecil
        }
        style={{ width: '100%', height: 200 }}
        blurRadius={
          detailUser?.background && detailUser?.background !== detailUser?.photo
            ? 0  // Jika pengguna menggunakan background yang diatur sendiri
            : 5  // Blur untuk semua kasus lainnya (menggunakan foto profil atau default)
        }
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} />
      </ImageBackground>

      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{
          alignItems: 'center',
          marginTop: -50,
          padding: 15,
        }}>
          {/* Profile Picture */}
          <Image
            source={
              detailUser?.photo 
                ? { 
                    uri: API_CONFIG.getStorageUrl(detailUser.photo),
                    cache: 'reload',
                    headers: {
                      'Accept': 'image/*',
                      'Cache-Control': 'no-cache',
                      'Pragma': 'no-cache'
                    }
                  }
                : Logokecil
            }
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              borderWidth: 3,
              borderColor: '#fff'
            }}
            onError={(error) => {
              const errorInfo = {
                error: error.nativeEvent,
                photo: detailUser?.photo,
                url: detailUser?.photo ? API_CONFIG.getStorageUrl(detailUser.photo) : null,
                platform: Platform.OS,
                isEmulator: Platform.constants.Brand === 'google',
                baseUrl: API_CONFIG.BASE_URL,
                timestamp: new Date().toISOString()
              };
              console.log('Image loading error:', errorInfo);
              
              // Try to test image access when error occurs
              if (detailUser?.photo) {
                testImageAccess(API_CONFIG.getStorageUrl(detailUser.photo));
              }
            }}
          />

          {loading && !refreshing ? (
            <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
          ) : error?.message ? (
            <Text style={{ color: 'red', textAlign: 'center' }}>Gagal memuat data: {error.message}</Text>
          ) : (
            <>
              <Text style={{ fontWeight: 'bold', fontSize: 20, textAlign: 'center', marginTop: 10 }}>
                {detailUser?.name || 'Nama tidak tersedia'}
              </Text>
              <Text style={{ textAlign: 'center', marginTop: 5, color: '#666' }}>
                {detailUser?.tentang || 'Tidak dapat bicara, F!ND saja'}
              </Text>

              <View style={{ marginLeft: 20, marginTop: 20, width: '100%' }}>
                {/* Nomor */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                  <View style={{ justifyContent: 'center', alignItems: 'center', width: 40, height: 40 }}>
                    <Icon name="whatsapp" size={25} color="black" />
                  </View>
                  <View style={{ justifyContent: 'center', marginLeft: 10, flex: 1 }}>
                    <Text style={{ fontWeight: 'bold' }}>{detailUser?.nomor_telepon || 'Nomor tidak tersedia'}</Text>
                  </View>
                </View>

                {/* Lokasi */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                  <View style={{ justifyContent: 'center', alignItems: 'center', width: 40, height: 40 }}>
                    <Icon name="map-marker" size={25} color="black" />
                  </View>
                  <View style={{ justifyContent: 'center', marginLeft: 10, flex: 1 }}>
                    <Text style={{ fontWeight: 'bold' }}>{detailUser?.lokasi || 'Lokasi tidak tersedia'}</Text>
                  </View>
                </View>

                {/* Email */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                  <View style={{ justifyContent: 'center', alignItems: 'center', width: 40, height: 40 }}>
                    <Icon name="envelope-o" size={25} color="black" />
                  </View>
                  <View style={{ justifyContent: 'center', marginLeft: 10, flex: 1 }}>
                    <Text style={{ fontWeight: 'bold' }}>{detailUser?.email || 'Email tidak tersedia'}</Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default Profil;