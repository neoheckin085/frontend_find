import { View, Text, Image, ImageBackground, StyleSheet } from 'react-native'
import React, { useEffect } from 'react'
import Logo from '../assets/F!ND.png'
import Background from '../assets/Tangan.png';

const Splash = ({ navigation }) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('mainApp');
    }, 3000);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text}>Welcome to F!ND!</Text>
        <View>
        <Image source={Logo} style={styles.logo} resizeMode="contain" />
        </View>
        </View>
        <View style={{flex: 1}}>
        <Image source={Background} style={styles.backgroundImage} resizeMode="cover" />
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#fff',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, 
  },
  text: {
    color: '#000',
    marginBottom: 20,
    fontWeight: 'bold',
     fontSize: 40,
     marginBottom: 70,
  },
  logo: {
    width: 130,
    height: 130,
    marginTop: 10,
  },
});

export default Splash;