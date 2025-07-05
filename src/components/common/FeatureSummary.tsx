import React from 'react';
import { Video, User, Trash2, MessageSquare, Filter, Search, Plus, Award } from 'lucide-react';

const FeatureSummary: React.FC = () => {
  const features = [
    {
      icon: Video,
      title: 'Video Conferencing',
      description: 'Integrated video calls with screen sharing, chat, and real-time collaboration',
      color: 'text-blue-600 bg-blue-100'
    },
    {
      icon: User,
      title: 'Team Member Profiles',
      description: 'View detailed team member information, skills, and contact details',
      color: 'text-green-600 bg-green-100'
    },
    {
      icon: Trash2,
      title: 'Task Management',
      description: 'Create, edit, delete, and organize tasks with drag-and-drop functionality',
      color: 'text-red-600 bg-red-100'
    },
    {
      icon: Filter,
      title: 'Advanced Filtering',
      description: 'Filter tasks by priority, search by keywords, and organize by status',
      color: 'text-purple-600 bg-purple-100'
    },
    {
      icon: Plus,
      title: 'Quick Task Creation',
      description: 'Add tasks directly to specific columns with pre-filled project context',
      color: 'text-indigo-600 bg-indigo-100'
    },
    {
      icon: MessageSquare,
      title: 'Real-time Chat',
      description: 'Built-in chat during video conferences with message history',
      color: 'text-orange-600 bg-orange-100'
    },
    {
      icon: Search,
      title: 'Smart Search',
      description: 'Search across task titles, descriptions, and tags for quick discovery',
      color: 'text-teal-600 bg-teal-100'
    },
    {
      icon: Award,
      title: 'Performance Tracking',
      description: 'View team member achievements, skills, and performance metrics',
      color: 'text-yellow-600 bg-yellow-100'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          New Features Implemented
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Enhanced work management system with real-time collaboration and advanced task management
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <div key={index} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center mb-3`}>
                <IconComponent className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
          How to Use the New Features:
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• Click the "New Task" button in the header to create tasks</li>
          <li>• Use the "+" button in each Kanban column for quick task creation</li>
          <li>• Click on team member avatars to view their profiles</li>
          <li>• Use the dropdown menu on task cards to delete tasks or start video calls</li>
          <li>• Filter tasks using the search bar and priority filter</li>
          <li>• Drag and drop tasks between columns to update status</li>
        </ul>
      </div>
    </div>
  );
};

export default FeatureSummary;
