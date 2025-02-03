import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ImageBackground,
} from 'react-native';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <ImageBackground
        source={require('./assets/Background.png')} // Ganti dengan gambar background Anda
        style={styles.background}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('./assets/Find.png')} // Ganti dengan gambar logo Anda
            style={styles.logo}
          />
        </View>

        {/* Form Login */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginTitle}>Login</Text>

          {/* Input Email */}
          <TextInput
            placeholder="Email"
            placeholderTextColor="#000"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            style={styles.input}
          />

          {/* Input Password */}
          <TextInput
            placeholder="Password"
            placeholderTextColor="#000"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          {/* Tombol Login */}
          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          {/* Forget Password */}
          <TouchableOpacity>
            <Text style={styles.forgetPasswordText}>Forget password?</Text>
          </TouchableOpacity>

          {/* Tombol Create Account */}
          <TouchableOpacity style={styles.createAccountButton}>
            <Text style={styles.createAccountText}>Create account</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    width: 250, // Sesuaikan dengan ukuran logo
    height: 250,
  },
  loginContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    flexDirection: 'column',
    padding: '15%',
    alignItems: 'center',
    borderTopLeftRadius: 100,
    height: '70%',
  },
  loginTitle: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    flex: 1,
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
    flex: 2,
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
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    flex: 3,
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
    textAlign: 'center',
    marginBottom: '60%',
  },
  createAccountButton: {
    width: '100%',
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 4,
    marginBottom: '10%',
  },
  createAccountText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Login;
