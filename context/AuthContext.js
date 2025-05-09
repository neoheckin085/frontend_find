import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import Api from '../libs/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState({});

    useEffect(() => {
        const bootstrapAsync = async () => {
            let userToken;
            try {
                userToken = await AsyncStorage.getItem('token');
                if (userToken) {
                    setToken(userToken);
                    try {
                        const response = await Api.get('/user', {
                            headers: { Authorization: `Bearer ${userToken}` },
                        });

                        if (response.data && response.data.user) {
                            setUser(response.data.user);
                        } else if (response.data) {
                            setUser(response.data);
                        } else {
                            console.warn("User data from API is not in expected format.");
                            await AsyncStorage.removeItem('token');
                            setToken(null);
                            setUser(null);
                        }
                        console.log('User from storage/API:', response.data.user || response.data);
                    } catch (e) {
                        console.error("Failed to fetch user with stored token:", e);
                        await AsyncStorage.removeItem('token');
                        setToken(null);
                        setUser(null);
                    }
                }
            } catch (e) {
                console.error("Error retrieving token from storage:", e);
            } finally {
                setLoading(false);
            }
        };

        bootstrapAsync();
    }, []);

    const logs = async (email, password) => {
        setError({});
        try {
            console.log('Attempting login with:', { email, device_name: `${Platform.OS} ${Platform.Version}` });
            const response = await Api.post('/login', {
                email,
                password,
                device_name: `${Platform.OS} ${Platform.Version}`,
            });

            console.log('Login response:', response.data);

            if (response.data?.token && response.data?.user) {
                await AsyncStorage.setItem('token', response.data.token);
                setToken(response.data.token);
                setUser(response.data.user);
                return true;
            } else {
                console.error("Invalid response structure:", response.data);
                setError({ general: 'Invalid server response structure' });
                return false;
            }
        } catch (e) {
            console.error('Login error:', {
                status: e.response?.status,
                data: e.response?.data,
                message: e.message
            });

            if (e.response?.status === 422 && e.response?.data?.errors) {
                setError(e.response.data.errors);
            } else if (e.response?.data?.message) {
                setError({ general: e.response.data.message });
            } else if (!e.response) {
                setError({ general: 'Network error. Please check your connection.' });
            } else {
                setError({ general: 'Login failed. Invalid credentials.' });
            }
            return false;
        }
    };

    const register = async (username, email, password, nomor_telepon, navigation) => {
        setError({});
        try {
            await Api.post('/register', {
                username,
                email,
                password,
                nomor_telepon,
                device_name: `${Platform.OS} ${Platform.Version}`,
            });
            navigation.replace('Login');
            return true;
        } catch (e) {
            if (e.response && e.response.status === 422 && e.response.data && e.response.data.errors) {
                setError(e.response.data.errors);
            } else if (e.response && e.response.data && e.response.data.message) {
                setError({ general: e.response.data.message });
            } else {
                setError({ general: 'Registration failed. Please try again.' });
            }
            return false;
        }
    };

    // const post = async (title, description, image, community_id, user_id) => {
    //     setError({});

    const logout = async (navigation) => {
        setError({});
        try {
            const storedToken = await AsyncStorage.getItem('token');
            if (storedToken) {
                await Api.post('/logout', {}, {
                    headers: { Authorization: `Bearer ${storedToken}` },
                });
            }
        } catch (error) {
            console.log('API Logout error (will proceed with local logout):', error.response ? error.response.data : error.message);
        } finally {
            await AsyncStorage.removeItem('token');
            setToken(null);
            setUser(null);
            if (navigation) {
                navigation.replace('Login');
            } else {
                console.warn("Logout called without navigation object.");
            }
        }
    };

    const getUserById = async (setDetailUser, setError, setLoading) => {
        try {
            const storedToken = await AsyncStorage.getItem('token');
            if (!storedToken) {
                throw new Error('No token found');
            }
    
            const response = await Api.get('/tampilkan', {
                headers: {
                    Authorization: `Bearer ${storedToken}`,
                },
            });
    
            console.log('User data response:', response.data); 
            setDetailUser(response.data);
        } catch (err) {
            console.error('Error getUserById:', err);
            setError({ message: err.message || 'Failed to fetch user data' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            error,
            logs,
            logout,
            register,
            getUserById, 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
