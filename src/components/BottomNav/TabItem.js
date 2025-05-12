import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { PlatformPressable } from '@react-navigation/elements';
import React from 'react'
import Icon from 'react-native-vector-icons/FontAwesome'

const TabItem = ({isFocused, onPress, onLongPress, label}) => {
  const Tombol = () => {
    if (label === 'Home') {
      return isFocused ? (
        <Icon name="home" size={40} color="black"/>
      ) : (
        <Icon name="home" size={34} color="gray"/>
      );
    }
    if (label === 'Maps') {
      return isFocused ? (
        <Icon name="map" size={40} color="black"/>
      ) : (
        <Icon name="map" size={30} color="gray"/>
      );
    }
    if (label === 'Post') {
      return isFocused ? (
        <Icon name="plus-square" size={40} color="black"/>
      ) : (
        <Icon name="plus-square" size={30} color="gray"/>
      );
    }
    if (label === 'Chat') {
      return isFocused ? (
        <Icon name="commenting-o" size={40} color="black"/>
      ) : (
        <Icon name="commenting-o" size={30} color="gray"/>
      );
    }
    if (label === 'Profil') {
      return isFocused ? (
        <Icon name="user-circle-o" size={40} color="black"/>
      ) : (
        <Icon name="user-circle-o" size={30} color="gray"/>
      );
    }
    return <Icon name="map" size={30} color="black" />
  };
  
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Tombol />
    </TouchableOpacity>
  );
}

export default TabItem;