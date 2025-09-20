import { Globe, MapPin, Package, DollarSign } from 'lucide-react';

const StatsCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-xs font-medium">{label}</p>
        <p className={`text-xl font-bold ${color}`}>{value}</p>
      </div>
      <Icon className={`h-5 w-5 ${color.replace('text-', 'text-').replace('-600', '-500')}`} />
    </div>
  </div>
);

const StatsGrid = ({ stats, totalzones }) => {
  if (!stats) return null;

  const statsConfig = [
    { label: 'Total Zones', value: totalzones, icon: Globe, color: 'text-gray-900' },
    { label: 'Countries', value: stats.countries, icon: MapPin, color: 'text-emerald-600' },
    { label: 'Free Shipping', value: stats.freeShipping, icon: Package, color: 'text-green-600' },
    { label: 'Avg Cost', value: `$${stats.averageCost?.toFixed(2) || '0.00'}`, icon: DollarSign, color: 'text-purple-600' },
    { label: 'Worldwide', value: stats.hasWorldwide ? 'Yes' : 'No', icon: Globe, color: 'text-indigo-600' },
    { label: 'Total Offers', value: stats.totalOffers || 0, icon: Package, color: 'text-orange-600' }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
      {statsConfig.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default StatsGrid;