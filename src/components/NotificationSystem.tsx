import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertCircle, XCircle, Info, X, ExternalLink } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  link?: {
    label: string;
    url: string;
  };
}

interface NotificationSystemProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onRemove
}) => {
  useEffect(() => {
    notifications.forEach((notification) => {
      if (notification.duration && notification.duration > 0) {
        const timer = setTimeout(() => {
          onRemove(notification.id);
        }, notification.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, onRemove]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 md:w-5 md:h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />;
      case 'info':
        return <Info className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />;
      default:
        return <Info className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'success':
        return 'from-green-500/10 to-emerald-500/10 border-green-500/30';
      case 'error':
        return 'from-red-500/10 to-pink-500/10 border-red-500/30';
      case 'warning':
        return 'from-yellow-500/10 to-orange-500/10 border-yellow-500/30';
      case 'info':
        return 'from-blue-500/10 to-cyan-500/10 border-blue-500/30';
      default:
        return 'from-blue-500/10 to-cyan-500/10 border-blue-500/30';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm md:max-w-md">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`bg-gradient-to-r ${getColors(notification.type)} backdrop-blur-lg rounded-xl p-3 md:p-4 border shadow-2xl animate-fade-in`}
        >
          <div className="flex items-start gap-2 md:gap-3">
            {getIcon(notification.type)}
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-semibold text-sm mb-1">
                {notification.title}
              </h4>
              <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                {notification.message}
              </p>
              
              {/* Action buttons */}
              {(notification.action || notification.link) && (
                <div className="flex items-center gap-3 mt-3">
                  {notification.action && (
                    <button
                      onClick={notification.action.onClick}
                      className="text-xs font-semibold text-blue-300 hover:text-blue-200 transition-colors bg-blue-500/20 px-2 py-1 rounded"
                    >
                      {notification.action.label}
                    </button>
                  )}
                  {notification.link && (
                    <a
                      href={notification.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-semibold text-blue-300 hover:text-blue-200 transition-colors bg-blue-500/20 px-2 py-1 rounded"
                    >
                      {notification.link.label}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => onRemove(notification.id)}
              className="text-slate-400 hover:text-white transition-colors flex-shrink-0 p-1"
            >
              <X className="w-3 h-3 md:w-4 md:h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { ...notification, id }]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const showSuccess = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    addNotification({
      type: 'success',
      title,
      message,
      duration: 5000,
      ...options
    });
  }, [addNotification]);

  const showError = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    addNotification({
      type: 'error',
      title,
      message,
      duration: 8000,
      ...options
    });
  }, [addNotification]);

  const showWarning = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    addNotification({
      type: 'warning',
      title,
      message,
      duration: 6000,
      ...options
    });
  }, [addNotification]);

  const showInfo = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    addNotification({
      type: 'info',
      title,
      message,
      duration: 5000,
      ...options
    });
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};