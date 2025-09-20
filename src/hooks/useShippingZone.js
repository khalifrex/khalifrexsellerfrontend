import { useState, useCallback } from 'react';

export const useShippingZones = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [zoneStats, setZoneStats] = useState(null);
  const [totalzones, setToatalZones] = useState([]);

  // API configuration
  const API_BASE_URL = 'http://localhost:3092/seller';

  // API helper function
  const apiCall = async (endpoint, options = {}) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || 'API request failed');
    }
    
    return response.json();
  };

  // Load shipping zones from API
  const loadShippingZones = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiCall('/zones');
      if (response.success) {
        setZones(response.zones.all || []);
        setZoneStats(response.coverage || null);
        setToatalZones(response.zones.totalZones)
      } else {
        throw new Error('Failed to load shipping zones');
      }
    } catch (error) {
      console.error('Load zones error:', error);
      setZones([]);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new zone
  const createZone = useCallback(async (formData) => {
    setLoading(true);
    try {
      const response = await apiCall('/shipping/zones', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (response.success) {
        await loadShippingZones();
        return response;
      } else {
        throw new Error(response.error || 'Failed to create shipping zone');
      }
    } catch (error) {
      console.error('Create zone error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadShippingZones]);

  // Update an existing zone
  const updateZone = useCallback(async (zoneId, updateData) => {
    setLoading(true);
    try {
      const response = await apiCall(`/shipping/zones/${zoneId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      if (response.success) {
        await loadShippingZones();
        return response;
      } else {
        throw new Error(response.error || 'Failed to update shipping zone');
      }
    } catch (error) {
      console.error('Update zone error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadShippingZones]);

  // Delete a zone
  const deleteZone = useCallback(async (zoneId) => {
    setLoading(true);
    try {
      const response = await apiCall(`/zones/${zoneId}`, {
        method: 'DELETE',
      });

      if (response.success) {
        await loadShippingZones();
        return response;
      } else {
        throw new Error(response.error || 'Failed to delete shipping zone');
      }
    } catch (error) {
      console.error('Delete zone error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadShippingZones]);

  // Bulk create zones
  const bulkCreateZones = useCallback(async (bulkData) => {
    setLoading(true);
    try {
      const response = await apiCall('/shipping/zones/bulk', {
        method: 'POST',
        body: JSON.stringify(bulkData),
      });

      if (response.success) {
        await loadShippingZones();
        return response.results.summary;
      } else {
        throw new Error(response.error || 'Failed to create shipping zones');
      }
    } catch (error) {
      console.error('Bulk create error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadShippingZones]);

  return {
    zones,
    loading,
    zoneStats,
    totalzones,
    loadShippingZones,
    createZone,
    updateZone,
    deleteZone,
    bulkCreateZones
  };
};