import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const NotificationContext = createContext(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const ToastItem = ({ id, type, message, duration, onRemove }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onRemove(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onRemove]);

  const icons = {
    success: <CheckCircle size={20} className="text-green-500" />,
    error: <AlertCircle size={20} className="text-red-500" />,
    warning: <AlertTriangle size={20} className="text-amber-500" />,
    info: <Info size={20} className="text-blue-500" />
  };

  const styles = {
    success: 'bg-green-500/10 border-green-500/20 text-green-200',
    error: 'bg-red-500/10 border-red-500/20 text-red-200',
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-200',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-200'
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg animate-in slide-in-from-right-full fade-in duration-300 mb-3 min-w-[320px] max-w-md pointer-events-auto ${styles[type] || styles.info}`}>
      <div className="shrink-0 mt-0.5">
        {icons[type] || icons.info}
      </div>
      <div className="flex-1 text-sm font-medium leading-tight pt-0.5">
        {message}
      </div>
      <button 
        onClick={() => onRemove(id)}
        className="shrink-0 text-white/40 hover:text-white transition-colors -mr-1 -mt-1 p-1"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    setNotifications(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end pointer-events-none p-4">
        {notifications.map(n => (
          <ToastItem key={n.id} {...n} onRemove={removeNotification} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};