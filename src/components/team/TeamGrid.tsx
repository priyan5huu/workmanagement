import React from 'react';
import { Mail, MapPin, Calendar } from 'lucide-react';
import { UserRole } from '../../types';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import { mockUsers } from '../../data/mockData';

const TeamGrid: React.FC = () => {
  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.DEPARTMENT_HEAD:
        return 'primary';
      case UserRole.MANAGER:
        return 'success';
      case UserRole.ASSISTANT_MANAGER:
        return 'warning';
      case UserRole.TEAM_LEAD:
        return 'secondary';
      case UserRole.EMPLOYEE:
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const formatRole = (role: UserRole) => {
    return role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mockUsers.map((user) => (
        <Card key={user.id} className="hover:shadow-lg transition-all duration-200">
          <div className="text-center">
            <Avatar
              src={user.avatar}
              alt={user.name}
              name={user.name}
              size="xl"
            />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">{user.name}</h3>
            <div className="mt-2">
              <Badge variant={getRoleColor(user.role)}>
                {formatRole(user.role)}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-gray-600">{user.department}</p>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{user.department} Department</span>
            </div>
          </div>

          {user.directReports.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Manages {user.directReports.length} team member{user.directReports.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm text-gray-600">
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View Profile
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default TeamGrid;