import React, { useState } from 'react';
import { UserPlus, Users, Settings2 } from 'lucide-react';
import Button from '../components/ui/Button';
import TeamGrid from '../components/team/TeamGrid';
import UserCreationForm from '../components/admin/UserCreationForm';
import { useAuth } from '../context/AuthContext';
import { canUserManageRole } from '../utils/rolePermissions';
import { UserRole } from '../types';

const Team: React.FC = () => {
  const [viewMode, setViewMode] = useState<'team' | 'manage'>('team');
  const { state } = useAuth();
  
  const canManageUsers = state.user && canUserManageRole(state.user.role as UserRole, UserRole.EMPLOYEE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your team members and their roles</p>
          </div>
          {canManageUsers && (
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('team')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'team'
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Users className="h-4 w-4 mr-2 inline" />
                Team
              </button>
              <button
                onClick={() => setViewMode('manage')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'manage'
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Settings2 className="h-4 w-4 mr-2 inline" />
                Manage
              </button>
            </div>
          )}
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {viewMode === 'team' ? <TeamGrid /> : <UserCreationForm />}
    </div>
  );
};

export default Team;