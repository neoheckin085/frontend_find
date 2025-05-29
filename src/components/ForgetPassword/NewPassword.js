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

const NewPassword = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { token, email } = route.params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const response = await Api.post('/reset-password', {
        token,
        password,
        password_confirmation: confirmPassword
      });
      Alert.alert('Success', 'Password has been reset successfully', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Login')
        }
      ]);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <ImageBackground source={require('../../assets/Hitam.png')} style={styles.background}>
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.backgroundTitle}>Change Password</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.instructionText}>
            Enter your new password
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter new password"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm new password"
            placeholderTextColor="#aaa"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={true}
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.enterButton, isLoading && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            <Text style={styles.enterButtonText}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
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
    marginBottom: 35,
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
  buttonDisabled: {
    backgroundColor: '#666',
  },
});

export default NewPassword;