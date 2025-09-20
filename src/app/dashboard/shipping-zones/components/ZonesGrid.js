import { Package } from 'lucide-react';
import ZoneCard from './ZoneCard';

const EmptyState = ({ searchTerm, filterActive, filterZoneType, onCreateClick }) => {
  const hasFilters = searchTerm || filterActive !== 'all' || filterZoneType !== 'all';

  return (
    <div className="text-center py-12">
      <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No shipping zones found</h3>
      <p className="text-gray-500 mb-6">
        {hasFilters 
          ? 'Try adjusting your search or filters' 
          : 'Get started by creating your first shipping zone'
        }
      </p>
      {!hasFilters && (
        <button
          onClick={onCreateClick}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          Create Shipping Zone
        </button>
      )}
    </div>
  );
};

const ZonesGrid = ({ 
  zones, 
  onEditZone, 
  onDeleteZone, 
  onCreateClick, 
  searchTerm, 
  filterActive, 
  filterZoneType 
}) => {
  if (zones.length === 0) {
    return (
      <EmptyState
        searchTerm={searchTerm}
        filterActive={filterActive}
        filterZoneType={filterZoneType}
        onCreateClick={onCreateClick}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {zones.map((zone) => (
        <ZoneCard
          key={zone._id}
          zone={zone}
          onEdit={onEditZone}
          onDelete={onDeleteZone}
        />
      ))}
    </div>
  );
};

export default ZonesGrid;