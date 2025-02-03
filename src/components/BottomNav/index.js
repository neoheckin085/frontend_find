import { View, Text, Platform } from 'react-native'
import { useLinkBuilder, useTheme } from '@react-navigation/native';
import { PlatformPressable } from '@react-navigation/elements';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TabItem from './TabItem';
import React from 'react'

const BottomNav = ({state, descriptors, navigation}) => {
    const { colors } = useTheme();
    const { buildHref } = useLinkBuilder();
  
    return (
    <View style={{flexDirection: 'column',borderTopWidth: 1, minHeight: 80, alignContent: 'center', overflow: 'hidden'}}>
       <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 'auto', marginHorizontal: 30, flex: 1, overflow: 'hidden'}}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
            <TabItem key={index} label={label} onPress={onPress} onLongPress={onLongPress}  isFocused={isFocused}/>
        );
      })}
    </View>
    </View>
  )
}

export default BottomNav