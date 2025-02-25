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

const Email = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      {/* Background Image */}
      <ImageBackground source={require('../../assets/Background.png')} style={styles.background}>
        {/* Header & Back Button */}
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.backgroundTitle}>Search your account</Text>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Instruction */}
          <Text style={styles.instructionText}>
            To search your account, please enter your email address
          </Text>

          {/* Email Input */}
          <TextInput
            style={styles.input}
            placeholder="Add your email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          {/* Use phone number */}
          <TouchableOpacity onPress={() => navigation.navigate('Telepon')}>
            <Text style={styles.phoneOptionText}>Use phone number? Click here</Text>
          </TouchableOpacity>

          {/* Enter Button */}
          <TouchableOpacity style={styles.enterButton}  onPress={() => navigation.navigate('VerifEmail')}>
            <Text style={styles.enterButtonText}>Enter</Text>
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
    justifyContent: 'flex-start', // Align items to the top
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
    marginRight: 10, // Space between the back button and the title
  },
  backgroundTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  formContainer: {
    position: 'absolute', // Make the form container absolute
    bottom: 0, // Align it to the bottom
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: '5%', // Adjust padding as needed
    alignItems: 'center',
    height: '70%', // Adjust height as needed
  },
  instructionText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    fontWeight: 'bold'
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
    marginBottom: 20,
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

export default Email;