import { View, Text, Button, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import Splash from '../button/Splash';
import { createNativeStackNavigator} from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Maps, Search, Chat, Profil } from '../button';
import BottomNav from '../components/BottomNav';
import Icon from 'react-native-vector-icons/FontAwesome'; 

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainApp = () => {
    return (
      <Tab.Navigator tabBar={props => <BottomNav {...props}/>}>
      <Tab.Screen 
        name="Home" 
        component={Home} 
        options={{
          headerLeft: () => (
            <Image source={require('../assets/Find.png')} style={{ width: 100, height: 120, resizeMode: 'contain'}}/>
          ),
          headerTitle: 'F1ND',
          headerRight: () => (
            <TouchableOpacity onPress={() => console.log("More options pressed")}>
              <Icon name="ellipsis-v" size={24} color="#333" style={{ marginRight: 10 }} />
            </TouchableOpacity>
          ),
        }} 
      />
      <Tab.Screen 
        name="Maps" 
        component={Maps} 
        options={{
          headerLeft: () => (
            <Image source={require('../assets/Find.png')} style={{ width: 100, height: 120, resizeMode: 'contain'}}/>
          ),
          headerTitle: '',
          headerRight: () => (
            <TouchableOpacity onPress={() => console.log("More options pressed")}>
              <Icon name="ellipsis-v" size={24} color="#333" style={{ marginRight: 10 }} />
            </TouchableOpacity>
          ),
        }} 
      />
      <Tab.Screen 
        name="Search" 
        component={Search} 
        options={{
          headerLeft: () => (
            <Image source={require('../assets/Find.png')} style={{ width: 100, height: 120, resizeMode: 'contain'}}/>
          ),
          headerTitle: '',
          headerRight: () => (
            <TouchableOpacity onPress={() => console.log("More options pressed")}>
              <Icon name="ellipsis-v" size={24} color="#333" style={{ marginRight: 10 }} />
            </TouchableOpacity>
          ),
        }} 
      />
      <Tab.Screen 
        name="Chat" 
        component={Chat} 
        options={{
          headerLeft: () => (
            <Image source={require('../assets/Find.png')} style={{ width: 100, height: 120, resizeMode: 'contain'}}/>
          ),
          headerTitle: '',
          headerRight: () => (
            <TouchableOpacity onPress={() => console.log("More options pressed")}>
              <Icon name="ellipsis-v" size={24} color="#333" style={{ marginRight: 10 }} />
            </TouchableOpacity>
          ),
        }} 
      />
      <Tab.Screen 
        name="Profil" 
        component={Profil} 
        options={{
          headerLeft: () => (
            <Image source={require('../assets/Find.png')} style={{ width: 100, height: 120, resizeMode: 'contain'}}/>
          ),
          headerTitle: '',
          headerRight: () => (
            <TouchableOpacity onPress={() => console.log("More options pressed")}>
              <Icon name="ellipsis-v" size={24} color="#333" style={{ marginRight: 10 }} />
            </TouchableOpacity>
          ),
        }} 
      />
    </Tab.Navigator>
  );
};

const Router = () => {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{
      contentStyle: { backgroundColor: 'transparent' }, // Set background color for all screens
    }}
>
        <Stack.Screen name="mainApp" component={MainApp} options={{ headerShown: false}}/>
        <Stack.Screen name="Splash" component={Splash} options={{ headerShown: false}}/>
    </Stack.Navigator>
  );
};

export default Router;