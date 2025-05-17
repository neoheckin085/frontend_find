// D:\find\frontend_find\context\AuthContext.js

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

                        if (response.data && response.data.user_id) {
                            setUser(response.data);
                            await AsyncStorage.setItem('userId', response.data.user_id.toString());
                        } else {
                            console.warn("User data from API is not in expected format:", response.data);
                            await AsyncStorage.removeItem('token');
                            await AsyncStorage.removeItem('userId');
                            setToken(null);
                            setUser(null);
                        }
                        console.log('User from API:', response.data);
                    } catch (e) {
                        console.error("Failed to fetch user with stored token:", e);
                        await AsyncStorage.removeItem('token');
                        await AsyncStorage.removeItem('userId');
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
                // Store user_id for chat functionality
                if (response.data.user.user_id) {
                    await AsyncStorage.setItem('userId', response.data.user.user_id.toString());
                }
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

    const post = async (formData) => {
        setError({});
        try {
            const storedToken = await AsyncStorage.getItem('token');
            if (!storedToken) {
                throw new Error('No token found');
            }

            const response = await Api.post('/post', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${storedToken}`
                }
            });

            return { success: true, data: response.data };
        } catch (e) {
            console.error('Post error:', e.response ? e.response.data : e.message);
            
            if (e.response?.status === 422 && e.response?.data?.errors) {
                setError(e.response.data.errors);
            } else if (e.response?.data?.message) {
                setError({ general: e.response.data.message });
            } else if (!e.response) {
                setError({ general: 'Network error. Please check your connection.' });
            } else {
                setError({ general: 'Failed to create post. Please try again.' });
            }
            
            return { success: false, error: e.response?.data || { message: e.message } };
        }
    };

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
            await AsyncStorage.removeItem('userId'); // Remove userId as well
            setToken(null);
            setUser(null);
            if (navigation) {
                navigation.replace('Login');
            } else {
                console.warn("Logout called without navigation object.");
            }
        }
    };    const getUserById = async (setDetailUser, setError, setLoading) => {
        try {
            const storedToken = await AsyncStorage.getItem('token');
            if (!storedToken) {
                throw new Error('No token found');
            }
            
            const storedUserId = await AsyncStorage.getItem('userId');
            if (!storedUserId) {
                throw new Error('No user ID found');
            }
    
            const response = await Api.get(`/tampilkan/${storedUserId}`, {
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

    const updateProfile = async (userData) => {
        try {
            const storedToken = await AsyncStorage.getItem('token');
            if (!storedToken) {
                throw new Error('No token found');
            }

            const formData = new FormData();
            
            // Only append fields that have values
            Object.keys(userData).forEach(key => {
                if (userData[key] !== null && userData[key] !== undefined) {
                    if (key === 'photo' || key === 'background') {
                        if (userData[key] && userData[key].deleted) {
                            // Handle deleted photo case
                            formData.append(`delete_${key}`, 'true');
                            
                            // Handle use_profile_photo flag for background
                            if (key === 'background' && userData[key].use_profile_photo) {
                                formData.append('use_profile_photo', 'true');
                            }
                        } else if (userData[key] && userData[key].uri) {
                            // Get file extension from URI
                            const uriParts = userData[key].uri.split('.');
                            const fileType = uriParts[uriParts.length - 1];
                            
                            formData.append(key, {
                                uri: userData[key].uri,
                                type: userData[key].type || `image/${fileType}` || 'image/jpeg',
                                name: userData[key].fileName || `${key}_${Date.now()}.${fileType || 'jpg'}`
                            });
                        }
                    } else {
                        formData.append(key, userData[key].toString());
                    }
                }
            });

            console.log('Updating profile with data:', Object.fromEntries(formData._parts));

            const response = await Api.post('/update', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${storedToken}`
                }
            });

            if (response.data) {
                setUser(response.data);
                return { success: true, data: response.data };
            } else {
                return { success: false, error: { message: 'No data returned from server' } };
            }
        } catch (err) {
            console.error('Error updating profile:', err.response ? {
                status: err.response.status,
                data: err.response.data
            } : err.message);
            
            // Handle validation errors (422)
            if (err.response && err.response.status === 422) {
                const validationErrors = err.response.data.errors || {};
                const errorMessage = Object.values(validationErrors).flat().join(', ');
                setError({ message: errorMessage || 'Validation failed' });
                return { 
                    success: false, 
                    error: { 
                        message: errorMessage || 'Validation failed',
                        validationErrors: validationErrors 
                    } 
                };
            }
            
            setError({ message: err.response?.data?.message || err.message || 'Failed to update profile' });
            return { success: false, error: { message: err.response?.data?.message || err.message || 'Failed to update profile' } };
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
            post,
            updateProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);