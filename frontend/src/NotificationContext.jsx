import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      timestamp: new Date()
    };

    setNotifications(prev => [notification, ...prev]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification, removeNotification }}>
      {children}
      <NotificationContainer 
        notifications={notifications} 
        removeNotification={removeNotification}
      />
    </NotificationContext.Provider>
  );
};

// Notification container component
const NotificationContainer = ({ notifications, removeNotification }) => {
  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <Notification 
          key={notification.id} 
          notification={notification} 
          onClose={removeNotification}
        />
      ))}
    </div>
  );
};

// Individual notification component
const Notification = ({ notification, onClose }) => {
  const { id, message, type } = notification;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 border-green-600';
      case 'error':
        return 'bg-red-500 border-red-600';
      case 'warning':
        return 'bg-yellow-500 border-yellow-600';
      default:
        return 'bg-blue-500 border-blue-600';
    }
  };

  return (
    <div className={`notification ${getTypeStyles()} text-white p-4 rounded-lg shadow-lg border mb-2 max-w-sm transform transition-all duration-300 ease-in-out`}>
      <div className="flex justify-between items-start">
        <span className="flex-1">{message}</span>
        <button 
          className="ml-2 text-white hover:text-gray-200 transition-colors"
          onClick={() => onClose(id)}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};