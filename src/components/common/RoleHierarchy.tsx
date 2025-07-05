import React from 'react';
import { UserRole } from '../../types';
import { Users, UserCheck, User, Crown, Shield } from 'lucide-react';

interface RoleHierarchyProps {
  className?: string;
}

const RoleHierarchy: React.FC<RoleHierarchyProps> = ({ className = '' }) => {
  const roleHierarchy = [
    {
      role: UserRole.DEPARTMENT_HEAD,
      title: 'Department Head',
      email: 'dept.head@company.com',
      description: 'Oversees entire department, manages multiple managers',
      icon: Crown,
      level: 1,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      borderColor: 'border-purple-300 dark:border-purple-600'
    },
    {
      role: UserRole.MANAGER,
      title: 'Manager',
      email: 'manager@company.com',
      description: 'Manages teams and assistant managers',
      icon: Shield,
      level: 2,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      borderColor: 'border-blue-300 dark:border-blue-600'
    },
    {
      role: UserRole.ASSISTANT_MANAGER,
      title: 'Assistant Manager',
      email: 'assistant.manager@company.com',
      description: 'Assists manager, supervises team leads',
      icon: UserCheck,
      level: 3,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      borderColor: 'border-green-300 dark:border-green-600'
    },
    {
      role: UserRole.TEAM_LEAD,
      title: 'Team Lead',
      email: 'team.lead@company.com',
      description: 'Leads specific team, guides employees',
      icon: Users,
      level: 4,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      borderColor: 'border-orange-300 dark:border-orange-600'
    },
    {
      role: UserRole.EMPLOYEE,
      title: 'Employee',
      email: 'employee@company.com',
      description: 'Individual contributor, executes tasks',
      icon: User,
      level: 5,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-900/30',
      borderColor: 'border-gray-300 dark:border-gray-600'
    }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Organizational Hierarchy
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          5 Demo Account Types with Clear Role Hierarchy
        </p>
      </div>
      
      <div className="space-y-3">
        {roleHierarchy.map((role) => {
          const IconComponent = role.icon;
          return (
            <div
              key={role.role}
              className={`p-4 rounded-lg border-2 ${role.bgColor} ${role.borderColor} transition-all duration-200 hover:shadow-md`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${role.bgColor}`}>
                  <IconComponent className={`h-5 w-5 ${role.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {role.level}.
                    </span>
                    <h4 className={`font-semibold ${role.color}`}>
                      {role.title}
                    </h4>
                  </div>
                  <p className="text-sm font-mono text-gray-700 dark:text-gray-300 mb-1">
                    {role.email}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {role.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-xs text-yellow-800 dark:text-yellow-200 text-center">
          <span className="font-medium">Password for all accounts:</span> <span className="font-mono">password</span>
        </p>
      </div>
    </div>
  );
};

export default RoleHierarchy;
