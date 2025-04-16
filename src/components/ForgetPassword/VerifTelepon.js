import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  KeyboardAvoidingView,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const VerifTelepon = () => {
  const navigation = useNavigation();
  const [code, setCode] = useState(''); 

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <ImageBackground source={require('../../assets/Hitam.png')} style={styles.background}>
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.backgroundTitle}>Verification</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.instructionText}>
            We have sent you a code, please enter the code to confirm your account.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Add the code"
            placeholderTextColor="#aaa"
            value={code} 
            onChangeText={setCode} 
            keyboardType="number-pad" 
            maxLength={6} 
          />

          <TouchableOpacity style={styles.enterButton} onPress={() => navigation.navigate('NewPassword')}>
            <Text style={styles.enterButtonText}>Enter</Text>
          </TouchableOpacity>

          <TouchableOpacity >
            <Text style={styles.phoneOptionText}>Sent Again</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'flex-start', 
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  backButton: {
    marginRight: 10, 
  },
  backgroundTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  formContainer: {
    position: 'absolute',
    bottom: 0, 
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: '5%', 
    alignItems: 'center',
    height: '70%',
  },
  instructionText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    color: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  phoneOptionText: {
    color: '#777',
    textAlign: 'center',
    marginTop: 15,
  },
  enterButton: {
    width: '100%',
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  enterButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VerifTelepon;