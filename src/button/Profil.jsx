import  React, {useState, useEffect} from 'react'
import { View, Text, StatusBar, Image, TouchableOpacity, ImageBackground } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome';
import Logokecil from '../assets/Favian.png'
import babelConfig from '../../babel.config';
import Logobesar from '../assets/makassar.jpg'
import { useAuth } from '../../context/AuthContext';

const Profil = () => {
  const [detailUser, setDetailUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({});
  const { getUserById, token } = useAuth();
  
  useEffect(() => {
    const fetchUser = async () => {
        const userId = 2; // bisa juga pakai ID dari user login kalau kamu simpan di context
        getUserById(userId, token, setDetailUser, setError, setLoading);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (detailUser) {
      console.log('User berhasil dimuat:', detailUser);
    }
  }, [detailUser]);


  return (
    <View style={{flex: 1}}>
    <StatusBar barStyle={'light-content'} backgroundColor="#212121"/>
    <ImageBackground source={Logobesar} 
    style={{flex: 0.5, opacity: 0.9}}
    resizeMode={'cover'}>
     <View style={{flex: 0.5}}>
     </View>
     </ImageBackground>
     <View style={{flex: 1, backgroundColor: '#FFFFFF'}}>
     <View style={{justifyContent: 'center', alignItems: 'center'}}>
     <Image 
     source={Logokecil} 
     style={{
      width: 100, 
      height: 100,
       borderRadius: 100/2,
       borderWidth: 3,
       borderColor: '#FFFFFF',
       position: 'absolute',
       zIndex: 2
       }}  
     />
     </View>
      <View style={{marginTop: 60}}>
        <Text style={{fontWeight: 'bold', fontSize: 20, textAlign: 'center'}}>
        {detailUser?.name || 'Nama tidak tersedia'}</Text>
        <Text style={{ textAlign: 'center' }}>
       {'Tidak dapat bicara, F!ND saja'}
      </Text>

        <View style={{marginLeft: 120}}>
        <View 
        style={{
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginTop: 10
          }}>
          <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            width: 40,
            height: 40
          }}>
          <Icon name="whatsapp" size={25} color="black" />
          </View>
        <View style={{justifyContent: 'center', marginLeft: 10, flex: 1}}>
        <Text style={{fontWeight: 'bold'}}>{detailUser?.nomor_telepon || 'Nomor tidak tersedia'}</Text>
        </View>
        </View>
        <View 
        style={{
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'center',
          }}>
          <View style={{
            justifyContent: 'center',
            alignItems: 'center',
            width: 40,
            height: 40
          }}>
          <Icon name="map-marker" size={25} color="black" />
          </View>
        <View style={{justifyContent: 'center', marginLeft: 10, flex: 1}}>
        <Text style={{fontWeight: 'bold'}}>{detailUser?.lokasi || 'Lokasi tidak tersedia'}</Text>
        </View>
        </View>
        <View 
        style={{
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'center',
          }}>
          <View style={{
            justifyContent: 'center',
            alignItems: 'center',
            width: 40,
            height: 40
          }}>
          <Icon name="envelope-o" size={25} color="black" />
          </View>
        <View style={{justifyContent: 'center', marginLeft: 10, flex: 1}}>
        <Text style={{fontWeight: 'bold'}}> {detailUser?.email || 'Email tidak tersedia'}</Text>
          </View>
        </View>
        <View 
        style={{
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'center',
          }}>
          <View style={{
            justifyContent: 'center',
            alignItems: 'center',
            width: 40,
            height: 40
          }}>
          </View>
        </View>
        </View>
      </View>
     </View>
    </View>
  )
}

export default Profil