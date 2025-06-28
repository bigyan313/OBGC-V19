import React, { useEffect, useState } from 'react';
import { CheckCircle, X, ExternalLink, Volume2, VolumeX } from 'lucide-react';
import { setSoundEnabled, isSoundEnabled } from '../utils/sounds';

interface ElegantPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  link?: {
    label: string;
    url: string;
  };
  autoClose?: boolean;
  duration?: number;
}

export const ElegantPopup: React.FC<ElegantPopupProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'success',
  link,
  autoClose = true,
  duration = 8000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [soundEnabled, setSoundEnabledState] = useState(isSoundEnabled());

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, autoClose, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    setSoundEnabledState(newState);
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          gradient: 'from-green-500/20 to-emerald-500/20',
          border: 'border-green-500/30',
          icon: <CheckCircle className="w-6 h-6 text-green-400" />,
          titleColor: 'text-green-400'
        };
      case 'info':
        return {
          gradient: 'from-blue-500/20 to-cyan-500/20',
          border: 'border-blue-500/30',
          icon: <CheckCircle className="w-6 h-6 text-blue-400" />,
          titleColor: 'text-blue-400'
        };
      case 'warning':
        return {
          gradient: 'from-yellow-500/20 to-orange-500/20',
          border: 'border-yellow-500/30',
          icon: <CheckCircle className="w-6 h-6 text-yellow-400" />,
          titleColor: 'text-yellow-400'
        };
      case 'error':
        return {
          gradient: 'from-red-500/20 to-pink-500/20',
          border: 'border-red-500/30',
          icon: <CheckCircle className="w-6 h-6 text-red-400" />,
          titleColor: 'text-red-400'
        };
      default:
        return {
          gradient: 'from-green-500/20 to-emerald-500/20',
          border: 'border-green-500/30',
          icon: <CheckCircle className="w-6 h-6 text-green-400" />,
          titleColor: 'text-green-400'
        };
    }
  };

  if (!isOpen) return null;

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Popup */}
      <div 
        className={`relative bg-gradient-to-br ${styles.gradient} backdrop-blur-xl rounded-2xl border ${styles.border} shadow-2xl max-w-md w-full transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            {styles.icon}
            <h3 className={`text-xl font-bold ${styles.titleColor}`}>
              {title}
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Sound toggle */}
            <button
              onClick={toggleSound}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              title={soundEnabled ? 'Disable sounds' : 'Enable sounds'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-white" />
              ) : (
                <VolumeX className="w-4 h-4 text-white" />
              )}
            </button>
            
            {/* Close button */}
            <button
              onClick={handleClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <p className="text-white/90 leading-relaxed mb-4">
            {message}
          </p>
          
          {/* Link */}
          {link && (
            <div className="flex justify-center">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${styles.gradient} border ${styles.border} text-white font-medium hover:scale-105 transition-transform`}
              >
                {link.label}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Progress bar for auto-close */}
        {autoClose && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-b-2xl overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${styles.gradient} transition-all ease-linear`}
              style={{
                width: '100%',
                animation: `shrink ${duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};