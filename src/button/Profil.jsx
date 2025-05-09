import React, { useState, useEffect } from 'react';
import { View, Text, StatusBar, Image, ImageBackground, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Logokecil from '../assets/Favian.png';
import Logobesar from '../assets/makassar.jpg';
import { useAuth } from '../../context/AuthContext';

const Profil = () => {
  const [detailUser, setDetailUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({});
  const { getUserById, token, user } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      const userId = user?.id;
      if (token) {
        await getUserById(setDetailUser, setError, setLoading);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (detailUser) {
      console.log('User berhasil dimuat:', detailUser);
    }
  }, [detailUser]);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle={'light-content'} backgroundColor="#212121" />
      
      <ImageBackground source={Logobesar} style={{ flex: 0.5, opacity: 0.9 }} resizeMode={'cover'}>
        <View style={{ flex: 0.5 }} />
      </ImageBackground>

      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Image
            source={Logokecil}
            style={{
              width: 100,
              height: 100,
              borderRadius: 100 / 2,
              borderWidth: 3,
              borderColor: '#FFFFFF',
              position: 'absolute',
              zIndex: 2
            }}
          />
        </View>

        <View style={{ marginTop: 60 }}>
          {loading ? (
            <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
          ) : error.message ? (
            <Text style={{ color: 'red', textAlign: 'center' }}>Gagal memuat data: {error.message}</Text>
          ) : (
            <>
              <Text style={{ fontWeight: 'bold', fontSize: 20, textAlign: 'center' }}>
                {detailUser?.name || 'Nama tidak tersedia'}
              </Text>
              <Text style={{ textAlign: 'center' }}>
                Tidak dapat bicara, F!ND saja
              </Text>

              <View style={{ marginLeft: 120 }}>
                {/* Nomor */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
                  <View style={{ justifyContent: 'center', alignItems: 'center', width: 40, height: 40 }}>
                    <Icon name="whatsapp" size={25} color="black" />
                  </View>
                  <View style={{ justifyContent: 'center', marginLeft: 10, flex: 1 }}>
                    <Text style={{ fontWeight: 'bold' }}>{detailUser?.nomor_telepon || 'Nomor tidak tersedia'}</Text>
                  </View>
                </View>

                {/* Lokasi */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ justifyContent: 'center', alignItems: 'center', width: 40, height: 40 }}>
                    <Icon name="map-marker" size={25} color="black" />
                  </View>
                  <View style={{ justifyContent: 'center', marginLeft: 10, flex: 1 }}>
                    <Text style={{ fontWeight: 'bold' }}>{detailUser?.lokasi || 'Lokasi tidak tersedia'}</Text>
                  </View>
                </View>

                {/* Email */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
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
    </View>
  );
};

export default Profil;
