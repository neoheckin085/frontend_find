import { View, Text, LogBox } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import Router from './router'
import {AuthProvider} from '../context/AuthContext';
import {ChatProvider} from '../context/ChatContext';

LogBox.ignoreAllLogs(); 
const App = () => {
  return (
    <NavigationContainer>
      <AuthProvider>
        <ChatProvider>
          <Router />
        </ChatProvider>
      </AuthProvider>
    </NavigationContainer>
  );
};

export default App;