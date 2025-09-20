import { useState, useMemo } from 'react';

export const useZoneFilters = (zones) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [filterZoneType, setFilterZoneType] = useState('all');

  const filteredZones = useMemo(() => {
    return zones.filter(zone => {
      const matchesSearch = (zone.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (zone.country || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (zone.countryCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (zone.city || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesActiveFilter = filterActive === 'all' || 
                                 (filterActive === 'active' && zone.isActive) ||
                                 (filterActive === 'inactive' && !zone.isActive);
      
      const matchesZoneTypeFilter = filterZoneType === 'all' || zone.zoneType === filterZoneType;
      
      return matchesSearch && matchesActiveFilter && matchesZoneTypeFilter;
    });
  }, [zones, searchTerm, filterActive, filterZoneType]);

  return {
    searchTerm,
    filterActive,
    filterZoneType,
    filteredZones,
    setSearchTerm,
    setFilterActive,
    setFilterZoneType
  };
};