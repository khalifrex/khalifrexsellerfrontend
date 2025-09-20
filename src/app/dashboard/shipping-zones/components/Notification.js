import { Check, AlertTriangle } from 'lucide-react';

const Notification = ({ notification }) => {
  if (!notification) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg backdrop-blur-sm border animate-in slide-in-from-top-2 duration-300 ${
      notification.type === 'success' 
        ? 'bg-emerald-500/90 border-emerald-400 text-white' 
        : 'bg-red-500/90 border-red-400 text-white'
    }`}>
      <div className="flex items-center gap-2">
        {notification.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
        {notification.message}
      </div>
    </div>
  );
};

export default Notification;