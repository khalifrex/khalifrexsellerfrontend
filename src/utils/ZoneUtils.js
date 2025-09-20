import { MapPin } from 'lucide-react';
import { ZONE_TYPES } from '@/app/dashboard/shipping-zones/components/ZoneTypes';

export const getZoneTypeIcon = (zoneType) => {
  const zoneTypeConfig = ZONE_TYPES.find(zt => zt.value === zoneType);
  return zoneTypeConfig ? zoneTypeConfig.icon : MapPin;
};

export const getZoneDisplayName = (zone) => {
  switch (zone.zoneType) {
    case 'worldwide': 
      return 'Worldwide';
    case 'country': 
      return zone.country || zone.countryCode;
    case 'state': 
      return `${zone.state}, ${zone.country || zone.countryCode}`;
    case 'city': 
      return `${zone.city}, ${zone.state || ''} ${zone.country || zone.countryCode}`.replace(/,\s,/, ',');
    case 'postcode': 
      return `${zone.postcode}, ${zone.city}, ${zone.country || zone.countryCode}`;
    case 'street': 
      return `${zone.street}, ${zone.city}, ${zone.country || zone.countryCode}`;
    default: 
      return zone.description || 'Unknown Zone';
  }
};