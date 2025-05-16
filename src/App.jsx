import { View, Text } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import Router from './router'
import {AuthProvider} from '../context/AuthContext';
import LoadingScreen from './components/LoadingScreen';

const App = () => {
  return (
    <>
      <LoadingScreen />
      <NavigationContainer>
        <AuthProvider>
          <Router />
        </AuthProvider>
      </NavigationContainer>
    </>
  );
};

export default App;