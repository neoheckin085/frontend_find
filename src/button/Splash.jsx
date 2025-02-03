import { View, Text } from 'react-native'
import React, { useEffect } from 'react'

const Splash = ({navigation}) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('mainApp');
    }, 300);
  }, [navigation]);
  
  return (
    <View>
      <Text>Splash</Text>
    </View>
  )
}

export default Splash