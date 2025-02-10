import { View, Text } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import Router from './router'
import {AuthProvider} from '../context/AuthContext';

const App = () => {
  return (
    <NavigationContainer>
    <AuthProvider>
        <Router />
      </AuthProvider>
    </NavigationContainer>
  );
};

export default App;