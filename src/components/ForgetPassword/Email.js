import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  KeyboardAvoidingView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Api from '../../api/Api';

const Email = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Sending forgot password request');
      const response = await Api.post('/forgot-password', { email });
      console.log('Forgot password response:', response.data);
      
      Alert.alert('Success', response.data.message);
      navigation.navigate('VerifEmail', { email });
    } catch (error) {
      console.error('Error:', error);
      
      let errorMessage = 'Failed to send reset email. ';
      
      if (error.response?.status === 422) {
        // Validation error
        const validationErrors = error.response.data.errors;
        if (validationErrors?.email) {
          errorMessage = validationErrors.email[0];
        } else {
          errorMessage = 'Invalid email address';
        }
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Network error - Please check your internet connection and make sure the server is running.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.request) {
        errorMessage = 'No response from server. Please check if the server is running.';
      } else {
        errorMessage += error.message;
      }

      Alert.alert(
        'Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      {/* Background Image */}
      <ImageBackground source={require('../../assets/Hitam.png')} style={styles.background}>
        {/* Header & Back Button */}
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.backgroundTitle}>Search your account</Text>
        </View>

        <View style={styles.formContainer}>
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
            autoCapitalize="none"
          />

          <TouchableOpacity onPress={() => navigation.navigate('Telepon')}>
            <Text style={styles.phoneOptionText}>Use phone number? Click here</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.enterButton, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.enterButtonText}>
              {isLoading ? 'Sending...' : 'Enter'}
            </Text>
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
  buttonDisabled: {
    backgroundColor: '#666',
  },
});

export default Email;