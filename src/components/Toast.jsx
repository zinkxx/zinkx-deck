import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 2500 }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (elapsed >= duration) {
        clearInterval(interval);
        onClose();
      }
    }, 10);

    return () => clearInterval(interval);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={16} className="toast-icon success" />;
      case 'error':
        return <AlertCircle size={16} className="toast-icon error" />;
      default:
        return <Info size={16} className="toast-icon info" />;
    }
  };

  return (
    <div className={`toast-container toast-${type}`}>
      <div className="toast-content">
        {getIcon()}
        <span className="toast-message selectable">{message}</span>
        <button className="toast-close-btn" onClick={onClose}>
          <X size={14} />
        </button>
      </div>
      <div 
        className="toast-progress-bar" 
        style={{ width: `${progress}%` }} 
      />
    </div>
  );
}
