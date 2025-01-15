import { View, Text } from 'react-native'
import React from 'react'
import Splash from '../button/Splash';
import { createBottomStackNavigator } from '@react-navigation/bottom-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Maps, Search, Chat, Profil } from '../button';
import BottomNav from '../components/BottomNav';
const Stack = createBottomTabNavigator();
const Tab = createBottomTabNavigator();
const Router = () => {
    return (
    <Tab.Navigator tabBar={props => <BottomNav {...props}/>}>
        <Tab.Screen name="Home" component={Home} options={{ headerShown: false}} />
        <Tab.Screen name="Maps" component={Maps} options={{ headerShown: false}} />
        <Tab.Screen name="Search" component={Search} options={{ headerShown: false}} />
        <Tab.Screen name="Chat" component={Chat} options={{ headerShown: false}} />
        <Tab.Screen name="Profil" component={Profil} options={{ headerShown: false}} />
    </Tab.Navigator>
    );
};
/*const Router = () => {
  return (
    <Stack.Navigator initialRouteName="MainApp">
        <Stack.Screen name="Main" component={MainApp} options={{ headerShown: false}}/>
        <Stack.Screen name="Splash" component={Splash} options={{ headerShown: false}}/>
    </Stack.Navigator>
  );
};*/

export default Router