import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { PlatformPressable } from '@react-navigation/elements';
import React from 'react'
import Icon from 'react-native-vector-icons/FontAwesome'

const TabItem = ({isFocused,onPress,label,onLongPress}) => {
  const Tombol=()=>{
    if (label === 'Home') {
     return isFocused?(
      <Icon name="home" size={40} color ="black"/>
  ):(
  <Icon name="home" size={35} color ="gray"/>
);
    }
    if (label === 'Maps') {
      return isFocused?(
       <Icon name="map" size={30} color ="black"/>
   ):(
   <Icon name="map" size={20} color ="gray"/>
 );
}
 if (label === 'Search') {
  return isFocused?(
   <Icon name="search" size={60} color ="black"/>
):(
<Icon name="search" size={55} color ="gray"/>
);
     }
     if (label === 'Chat') {
      return isFocused?(
       <Icon name="commenting-o" size={30} color ="black"/>
    ):(
    <Icon name="commenting-o" size={20} color ="gray"/>
    );
         }
         if (label === 'Profil') {
          return isFocused?(
           <Icon name="user-circle-o" size={30} color ="black"/>
        ):(
        <Icon name="user-circle-o" size={20} color ="gray"/>
        );
             }
    return <Icon name="map" size={30} color="black" />
  };
  
    return (
      <>
    <View style={{flexDirection: 'column', justifyContent: 'center', alignItems:'center', flex: 'center'}}>
    <TouchableOpacity onPress={onPress} onLongPress={onLongPress} style={{flexDirection: 'row', alignItems: 'center'}}>
                <Tombol />
              </TouchableOpacity>
                </View>
              </>
  )
}

export default TabItem