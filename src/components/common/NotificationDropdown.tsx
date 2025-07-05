import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Clock, AlertCircle, Video, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import notificationService from '../../services/notification';
import { Notification, NotificationStatus } from '../../types';
import { showToast } from './Toast';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const { state } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && state.user) {
      loadNotifications();
    }
  }, [isOpen, state.user]);

  const loadNotifications = async () => {
    if (!state.user) return;
    
    setLoading(true);
    try {
      const data = await notificationService.getUserNotifications(state.user.id);
      setNotifications(data);
    } catch (error) {
      showToast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, status: NotificationStatus.READ }
            : notification
        )
      );
    } catch (error) {
      showToast.error('Failed to mark as read');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'task_assigned':
      case 'task_completed':
      case 'task_due':
        return <Check className="h-4 w-4" />;
      case 'meeting_scheduled':
      case 'meeting_reminder':
        return <Video className="h-4 w-4" />;
      case 'user_joined':
        return <Users className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'task_assigned':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'task_completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'task_due':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'meeting_scheduled':
      case 'meeting_reminder':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'user_joined':
        return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
    }
  };

  const unreadCount = notifications.filter(n => n.status === NotificationStatus.UNREAD).length;

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-50">
      <div className="p-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {unreadCount > 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Loading...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center">
            <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-600">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                  notification.status === NotificationStatus.UNREAD ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                }`}
                onClick={() => {
                  if (notification.status === NotificationStatus.UNREAD) {
                    handleMarkAsRead(notification.id);
                  }
                }}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${getIconColor(notification.type)}`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                      {notification.status === NotificationStatus.UNREAD && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-600">
          <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
