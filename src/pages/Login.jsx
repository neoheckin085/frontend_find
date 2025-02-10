import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  ImageBackground, KeyboardAvoidingView
} from 'react-native';
import { create } from 'react-test-renderer';
import { useAuth } from '../../context/AuthContext';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {logs,error,token,user} = useAuth();
  const [pressed, setPressed] = useState(false);
  const [createPress, setCreatePressed] = useState(false);
  const handleLogin = () => {
    logs(email, password, navigation);
  };
  useEffect(() => {
    if (pressed) {
      navigation.replace('mainApp');
    }
    if (createPress) {
      navigation.replace('Register');
    }
    if (token && user) {
      navigation.navigate('mainApp');
    }
  }, [pressed, createPress, token, user, navigation]);
  

  return (
    
    <KeyboardAvoidingView style={styles.container} behavior='padding'>
      {/* Background Image */}
      <ImageBackground
        source={require('../assets/Background.png')} 
        style={styles.background}
      >
        {/* Logo */}
        <KeyboardAvoidingView style={styles.logoContainer}>
          <Image
            source={require('../assets/Find.png')} 
            style={styles.logo}
          />
        </KeyboardAvoidingView>

        {/* Form Login */}
        <KeyboardAvoidingView style={styles.loginContainer} behavior='padding'>
          <Text style={styles.loginTitle}>Login</Text>

          {/* Input Email */}
          <TextInput
            placeholder="Email"
            placeholderTextColor="#000"
            value={email}
            onChangeText={text => setEmail(text)}
            keyboardType="email-address"
            style={styles.input}
            error={error.email}
          />
          {error.email && <Text style={{color: 'red'}}>{error.email[0]}</Text>}

          {/* Input Password */}
          <TextInput
            placeholder="Password"
            placeholderTextColor="#000"
            value={password}
            onChangeText={text => setPassword(text)}
            secureTextEntry
            style={styles.input}
            error={error.password}
          />
          {error.password && <Text style={{color: 'red'}}>{error.password[0]}</Text>}

          {/* Tombol Login */}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          {/* Forget Password */}
          <TouchableOpacity>
            <Text style={styles.forgetPasswordText}>Forget password?</Text>
          </TouchableOpacity>

          {/* Tombol Create Account */}
          <TouchableOpacity style={styles.createAccountButton} onPress={() => setCreatePressed(true)}>
            <Text style={styles.createAccountText}>Create account</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex:2,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 250, 
    height: 250,
  },
  loginContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    flexDirection: 'column',
    padding: '15%',
    alignItems: 'center',
    borderTopLeftRadius: 100,
    height: '75%',
  },
  loginTitle: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    flex: 0,
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
    height: 'auto',
    flex: 0,
    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: { width: 0, height: 4 }, // Shadow offset for iOS
    shadowOpacity: 0.2, // Shadow opacity for iOS
    shadowRadius: 4, // Shadow radius for iOS
    elevation: 4, // Shadow for Android
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#000',
    padding: 15,
    maxHeight: '10%',
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgetPasswordText: {
    color: '#000',
    fontSize: 14,
    marginTop: '2%',
    flex: 0,
    textAlign: 'center',
  },
  createAccountButton: {
    width: '100%',
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 4,
    maxHeight: '10%',
    marginTop: '55%',
    alignContent: 'center',
  },
  createAccountText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Login;
