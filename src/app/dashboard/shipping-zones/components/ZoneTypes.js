import { Globe, MapPin } from 'lucide-react';

export const ZONE_TYPES = [
  { value: 'worldwide', label: 'Worldwide', icon: Globe },
  { value: 'country', label: 'Country', icon: MapPin },
  { value: 'state', label: 'State/Region', icon: MapPin },
  { value: 'city', label: 'City', icon: MapPin },
  { value: 'postcode', label: 'Postcode', icon: MapPin },
  { value: 'street', label: 'Street', icon: MapPin }
];