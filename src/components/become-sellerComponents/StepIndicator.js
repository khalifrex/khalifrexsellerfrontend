import { User, Building, Store, CreditCard, FileText, Lock } from 'lucide-react';

const steps = [
  { number: 1, title: 'Personal Info', icon: User },
  { number: 2, title: 'Business Details', icon: Building },
  { number: 3, title: 'Store Setup', icon: Store },
  { number: 4, title: 'Banking Info', icon: CreditCard },
  { number: 5, title: 'Documents', icon: FileText },
  { number: 6, title: 'Security', icon: Lock }
];

export default function StepIndicator({ currentStep }) {
  return (
    <div className="px-8 py-4 bg-gray-50 border-b">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          
          return (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isCompleted ? 'border-green-600 text-white' : isActive ? 'border-white text-white' : 'bg-white border-gray-300 text-gray-400'
                  }`}
                  style={
                    isCompleted 
                      ? { backgroundColor: '#10b981' } 
                      : isActive 
                      ? { backgroundColor: '#0C7FD2', borderColor: '#0C7FD2' } 
                      : {}
                  }
                >
                  {isCompleted ? (
                    <span className="text-sm">✓</span>
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span 
                  className={`text-xs mt-1 text-center max-w-16 ${isActive ? 'font-medium' : 'text-gray-500'}`}
                  style={isActive ? { color: '#0C7FD2' } : {}}
                >
                  {step.title}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div 
                  className={`flex-1 h-0.5 mx-2 mt-5 ${currentStep > step.number ? '' : 'bg-gray-300'}`}
                  style={currentStep > step.number ? { backgroundColor: '#10b981' } : {}}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}