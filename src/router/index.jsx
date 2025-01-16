import { View, Text, Button, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import Splash from '../button/Splash';
import { createNativeStackNavigator} from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Maps, Search, Chat, Profil } from '../button';
import BottomNav from '../components/BottomNav';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const MainApp = () => {
    return (
    <Tab.Navigator tabBar={props => <BottomNav {...props}/>}>
        <Tab.Screen name="Home" component={Home} options={{ headerLeft: () => ( 
         <Image source={require('../assets/Find.png')} style={{ width: 100, height: 120, resizeMode: 'contain'}}/>
        ), headerTitle:''}}/>
        <Tab.Screen name="Maps" component={Maps}/> 
        <Tab.Screen name="Search" component={Search} />
        <Tab.Screen name="Chat" component={Chat}/>
        <Tab.Screen name="Profil" component={Profil} />
    </Tab.Navigator>
    );
};
const Router = () => {
  return (
    <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen name="mainApp" component={MainApp} options={{ headerShown: false}}/>
        <Stack.Screen name="Splash" component={Splash} options={{ headerShown: false}}/>
    </Stack.Navigator>
  );
};

export default Router;