import { useState, useCallback } from 'react';
import { appointments } from '../utils/api';

/**
 * Custom hook for appointment-related API calls
 */
export function useAppointments() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const list = useCallback(async(filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await appointments.list(filters);
            const appointmentList = response.data || response;
            setData(appointmentList);
            return appointmentList;
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
            const response = await appointments.get(id);
            return response.data || response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const create = useCallback(async(appointmentData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await appointments.create(appointmentData);
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateStatus = useCallback(async(id, statusUpdate) => {
        setLoading(true);
        setError(null);
        try {
            const response = await appointments.updateStatus(id, statusUpdate);
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
        updateStatus,
    };
}