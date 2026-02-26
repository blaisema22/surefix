import { useState, useEffect, useCallback } from 'react';
import { shops } from '../utils/api';

/**
 * Custom hook for shop-related API calls
 */
export function useShops() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const list = useCallback(async(filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await shops.list(filters);
            setData(response.data || response);
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const get = useCallback(async(id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await shops.get(id);
            return response.data || response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getSlots = useCallback(async(id, date) => {
        setLoading(true);
        setError(null);
        try {
            const response = await shops.getSlots(id, date);
            return response.data || response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateProfile = useCallback(async(shopData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await shops.updateProfile(shopData);
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        data,
        loading,
        error,
        list,
        get,
        getSlots,
        updateProfile,
    };
}