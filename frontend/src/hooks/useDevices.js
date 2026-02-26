import { useState, useCallback } from 'react';
import { devices } from '../utils/api';

/**
 * Custom hook for device-related API calls
 */
export function useDevices() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const list = useCallback(async() => {
        setLoading(true);
        setError(null);
        try {
            const response = await devices.list();
            const deviceList = response.data || response;
            setData(deviceList);
            return deviceList;
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
            const response = await devices.get(id);
            return response.data || response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const create = useCallback(async(deviceData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await devices.create(deviceData);
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const update = useCallback(async(id, deviceData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await devices.update(id, deviceData);
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteDevice = useCallback(async(id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await devices.delete(id);
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
        update,
        deleteDevice,
    };
}