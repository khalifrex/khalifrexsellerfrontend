export const useOfferData = (offerData, setOfferData, hasVariants) => {
  
  // Create default offer structure
  const createDefaultOffer = () => ({
    price: '',
    stock: '',
    condition: 'new',
    sellerSku: '',
    useDefaultZones: false,
    selectedShippingZones: [],
    shippingZoneIds: [],
    pickup: {
      available: false,
      address: {},
      instructions: '',
      hours: {}
    }
  });

  // Handle offer input changes
  const handleOfferInputChange = (index, field, value) => {
    const updated = [...offerData];
    if (!updated[index]) {
      updated[index] = createDefaultOffer();
    }
    
    updated[index][field] = value;
    setOfferData(updated);
  };

  // Handle pickup configuration
  const handlePickupChange = (index, field, value) => {
    const updated = [...offerData];
    if (!updated[index]) {
      updated[index] = createDefaultOffer();
    }

    if (!updated[index].pickup) {
      updated[index].pickup = {
        available: false,
        address: {},
        instructions: '',
        hours: {}
      };
    }

    if (field.includes('address.')) {
      const addressField = field.split('.')[1];
      updated[index].pickup.address[addressField] = value;
    } else if (field.includes('hours.')) {
      const [dayField, timeField] = field.split('.').slice(1);
      if (!updated[index].pickup.hours[dayField]) {
        updated[index].pickup.hours[dayField] = { open: '09:00', close: '17:00', available: true };
      }
      updated[index].pickup.hours[dayField][timeField] = value;
    } else {
      updated[index].pickup[field] = value;
    }

    setOfferData(updated);
  };

  // Initialize offers for simple products
  const initializeOffers = () => {
    if (!hasVariants && offerData.length === 0) {
      setOfferData([createDefaultOffer()]);
    }
  };

  return {
    createDefaultOffer,
    handleOfferInputChange,
    handlePickupChange,
    initializeOffers,
  };
};