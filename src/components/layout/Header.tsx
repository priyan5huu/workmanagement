import React, { useState, useEffect } from 'react';
import { Search, Bell, Plus } from 'lucide-react';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import ThemeToggle from '../common/ThemeToggle';
import NotificationDropdown from '../common/NotificationDropdown';
import TaskCreationModal from '../tasks/TaskCreationModal';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import notificationService from '../../services/notification';
import { NotificationStatus, Project, Task } from '../../types';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  onTaskCreate?: (taskData: Task) => void;
  currentProject?: Project | null;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, actions, onTaskCreate, currentProject }) => {
  const { state } = useAuth();
  const { state: appState } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Use current project from props or from app context
  const selectedProject = currentProject || appState.selectedProject;

  useEffect(() => {
    if (state.user) {
      loadUnreadCount();
    }
  }, [state.user]);

  const loadUnreadCount = async () => {
    if (!state.user) return;
    
    try {
      const notifications = await notificationService.getUserNotifications(
        state.user.id, 
        NotificationStatus.UNREAD
      );
      setUnreadCount(notifications.length);
    } catch (error) {
      console.warn('Failed to load unread count:', error);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-300 mt-1">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search..."
              className="w-80 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {actions}

          <ThemeToggle />

          <Button size="sm" onClick={() => setShowTaskModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>

          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <NotificationDropdown 
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
            />
          </div>

          <Avatar
            src={state.user?.avatar}
            alt={state.user?.name || 'User'}
            name={state.user?.name}
          />
        </div>
      </div>

      <TaskCreationModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onTaskCreate={(taskData) => {
          if (onTaskCreate) {
            onTaskCreate(taskData);
          }
        }}
        preselectedProject={selectedProject}
      />
    </header>
  );
};

export default Header;