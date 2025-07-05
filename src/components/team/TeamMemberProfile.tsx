import React, { useState } from 'react';
import { X, Mail, Phone, Calendar, MapPin, Award, Video, MessageCircle, Users, Briefcase } from 'lucide-react';
import { User, UserRole } from '../../types';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

interface TeamMemberProfileProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onStartVideoCall?: (userId: string) => void;
  onSendMessage?: (userId: string) => void;
}

const TeamMemberProfile: React.FC<TeamMemberProfileProps> = ({
  isOpen,
  onClose,
  user,
  onStartVideoCall,
  onSendMessage
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'performance'>('overview');

  if (!isOpen || !user) return null;

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.DEPARTMENT_HEAD:
        return 'danger';
      case UserRole.MANAGER:
        return 'warning';
      case UserRole.ASSISTANT_MANAGER:
        return 'primary';
      case UserRole.TEAM_LEAD:
        return 'success';
      case UserRole.EMPLOYEE:
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const formatRoleName = (role: UserRole) => {
    return role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-4">
            <Avatar
              src={user.avatar}
              alt={user.name}
              name={user.name}
              size="lg"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={getRoleBadgeColor(user.role)}>
                  <Briefcase className="h-3 w-3 mr-1" />
                  {formatRoleName(user.role)}
                </Badge>
                <span className="text-gray-500 dark:text-gray-400">•</span>
                <span className="text-gray-600 dark:text-gray-300">{user.department}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onSendMessage?.(user.id)}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button
              size="sm"
              onClick={() => onStartVideoCall?.(user.id)}
            >
              <Video className="h-4 w-4 mr-2" />
              Video Call
            </Button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-600">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tasks'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Tasks & Projects
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'performance'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Performance
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Phone</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Join Date</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {user.createdAt.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Location</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">San Francisco, CA</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Structure */}
              {(user.manager || user.directReports.length > 0) && (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Team Structure</h3>
                  <div className="space-y-4">
                    {user.manager && (
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Reports to</p>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">Manager ID: {user.manager}</span>
                        </div>
                      </div>
                    )}
                    {user.directReports.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Direct Reports</p>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {user.directReports.length} team member(s)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Skills & Achievements */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Skills & Achievements</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {['React', 'TypeScript', 'Node.js', 'Python', 'Project Management'].map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Employee of the Month - January 2024</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Tasks and projects view coming soon...</p>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Performance metrics coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamMemberProfile;
