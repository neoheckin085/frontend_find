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
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Api from '../../api/Api';

const VerifEmail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params;
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerifyToken = async () => {
    if (!token) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setIsLoading(true);
    try {
      const response = await Api.post('/verify-token', { token });
      navigation.navigate('NewPassword', { token, email: response.data.email });
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid verification code';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      const response = await Api.post('/forgot-password', { email });
      Alert.alert('Success', response.data.message);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend code';
      Alert.alert('Error', message);
    } finally {
      setIsResending(false);
    }
  };

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
            We have sent you a code to your email address. Please enter the code to verify.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter verification code"
            placeholderTextColor="#aaa"
            value={token}
            onChangeText={setToken}
            keyboardType="default"
            autoCapitalize="none"
          />

          <TouchableOpacity 
            style={[styles.enterButton, isLoading && styles.buttonDisabled]}
            onPress={handleVerifyToken}
            disabled={isLoading}
          >
            <Text style={styles.enterButtonText}>
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleResendCode}
            disabled={isResending}
          >
            <Text style={[styles.resendText, isResending && styles.textDisabled]}>
              {isResending ? 'Sending...' : 'Resend Code'}
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
    fontWeight: 'bold',
    textAlign: 'center',
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
  resendText: {
    color: '#000',
    marginTop: 15,
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: '#666',
  },
  textDisabled: {
    color: '#666',
  },
});

export default VerifEmail;