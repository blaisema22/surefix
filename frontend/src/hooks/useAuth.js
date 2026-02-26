import { useState, useCallback } from 'react';
import { auth, setToken, getToken, clearToken } from '../utils/api';

/**
 * Custom hook for authentication operations
 * Handles login, register, logout, and token management
 */
export function useAuth() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = useCallback(async(email, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await auth.login({ email, password });
            if (response.token) {
                setToken(response.token);
            }
            return response;
        } catch (err) {
            const errorMsg = err.message || 'Login failed. Please try again.';
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async(userData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await auth.register(userData);
            if (response.token) {
                setToken(response.token);
            }
            return response;
        } catch (err) {
            const errorMsg = err.message || 'Registration failed. Please try again.';
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getCurrentUser = useCallback(async() => {
        if (!getToken()) return null;
        try {
            return await auth.me();
        } catch (err) {
            console.error('Failed to login try again or Regist:', err);
            return null;
        }
    }, []);

    const logout = useCallback(() => {
        clearToken();
    }, []);

    return {
        login,
        register,
        getCurrentUser,
        logout,
        loading,
        error,
        hasToken: !!getToken(),
    };
}