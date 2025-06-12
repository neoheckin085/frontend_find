import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    ImageBackground,
    KeyboardAvoidingView,
    ActivityIndicator,
    Platform
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const Login = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { logs, error, token, user } = useAuth();
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleLogin = async () => {
        if (isLoggingIn || !email || !password) {
            return;
        }
        setIsLoggingIn(true);
        const loginSuccessful = await logs(email, password);
        setIsLoggingIn(false);
        if (loginSuccessful) {
            console.log("Login successful. Router will handle navigation to MainApp.");
        } else {
            console.log("Login failed. Errors should be displayed from context's 'error' state.");
        }
    };

    useEffect(() => {
    }, [navigation]);


    const displayContextErrors = () => {
        if (error && typeof error === 'object' && Object.keys(error).length > 0) {
            if (error.email || error.password || error.general) {
                 return Object.entries(error).map(([key, value]) => {
                    const messages = Array.isArray(value) ? value.join(', ') : value;
                    return <Text key={key} style={styles.errorText}>{`${key !== 'general' ? key + ': ' : ''}${messages}`}</Text>;
                });
            }
            return <Text style={styles.errorText}>{JSON.stringify(error)}</Text>;
        }
        return null;
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ImageBackground source={require('../assets/Hitam.png')} style={styles.background} resizeMode="cover">
                <View style={styles.logoContainer}>
                    <Image source={require('../assets/Find.png')} style={styles.logo} />
                </View>

                <View style={styles.loginFormContainer}>
                    <Text style={styles.loginTitle}>Login</Text>

                    {displayContextErrors()}

                    <TextInput
                        placeholder="Email atau Username"
                        placeholderTextColor="#555"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="default"
                        autoCapitalize="none"
                        style={styles.input}
                        editable={!isLoggingIn}
                    />

                    <TextInput
                        placeholder="Password"
                        placeholderTextColor="#555"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        style={styles.input}
                        editable={!isLoggingIn}
                    />

                    <TouchableOpacity
                        style={[styles.loginButton, isLoggingIn && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={isLoggingIn}
                    >
                        {isLoggingIn ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.loginButtonText}>Login</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('SearchAccount')} disabled={isLoggingIn}>
                        <Text style={styles.linkText}>Forget password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.createAccountButton, isLoggingIn && styles.buttonDisabled]}
                        onPress={() => navigation.replace('Register')}
                        disabled={isLoggingIn}
                    >
                        <Text style={styles.createAccountText}>Create account</Text>
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 30,
        justifyContent: 'center',
    },
    logo: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
    },
    loginFormContainer: {
        width: '85%',
        maxWidth: 400,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    loginTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 25,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 15,
        backgroundColor: '#fff',
        color: '#333',
        fontSize: 16,
    },
    loginButton: {
        width: '100%',
        backgroundColor: '#000',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    buttonDisabled: {
        backgroundColor: '#aaa',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    linkText: {
        color: '#007AFF',
        fontSize: 14,
        marginTop: 10,
        textAlign: 'center',
    },
    createAccountButton: {
        width: '100%',
        backgroundColor: '#555',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    createAccountText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
        fontSize: 14,
        marginBottom: 10,
        textAlign: 'center',
        width: '100%',
    }
});

export default Login;