import { UserRole } from '../types';

export interface RolePermissions {
  role: UserRole;
  capabilities: string[];
  canManage: UserRole[];
  description: string;
}

export const rolePermissions: Record<UserRole, RolePermissions> = {
  [UserRole.DEPARTMENT_HEAD]: {
    role: UserRole.DEPARTMENT_HEAD,
    capabilities: [
      'View all department data',
      'Manage all department users',
      'Create and delete projects',
      'Set department budgets',
      'Approve major decisions',
      'Access executive reports'
    ],
    canManage: [UserRole.MANAGER, UserRole.ASSISTANT_MANAGER, UserRole.TEAM_LEAD, UserRole.EMPLOYEE],
    description: 'Has full access to all department resources and can manage all personnel'
  },
  [UserRole.MANAGER]: {
    role: UserRole.MANAGER,
    capabilities: [
      'Manage assigned teams',
      'Create and assign tasks',
      'View team performance',
      'Approve time off requests',
      'Conduct performance reviews',
      'Manage project budgets'
    ],
    canManage: [UserRole.ASSISTANT_MANAGER, UserRole.TEAM_LEAD, UserRole.EMPLOYEE],
    description: 'Manages teams and has oversight of multiple projects and team leads'
  },
  [UserRole.ASSISTANT_MANAGER]: {
    role: UserRole.ASSISTANT_MANAGER,
    capabilities: [
      'Assist manager duties',
      'Supervise team leads',
      'Create team schedules',
      'Monitor task progress',
      'Handle day-to-day operations',
      'Coordinate between teams'
    ],
    canManage: [UserRole.TEAM_LEAD, UserRole.EMPLOYEE],
    description: 'Supports manager and supervises team leads and project execution'
  },
  [UserRole.TEAM_LEAD]: {
    role: UserRole.TEAM_LEAD,
    capabilities: [
      'Lead specific team',
      'Assign daily tasks',
      'Mentor team members',
      'Track team progress',
      'Conduct team meetings',
      'Report to management'
    ],
    canManage: [UserRole.EMPLOYEE],
    description: 'Directly leads a team of employees and ensures task completion'
  },
  [UserRole.EMPLOYEE]: {
    role: UserRole.EMPLOYEE,
    capabilities: [
      'Complete assigned tasks',
      'Update task progress',
      'Collaborate with teammates',
      'Submit time reports',
      'Participate in meetings',
      'Access personal dashboard'
    ],
    canManage: [],
    description: 'Individual contributor responsible for executing assigned tasks'
  }
};

export const getRolePermissions = (role: UserRole): RolePermissions => {
  return rolePermissions[role];
};

export const canUserManageRole = (userRole: UserRole, targetRole: UserRole): boolean => {
  return rolePermissions[userRole].canManage.includes(targetRole);
};

export const getRoleLevel = (role: UserRole): number => {
  const levels = {
    [UserRole.DEPARTMENT_HEAD]: 1,
    [UserRole.MANAGER]: 2,
    [UserRole.ASSISTANT_MANAGER]: 3,
    [UserRole.TEAM_LEAD]: 4,
    [UserRole.EMPLOYEE]: 5
  };
  return levels[role];
};

export const isHigherRole = (role1: UserRole, role2: UserRole): boolean => {
  return getRoleLevel(role1) < getRoleLevel(role2);
};
