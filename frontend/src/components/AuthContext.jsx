import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
    const [user_id, setUserId] = useState(localStorage.getItem('user_id'));

    useEffect(() => {
        const verifyToken = async () => {
            if (token) {
                try {
                    const response = await axios.get('http://localhost:8000/auth/protected', { // Corrected backend URL
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setIsLoggedIn(true);
                } catch (error) {
                    console.error("Token verification failed:", error);
                    logout();
                }
            }
        };
        verifyToken();
    }, [token]);

    const login = (newToken,user_id) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user_id', user_id);
        setUserId(user_id);
        setToken(newToken);
        setIsLoggedIn(true);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        setToken(null);
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, token, user_id, login, logout }}> {/* ✅ Added login & logout */}
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
