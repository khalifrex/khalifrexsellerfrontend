'use client'
import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

// Component imports
import Notification from './components/Notification';
import Header from './components/Header';
import Controls from './components/Controls';
import StatsGrid from './components/StatsGrid';
import ZonesGrid from './components/ZonesGrid';
import CreateZoneModal from './components/CreateZoneModal';
import EditZoneModal from './components/EditZoneModal';
import BulkCreateModal from './components/BulkCreateModal';
import LoadingOverlay from './components/LoadingOverlay';

// Hooks and utilities
import { useShippingZones } from '@/hooks/useShippingZone';
import { useNotification } from '@/hooks/useNotification';
import { useZoneFilters } from '@/hooks/useFilters';

const ShippingZonesDashboard = () => {
  // Main state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingZone, setEditingZone] = useState(null);

  // Custom hooks
  const { 
    zones, 
    loading, 
    zoneStats, 
    totalzones,
    loadShippingZones, 
    createZone, 
    updateZone, 
    deleteZone, 
    bulkCreateZones 
  } = useShippingZones();
  
  
  const { notification, showNotification } = useNotification();
  const { searchTerm, filterActive, filterZoneType, filteredZones, setSearchTerm, setFilterActive, setFilterZoneType } = useZoneFilters(zones);

  useEffect(() => {
    loadShippingZones();
  }, [loadShippingZones]);

  const handleCreateZone = async (formData) => {
    try {
      await createZone(formData);
      setShowCreateModal(false);
      showNotification('Shipping zone created successfully!');
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const handleUpdateZone = async (formData) => {
    try {
      await updateZone(editingZone._id, formData);
      setShowEditModal(false);
      setEditingZone(null);
      showNotification('Shipping zone updated successfully!');
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const handleDeleteZone = async (zoneId) => {
    if (!window.confirm('Are you sure you want to delete this shipping zone? This will remove it from all your offers.')) return;
    
    try {
      await deleteZone(zoneId);
      showNotification('Shipping zone deleted successfully!');
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const handleBulkCreate = async (bulkData) => {
    try {
      const result = await bulkCreateZones(bulkData);
      setShowBulkModal(false);
      showNotification(`Successfully created ${result.successful} zones. ${result.failed} failed.`);
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const openEditModal = (zone) => {
    setEditingZone(zone);
    setShowEditModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Notification notification={notification} />
      
      <div className="container mx-auto px-4 py-8">
        <Header />
        
        <Controls
          searchTerm={searchTerm}
          filterActive={filterActive}
          filterZoneType={filterZoneType}
          onSearchChange={setSearchTerm}
          onFilterActiveChange={setFilterActive}
          onFilterZoneTypeChange={setFilterZoneType}
          onCreateClick={() => setShowCreateModal(true)}
          onBulkClick={() => setShowBulkModal(true)}
        />

        <StatsGrid stats={zoneStats}
        totalzones={totalzones}
        />

        <ZonesGrid
          zones={filteredZones}
          onEditZone={openEditModal}
          onDeleteZone={handleDeleteZone}
          onCreateClick={() => setShowCreateModal(true)}
          searchTerm={searchTerm}
          filterActive={filterActive}
          filterZoneType={filterZoneType}
        />
      </div>

      {/* Modals */}
      <CreateZoneModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateZone}
        loading={loading}
      />

      <EditZoneModal
        isOpen={showEditModal}
        zone={editingZone}
        onClose={() => {
          setShowEditModal(false);
          setEditingZone(null);
        }}
        onSubmit={handleUpdateZone}
        loading={loading}
      />

      <BulkCreateModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSubmit={handleBulkCreate}
        loading={loading}
      />

      <LoadingOverlay loading={loading} />
    </div>
  );
};

export default ShippingZonesDashboard;