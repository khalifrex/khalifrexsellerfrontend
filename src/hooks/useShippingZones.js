import { useState } from 'react';

export const useShippingZones = () => {
  const [shippingZones, setShippingZones] = useState([]);
  const [isLoadingZones, setIsLoadingZones] = useState(false);
  const [selectedZones, setSelectedZones] = useState(new Set());

  const apiURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3092';

  // Fetch seller's shipping zones
  const fetchShippingZones = async () => {
    setIsLoadingZones(true);
    try {
      const response = await fetch(`${apiURL}/seller/zones`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setShippingZones(data.zones?.all || []);
      } else {
        console.error('Failed to fetch shipping zones');
        setShippingZones([]);
      }
    } catch (error) {
      console.error('Error fetching shipping zones:', error);
      setShippingZones([]);
    } finally {
      setIsLoadingZones(false);
    }
  };

  // Handle individual zone selection
  const handleZoneSelection = (zoneId, isSelected) => {
    const newSelected = new Set(selectedZones);
    if (isSelected) {
      newSelected.add(zoneId);
    } else {
      newSelected.delete(zoneId);
    }
    setSelectedZones(newSelected);
  };

  // Select all zones
  const handleSelectAllZones = () => {
    const allZoneIds = shippingZones.map(zone => zone._id);
    setSelectedZones(new Set(allZoneIds));
  };

  // Clear all zone selections
  const handleClearAllZones = () => {
    setSelectedZones(new Set());
  };

  // Apply selected zones to offer (for Step 3 single products)
  const applyZonesToOffer = (offerIndex, offerData, setOfferData, shippingZones, selectedZones, setSelectedZones, setShowZoneSelector, setCurrentOfferIndex, createDefaultOffer) => {
    const updated = [...offerData];
    if (!updated[offerIndex]) {
      updated[offerIndex] = createDefaultOffer();
    }

    // Get selected zone objects
    const selectedZoneObjects = shippingZones.filter(zone =>
      selectedZones.has(zone._id)
    );

    updated[offerIndex].useDefaultZones = selectedZones.size === shippingZones.length;
    updated[offerIndex].selectedShippingZones = selectedZoneObjects;
    updated[offerIndex].shippingZoneIds = Array.from(selectedZones);

    setOfferData(updated);
    setShowZoneSelector(false);
    setCurrentOfferIndex(null);
    setSelectedZones(new Set());
  };

  // Apply selected zones to variant (for Step 2 variants)
  const applyZonesToVariant = (variantIndex, combinationData, setCombinationData, shippingZones, selectedZones, setSelectedZones, setShowZoneSelector, setCurrentVariantIndex) => {
    const comboKeys = Object.keys(combinationData);
    const comboKey = comboKeys[variantIndex];
    
    if (!comboKey) return;

    const selectedZoneObjects = shippingZones.filter(zone =>
      selectedZones.has(zone._id)
    );

    setCombinationData(prev => ({
      ...prev,
      [comboKey]: {
        ...prev[comboKey],
        useDefaultZones: selectedZones.size === shippingZones.length,
        selectedShippingZones: selectedZoneObjects,
        shippingZoneIds: Array.from(selectedZones),
      }
    }));

    setShowZoneSelector(false);
    setCurrentVariantIndex(null);
    setSelectedZones(new Set());
  };

  return {
    shippingZones,
    isLoadingZones,
    selectedZones,
    setSelectedZones,
    fetchShippingZones,
    handleZoneSelection,
    handleSelectAllZones,
    handleClearAllZones,
    applyZonesToOffer,
    applyZonesToVariant,
  };
};