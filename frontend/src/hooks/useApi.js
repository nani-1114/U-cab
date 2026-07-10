import { useState, useCallback } from 'react';
import { getErrorMessage } from '../services/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const execute = useCallback(async (fn) => {
    setLoading(true);
    setError('');
    try {
      const result = await fn();
      return result;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  return { loading, error, success, setSuccess, setError, execute, clearMessages };
};
