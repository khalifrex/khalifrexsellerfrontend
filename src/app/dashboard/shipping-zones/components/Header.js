import { Globe } from 'lucide-react';

const Header = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
          <Globe className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Shipping Zones Management
        </h1>
      </div>
      <p className="text-gray-600">Manage your shipping zones and delivery options</p>
    </div>
  );
};

export default Header;