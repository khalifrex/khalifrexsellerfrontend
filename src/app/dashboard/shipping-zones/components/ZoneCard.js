import { Edit3, Trash2, DollarSign, Clock } from 'lucide-react';
import { getZoneTypeIcon, getZoneDisplayName } from '@/utils/ZoneUtils';

const ZoneCard = ({ zone, onEdit, onDelete }) => {
  const ZoneIcon = getZoneTypeIcon(zone.zoneType);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white">
              <ZoneIcon size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 line-clamp-1">
                {getZoneDisplayName(zone)}
              </h3>
              <p className="text-sm text-gray-500 capitalize">{zone.zoneType}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Status Badge */}
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              zone.isActive 
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}>
              {zone.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Usage Stats */}
        {zone.usage && (
          <div className="bg-gray-50 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Offers using this zone</span>
              <span className="font-semibold text-gray-900">{zone.usage.offerCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total stock</span>
              <span className="font-semibold text-gray-900">{zone.usage.totalStock}</span>
            </div>
          </div>
        )}

        {/* Zone Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign size={16} />
              <span>Shipping Cost</span>
            </div>
            <span className="font-semibold text-gray-900">
              ${zone.shippingCost?.toFixed(2) || '0.00'} {zone.currency}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={16} />
              <span>Delivery</span>
            </div>
            <span className="font-semibold text-gray-900">
              {zone.estimatedDeliveryDays?.min || 2}-{zone.estimatedDeliveryDays?.max || 7} days
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(zone)}
            className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-medium hover:bg-blue-100 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Edit3 size={16} />
            Edit
          </button>
          <button
            onClick={() => onDelete(zone._id)}
            className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-xl font-medium hover:bg-red-100 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ZoneCard;