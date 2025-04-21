import React, { createContext, useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Api from '../libs/Api';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState({});

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('token');
                if (storedToken) {
                    setToken(storedToken);
                    const response = await Api.get('/user', {
                        headers: { Authorization: `Bearer ${storedToken}` },
                    });
                    setUser(response.data).then(u => console.log('User sekarang adalah:', u));
                    AsyncStorage.getItem('token').then(t => console.log('Token dari storage:', t));
                }
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);
    

    const logs = async (email, password) => {
        setError({});
        try {
            const response = await Api.post('/login', {
                email,
                password,
                device_name: `${Platform.OS} ${Platform.Version}`,
            });
            const { token, user } = response.data;
            await AsyncStorage.setItem('token', token);
            setToken(token);
            setUser(user);
        } catch (e) {
            if (e.response.status === 422) {
                setError(e.response.data.errors);
            }
        }
    };

    const register = async (name, email, password, nomor_telepon, navigation) => {
        setError({});
        try {
            const response = await Api.post('/register', {
                name,
                email,
                password,
                nomor_telepon,
                device_name: `${Platform.OS} ${Platform.Version}`,
            });
            navigation.replace('Login');
        } catch (e) {
            if (e.response.status === 422) {
                setError(e.response.data.errors);
            }
        }
    };

    const logout = async (navigation) => {
        try {
            await Api.post('/logout', {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            await AsyncStorage.removeItem('token');
            setToken(null);
            setUser(null);
            navigation.replace('Login');
        } catch (error) {
            console.log('Logout error:', error);
        }
    };

    const getUserById = async (id, token, setUser, setError, setLoading) => {
        setError({});
        setLoading(true);
        try {
            const response = await Api.get(`/tampilkan/${id}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              setUser(response.data);
        } catch (e) {
            if (e.response && e.response.status === 404) {
                setError({ notFound: 'User not found.' });
            } else if (e.response && e.response.status === 401) {
                setError({ auth: 'Unauthorized access. Please login again.' });
            } else if (e.response && e.response.data && e.response.data.errors) {
                setError(e.response.data.errors);
            } else {
                setError({ general: 'Something went wrong. Please try again later.' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            logs,
            logout,
            register,
            error,
            loading,
            getUserById
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

// ✅ Komponen UserDetail tetap di file ini, tapi DI LUAR fungsi AuthProvider
export const UserDetail = ({ route }) => {
    const [detailUser, setDetailUser] = useState(null);
    const [error, setError] = useState({});
    const [loading, setLoading] = useState(false);
    const { getUserById } = useAuth();
    const userId = route?.params?.id || 2;

    useEffect(() => {
        const fetch = async () => {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                getUserById(userId, setDetailUser, setError, setLoading);
            } else {
                setError({ auth: 'No token found. Please login first.' });
            }
        };
        fetch();
    }, []);

    if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

    if (Object.keys(error).length > 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{Object.values(error).join('\n')}</Text>
            </View>
        );
    }

    if (!detailUser) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Nama:</Text>
            <Text style={styles.value}>{detailUser.name}</Text>

            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{detailUser.email}</Text>

            <Text style={styles.label}>Nomor Telepon:</Text>
            <Text style={styles.value}>{detailUser.nomor_telepon}</Text>

            <Text style={styles.label}>Lokasi :</Text>
            <Text style={styles.value}>{detailUser.lokasi}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { 
        padding: 20, 
        flex: 1, 
        backgroundColor: '#fff' 
    },
    label: { 
        fontWeight: 'bold', 
        marginTop: 10, 
        fontSize: 16 
    },
    value: { 
        fontSize: 16, 
        marginBottom: 5 
    },
    errorText: { 
        color: 'red', 
        textAlign: 'center' 
    }
});
