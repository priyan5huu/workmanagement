import React, { useState } from 'react';
import { Filter, Grid, List, GitBranch } from 'lucide-react';
import Button from '../components/ui/Button';
import KanbanBoard from '../components/tasks/KanbanBoard';
import TaskDelegation from '../components/tasks/TaskDelegation';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { canUserManageRole } from '../utils/rolePermissions';
import { UserRole } from '../types';

const Tasks: React.FC = () => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'delegation'>('kanban');
  const { state } = useAuth();
  const { dispatch } = useApp();
  
  const canDelegate = state.user && canUserManageRole(state.user.role as UserRole, UserRole.EMPLOYEE);

  const handleTaskCreate = (taskData: any) => {
    dispatch({ type: 'ADD_TASK', payload: taskData });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Grid className="h-4 w-4 mr-2 inline" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <List className="h-4 w-4 mr-2 inline" />
              List
            </button>
            {canDelegate && (
              <button
                onClick={() => setViewMode('delegation')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'delegation'
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <GitBranch className="h-4 w-4 mr-2 inline" />
                Delegation
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="secondary" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {viewMode === 'kanban' ? (
          <KanbanBoard onTaskCreate={handleTaskCreate} />
        ) : viewMode === 'delegation' ? (
          <TaskDelegation />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6">
            <p className="text-gray-500 dark:text-gray-400 text-center">List view coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;