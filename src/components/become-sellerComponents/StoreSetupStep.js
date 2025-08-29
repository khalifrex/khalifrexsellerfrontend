import { Store } from 'lucide-react';

export default function StoreSetupStep({ formData, handleInputChange, errors }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Store Setup</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Store Name *
        </label>
        <div className="relative">
          <Store className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            name="storeName"
            value={formData.storeName}
            onChange={handleInputChange}
            className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
              errors.storeName ? 'border-red-300' : 'border-gray-300'
            }`}
            style={{ '--tw-ring-color': '#0C7FD2' }}
            onFocus={(e) => e.target.style.borderColor = '#0C7FD2'}
            onBlur={(e) => e.target.style.borderColor = errors.storeName ? '#f87171' : '#d1d5db'}
            placeholder="My Awesome Store"
          />
        </div>
        {errors.storeName && <p className="text-red-500 text-xs mt-1">{errors.storeName}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subscription Plan
        </label>
        <div className="space-y-3">
          <div className="border rounded-lg p-4 bg-green-50 border-green-200">
            <label className="flex items-start">
              <input
                type="radio"
                name="subscriptionType"
                value="free"
                checked={formData.subscriptionType === 'free'}
                onChange={handleInputChange}
                className="mt-1 mr-3"
                style={{ accentColor: '#10b981' }}
              />
              <div>
                <div className="font-medium text-green-800">Free Plan</div>
                <div className="text-sm text-green-600">Perfect to get started</div>
                <div className="text-xs text-green-500 mt-1">
                  • List up to 10 products<br />
                  • Basic analytics<br />
                  • Email support
                </div>
              </div>
            </label>
          </div>
          
          <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
            <label className="flex items-start">
              <input
                type="radio"
                name="subscriptionType"
                value="professional"
                checked={formData.subscriptionType === 'professional'}
                onChange={handleInputChange}
                className="mt-1 mr-3"
                style={{ accentColor: '#0C7FD2' }}
              />
              <div>
                <div className="font-medium" style={{ color: '#0C7FD2' }}>Professional Plan</div>
                <div className="text-sm" style={{ color: '#0C7FD2', opacity: 0.8 }}>For serious sellers</div>
                <div className="text-xs mt-1" style={{ color: '#0C7FD2', opacity: 0.7 }}>
                  • Unlimited products<br />
                  • Advanced analytics<br />
                  • Priority support<br />
                  • Custom branding
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}