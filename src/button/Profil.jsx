// D:\find\frontend_find\src\button\Profil.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, StatusBar, Image, ImageBackground, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
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

  useEffect(() => {
    if (detailUser) {
      console.log('User berhasil dimuat:', detailUser);
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
                ? { uri: API_CONFIG.getStorageUrl(detailUser.photo) }
                : Logokecil
            }
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              borderWidth: 3,
              borderColor: '#fff'
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