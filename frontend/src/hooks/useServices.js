import { useState, useCallback } from 'react';
import { services } from '../utils/api';

/**
 * Custom hook for service-related API calls
 */
export function useServices() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const list = useCallback(async(category) => {
        setLoading(true);
        setError(null);
        try {
            const response = await services.list(category);
            const serviceList = response.data || response;
            setData(serviceList);
            return serviceList;
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
            const response = await services.get(id);
            return response.data || response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const create = useCallback(async(serviceData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await services.create(serviceData);
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
        create,
    };
}