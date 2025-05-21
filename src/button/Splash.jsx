import { View, Text, Image, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const Splash = ({ navigation }) => {
  const { token, user } = useAuth();

  useEffect(() => {
    setTimeout(() => {
      if (token && user) {
        navigation.replace('MainApp');
      } else {
        navigation.replace('Login');
      }
    }, 3000);
  }, [navigation, token, user]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to F!ND!</Text>
      <Image source={require('../assets/F!ND.png')} style={styles.logo} resizeMode="contain" />
      <Image source={require('../assets/Tangan.png')} resizeMode="cover" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-evenly', alignItems: 'center', backgroundColor: '#fff' },
  text: { fontSize: 40, fontWeight: 'bold', marginBottom: 20 },
  logo: { width: 130, height: 130 },
   backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
});

export default Splash;
