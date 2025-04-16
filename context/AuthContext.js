import React, {createContext, useState, useContext, useEffect} from 'react';
import Api from '../libs/Api';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
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
                        headers: {Authorization: `Bearer ${storedToken}`},
                    });
                    setUser(response.data);
                }
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const logs = async (email, password, navigation) => {
        setError({});
        try {
            const response = await Api.post('/login', {
                email,
                password,
                device_name: `${Platform.OS} ${Platform.Version}`,
            });
            const {token, user} = response.data;
            await AsyncStorage.setItem('token', token);
            setToken(token);
            setUser(user);
            navigation.replace('mainApp');
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
            await Api.post(
                '/logout',
                {},
                {headers: {Authorization: `Bearer ${token}`}},
            );
            await AsyncStorage.removeItem('token');
            setToken(null);
            setUser(null);
            navigation.replace('Login');
        } catch (error) {
            console.log('Logout error:', error);
        }
    };

    return (
        <AuthContext.Provider value={{user, token, logs, logout, register, error, loading}}>

            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);