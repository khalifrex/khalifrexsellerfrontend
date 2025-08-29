export default function PasswordRequirements({ requirements }) {
  const requirementTexts = {
    length: 'At least 6 characters',
    lowercase: 'One lowercase letter',
    uppercase: 'One uppercase letter', 
    number: 'One number',
    special: 'One special character'
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h4>
      <div className="space-y-1">
        {Object.entries(requirementTexts).map(([key, text]) => (
          <div key={key} className="flex items-center space-x-2">
            <div 
              className={`w-4 h-4 rounded-full flex items-center justify-center ${
                requirements[key] ? 'text-white' : 'bg-gray-300'
              }`}
              style={requirements[key] ? { backgroundColor: '#10b981' } : {}}
            >
              {requirements[key] && (
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className={`text-sm ${
              requirements[key] ? 'text-green-600' : 'text-gray-500'
            }`}>
              {text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}