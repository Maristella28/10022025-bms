import axios from '../utils/axiosConfig';
import { useEffect, useState, useCallback } from 'react';

// Custom hook to fetch and search residents
export default function useResidents() {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResidents, setFilteredResidents] = useState([]);
  const [searching, setSearching] = useState(false);

  // Fetch all residents
  const fetchResidents = useCallback(async () => {
    try {
      const res = await axios.get('/api/admin/residents');
      setResidents(res.data.residents || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching residents:', err);
      setError(err.response?.data?.message || 'Failed to fetch residents');
      setResidents([]); // Ensure residents is always an array even on error
    } finally {
      setLoading(false);
    }
  }, []);

  // Search residents
  const searchResidents = useCallback(async (searchValue) => {
    if (!searchValue.trim()) {
      setFilteredResidents([]);
      return;
    }

    try {
      setSearching(true);
      const res = await axios.get('/api/admin/residents/search', {
        params: { search: searchValue }
      });
      setFilteredResidents(res.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search residents');
      setFilteredResidents([]);
    } finally {
      setSearching(false);
    }
  }, []);

  // Handle search with debounce
  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
    if (value.trim()) {
      const timeoutId = setTimeout(() => {
        searchResidents(value);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setFilteredResidents([]);
    }
  }, [searchResidents]);

  // Initial fetch of residents
  useEffect(() => {
    fetchResidents();
  }, [fetchResidents]);

  return {
    residents,
    loading,
    error,
    searchTerm,
    filteredResidents,
    searching,
    handleSearch,
    setSearchTerm,
    setFilteredResidents,
    refreshResidents: fetchResidents
  };
}
