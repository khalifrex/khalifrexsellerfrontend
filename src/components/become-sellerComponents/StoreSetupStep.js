import { Store, Check, X, AlertCircle } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';

export default function StoreSetupStep({ formData, handleInputChange, errors, updateFormData }) {
  const [storeNameStatus, setStoreNameStatus] = useState(''); // 'checking', 'available', 'taken', 'error'
  const [storeNameMessage, setStoreNameMessage] = useState('');

  // Debounced store name check function
  const checkStoreName = useCallback(
    debounce(async (storeName) => {
      if (!storeName || storeName.length < 3) {
        setStoreNameStatus('');
        setStoreNameMessage('');
        return;
      }

      setStoreNameStatus('checking');
      setStoreNameMessage('Checking availability...');

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/check-store-name`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ storeName: storeName.trim() })
        });

        const data = await response.json();

        if (response.ok) {
          if (data.available) {
            setStoreNameStatus('available');
            setStoreNameMessage('Store name is available!');
          } else {
            setStoreNameStatus('taken');
            setStoreNameMessage('This store name is already taken. Please choose another.');
          }
        } else {
          setStoreNameStatus('error');
          setStoreNameMessage(data.message || 'Error checking store name');
        }
      } catch (error) {
        console.error('Store name check error:', error);
        setStoreNameStatus('error');
        setStoreNameMessage('Failed to check store name availability');
      }
    }, 500), // 500ms delay
    []
  );

  // Effect to check store name when it changes
  useEffect(() => {
    if (formData.storeName) {
      checkStoreName(formData.storeName);
    } else {
      setStoreNameStatus('');
      setStoreNameMessage('');
    }
  }, [formData.storeName, checkStoreName]);

  const getStoreNameBorderColor = () => {
    if (errors.storeName) return '#f87171';
    if (storeNameStatus === 'available') return '#10b981';
    if (storeNameStatus === 'taken') return '#f87171';
    return '#d1d5db';
  };

  const getStoreNameIcon = () => {
    switch (storeNameStatus) {
      case 'checking':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>;
      case 'available':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'taken':
      case 'error':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Store Setup</h2>

      {/* Store Name Input */}
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
            className="w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-colors"
            style={{ 
              borderColor: getStoreNameBorderColor(),
              '--tw-ring-color': storeNameStatus === 'available' ? '#10b981' : '#0C7FD2'
            }}
            placeholder="My Awesome Store"
            onFocus={(e) => e.target.style.borderColor = getStoreNameBorderColor()}
            onBlur={(e) => e.target.style.borderColor = getStoreNameBorderColor()}
          />
          <div className="absolute right-3 top-3">
            {getStoreNameIcon()}
          </div>
        </div>
        
        {/* Status Messages */}
        {storeNameMessage && (
          <p className={`text-xs mt-1 ${
            storeNameStatus === 'available' ? 'text-green-600' :
            storeNameStatus === 'taken' || storeNameStatus === 'error' ? 'text-red-500' :
            'text-blue-500'
          }`}>
            {storeNameMessage}
          </p>
        )}
        
        {errors.storeName && <p className="text-red-500 text-xs mt-1">{errors.storeName}</p>}
      </div>

      {/* Subscription Plans */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Choose Your Plan
        </label>
        <div className="space-y-4">
          {/* Free Plan */}
          <div className={`border rounded-lg p-4 cursor-pointer transition-all ${
            formData.subscriptionType === 'free' ? 'bg-green-50 border-green-300 shadow-md' : 'bg-gray-50 border-gray-200 hover:border-gray-300'
          }`} onClick={() => updateFormData('subscriptionType', 'free')}>
            <label className="flex items-start cursor-pointer">
              <input
                type="radio"
                name="subscriptionType"
                value="free"
                checked={formData.subscriptionType === 'free'}
                onChange={handleInputChange}
                className="mt-1 mr-3"
                style={{ accentColor: '#10b981' }}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-green-800 text-lg">Free Plan</div>
                  <div className="text-green-700 font-bold">$0/month</div>
                </div>
                <div className="text-sm text-green-600 mb-2">Perfect to get started</div>
                <div className="text-xs text-green-600 space-y-1">
                  <div className="flex items-center">
                    <Check className="w-3 h-3 mr-2" />
                    <span>List up to 20 products</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-3 h-3 mr-2" />
                    <span>Transaction fee: 10% per sale</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-3 h-3 mr-2" />
                    <span>Basic analytics</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-3 h-3 mr-2" />
                    <span>Email support</span>
                  </div>
                </div>
              </div>
            </label>
          </div>

          {/* Professional Plan */}
          <div className={`border rounded-lg p-4 cursor-pointer transition-all ${
            formData.subscriptionType === 'professional' ? 'bg-blue-50 border-blue-300 shadow-md' : 'bg-gray-50 border-gray-200 hover:border-gray-300'
          }`} onClick={() => updateFormData('subscriptionType', 'professional')}>
            <label className="flex items-start cursor-pointer">
              <input
                type="radio"
                name="subscriptionType"
                value="professional"
                checked={formData.subscriptionType === 'professional'}
                onChange={handleInputChange}
                className="mt-1 mr-3"
                style={{ accentColor: '#0C7FD2' }}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-blue-800 text-lg flex items-center">
                    Professional Plan
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">POPULAR</span>
                  </div>
                  <div className="text-blue-800 font-bold">$25/month</div>
                </div>
                <div className="text-sm text-blue-600 mb-2">For serious sellers</div>
                <div className="text-xs text-blue-600 space-y-1">
                  <div className="flex items-center">
                    <Check className="w-3 h-3 mr-2" />
                    <span>Unlimited products listing</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-3 h-3 mr-2" />
                    <span>Low transaction fee: 5% per sale</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-3 h-3 mr-2" />
                    <span>Advanced analytics</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-3 h-3 mr-2" />
                    <span>Priority support</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-3 h-3 mr-2" />
                    <span>Upcoming AI smart analytics</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-3 h-3 mr-2" />
                    <span>Verified badge. Coming Soon</span>
                  </div>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Plan Comparison Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
          <div className="flex items-start">
            <AlertCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
            <div className="text-xs text-blue-700">
              <p className="font-medium">💡 Pro Tip:</p>
              <p>Professional sellers typically earn 3x more due to lower fees and verified badge credibility. You can upgrade anytime!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}