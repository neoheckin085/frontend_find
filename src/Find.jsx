import { View, Text, ImageBackground, Image } from 'react-native';
import React, { useEffect } from 'react';

const Find = ({ navigation }) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('Login'); // Setelah 5 detik, masuk ke Login
    }, 5000);
  }, [navigation]);

  return (
    <ImageBackground source={require('./assets/Background.png')} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ alignItems: 'center', marginBottom: 5 }}>
        <Image style={{ height: 450, width: 450 }} source={require('./assets/Find.png')} />
      </View>
      <Text style={{ marginTop: 10, fontSize: 70, color: 'white' }}>F!ND</Text>
    </ImageBackground>
  );
};

export default Find;
