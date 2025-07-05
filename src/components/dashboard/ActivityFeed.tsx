import React from 'react';
import { Clock, User, CheckCircle, AlertCircle } from 'lucide-react';
import Avatar from '../ui/Avatar';

interface Activity {
  id: string;
  type: 'task_completed' | 'task_assigned' | 'deadline_approaching' | 'comment_added';
  user: {
    name: string;
    avatar?: string;
  };
  message: string;
  timestamp: Date;
  taskTitle?: string;
}

const ActivityFeed: React.FC = () => {
  const activities: Activity[] = [
    {
      id: '1',
      type: 'task_completed',
      user: { name: 'David Kim', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400' },
      message: 'completed task',
      taskTitle: 'Database Schema Design',
      timestamp: new Date(Date.now() - 15 * 60 * 1000)
    },
    {
      id: '2',
      type: 'task_assigned',
      user: { name: 'Michael Rodriguez', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400' },
      message: 'assigned task to Lisa Thompson',
      taskTitle: 'Mobile Responsive Design',
      timestamp: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      id: '3',
      type: 'deadline_approaching',
      user: { name: 'System' },
      message: 'Deadline approaching for',
      taskTitle: 'Design Dashboard UI',
      timestamp: new Date(Date.now() - 45 * 60 * 1000)
    },
    {
      id: '4',
      type: 'comment_added',
      user: { name: 'Emily Watson', avatar: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=400' },
      message: 'commented on task',
      taskTitle: 'Implement User Authentication',
      timestamp: new Date(Date.now() - 60 * 60 * 1000)
    }
  ];

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'task_completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'task_assigned':
        return <User className="h-4 w-4 text-blue-400" />;
      case 'deadline_approaching':
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      case 'comment_added':
        return <Clock className="h-4 w-4 text-purple-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 60) {
      return `${minutes}m ago`;
    } else {
      return `${hours}h ago`;
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <Avatar
              src={activity.user.avatar}
              alt={activity.user.name}
              name={activity.user.name}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                {getActivityIcon(activity.type)}
                <p className="text-sm text-gray-200">
                  <span className="font-medium">{activity.user.name}</span>
                  {' '}
                  <span>{activity.message}</span>
                  {activity.taskTitle && (
                    <span className="font-medium text-blue-400"> "{activity.taskTitle}"</span>
                  )}
                </p>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {formatTimestamp(activity.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;