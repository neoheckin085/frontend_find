import { View, Text,  TextInput,  TouchableOpacity,  Image,  StyleSheet,  ImageBackground } from 'react-native';
import React, {useState, useEffect} from 'react'
import { useAuth } from '../../context/AuthContext';


const CreateAccount = ({ navigation }) => {
  const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [nomor_telepon, setNomor] = useState('');
   const [name, setName] = useState('');
   const [pressed, setPressed] = useState(false);
   const [createPress, setCreatePressed] = useState(false);

    const { register, error } = useAuth();
    
    const handleRegister = () => {
      register(name, email, password, nomor_telepon, navigation);
      navigation.navigate('Login');
    };
  
    useEffect(() => {
      if (createPress) {
        navigation.replace('Login');
      }
    }, [pressed, createPress, navigation]);
  
  return (
    <View style={styles.container}>
          {/* Background Image */}
          <ImageBackground
            source={require('../assets/Hitam.png')} 
            style={styles.background}
          >
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/Find.png')} 
                style={styles.logo}
              />
            </View>
    
            {/* Form Login */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginTitle}>Register</Text>
    
              {/* Input Email */}
              <TextInput
                placeholder="Email"
                placeholderTextColor="#000"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                style={styles.input}
              />

              <TextInput
                placeholder="Username"
                placeholderTextColor="#000"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />
              
              <TextInput
                placeholder="Nomor Telepon"
                placeholderTextColor="#000"
                value={nomor_telepon}
                onChangeText={setNomor}
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
    
              <TouchableOpacity style={styles.loginButton} 
              onPress={handleRegister}>
                <Text style={styles.loginButtonText}>Register</Text>
              </TouchableOpacity>
    

              <TouchableOpacity style={styles.createAccountButton} onPress={() => setCreatePressed(true)}>
                <Text style={styles.createAccountText}>Already have an account?</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>
  )
}

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
    height: 'auto',
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
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.2,
    shadowRadius: 4, 
    elevation: 4, 
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#000',
    padding: 15,
    height: 'auto',
    borderRadius: 8,
    alignItems: 'center',
    flex: 0,
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
    flex: 0,
    height: 'auto',
    marginTop: '10%',
    alignContent: 'center',
  },
  createAccountText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateAccount;