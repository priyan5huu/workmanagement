import { User, UserRole, EnhancedUser } from '../types';
import { canUserManageRole, getRoleLevel } from '../utils/rolePermissions';
import { mockUsers } from '../data/mockData';
import api from './api';
import { config } from '../config';

export interface CreateUserData {
  name: string;
  email: string;
  role: UserRole;
  department: string;
  managerId?: string;
  phoneNumber?: string;
  timezone: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  department?: string;
  managerId?: string;
  phoneNumber?: string;
  timezone?: string;
  isActive?: boolean;
}

class UserManagementService {
  private isDemoMode(): boolean {
    return config.app.demoMode || !config.api.baseUrl || config.api.baseUrl.includes('localhost:3001');
  }

  // Role-based user creation
  async createUser(userData: CreateUserData, createdBy: User): Promise<EnhancedUser> {
    // Check if creator has permission to create user with specified role
    if (!canUserManageRole(createdBy.role, userData.role)) {
      throw new Error(`You don't have permission to create users with role: ${userData.role}`);
    }

    // Validate manager assignment
    if (userData.managerId) {
      const manager = await this.getUserById(userData.managerId);
      if (!manager) {
        throw new Error('Specified manager not found');
      }
      
      // Check if the manager can manage the new user's role
      if (!canUserManageRole(manager.role, userData.role)) {
        throw new Error('Specified manager cannot manage users with this role');
      }

      // Check hierarchy - manager should be higher in hierarchy
      if (getRoleLevel(manager.role) >= getRoleLevel(userData.role)) {
        throw new Error('Manager must be higher in the organizational hierarchy');
      }
    }

    if (this.isDemoMode()) {
      return this.createUserDemo(userData, createdBy);
    }

    try {
      const response = await api.post('/users', {
        ...userData,
        createdBy: createdBy.id,
        temporaryPassword: this.generateTemporaryPassword(),
        requiredPasswordChange: true
      });

      return response.data;
    } catch (error: any) {
      console.warn('API user creation failed, falling back to demo mode:', error.message);
      return this.createUserDemo(userData, createdBy);
    }
  }

  private async createUserDemo(userData: CreateUserData, _createdBy: User): Promise<EnhancedUser> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if email already exists
    if (mockUsers.find(u => u.email === userData.email)) {
      throw new Error('User with this email already exists');
    }

    const newUser: EnhancedUser = {
      id: `user_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      department: userData.department,
      manager: userData.managerId,
      directReports: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      phoneNumber: userData.phoneNumber,
      timezone: userData.timezone || 'UTC',
      passwordLastChanged: new Date(),
      twoFactorEnabled: false,
      emailNotificationSettings: {
        taskAssigned: true,
        taskCompleted: true,
        deadlineReminder: true,
        weeklyReport: true,
        meetingInvites: true,
        systemUpdates: true,
        frequency: 'IMMEDIATE'
      },
      goals: []
    };

    // Update manager's direct reports
    if (userData.managerId) {
      const managerIndex = mockUsers.findIndex(u => u.id === userData.managerId);
      if (managerIndex !== -1) {
        mockUsers[managerIndex].directReports.push(newUser.id);
      }
    }

    // Add to mock users (in real app, this would be handled by the backend)
    mockUsers.push(newUser as User);

    return newUser;
  }

  // Get users that can be managed by the current user
  async getManagedUsers(managerId: string): Promise<User[]> {
    if (this.isDemoMode()) {
      return this.getManagedUsersDemo(managerId);
    }

    try {
      const response = await api.get(`/users/managed/${managerId}`);
      return response.data;
    } catch (error: any) {
      console.warn('API get managed users failed, falling back to demo mode:', error.message);
      return this.getManagedUsersDemo(managerId);
    }
  }

  private async getManagedUsersDemo(managerId: string): Promise<User[]> {
    const manager = mockUsers.find(u => u.id === managerId);
    if (!manager) return [];

    // Get all users that this manager can manage based on role hierarchy
    return mockUsers.filter(user => {
      // Direct reports
      if (manager.directReports.includes(user.id)) return true;
      
      // Users in same department with lower role level
      if (user.department === manager.department && 
          getRoleLevel(user.role) > getRoleLevel(manager.role)) {
        return true;
      }
      
      return false;
    });
  }

  // Get users by department with role filtering
  async getUsersByDepartment(department: string, requestingUser: User): Promise<User[]> {
    if (this.isDemoMode()) {
      return this.getUsersByDepartmentDemo(department, requestingUser);
    }

    try {
      const response = await api.get(`/users/department/${department}`, {
        params: { requestingUserId: requestingUser.id }
      });
      return response.data;
    } catch (error: any) {
      console.warn('API get users by department failed, falling back to demo mode:', error.message);
      return this.getUsersByDepartmentDemo(department, requestingUser);
    }
  }

  private async getUsersByDepartmentDemo(department: string, requestingUser: User): Promise<User[]> {
    return mockUsers.filter(user => {
      if (user.department !== department) return false;
      
      // Users can see peers and subordinates, not superiors (unless they're department head)
      if (requestingUser.role === UserRole.DEPARTMENT_HEAD) return true;
      
      return getRoleLevel(user.role) >= getRoleLevel(requestingUser.role);
    });
  }

  async getUserById(userId: string): Promise<User | null> {
    if (this.isDemoMode()) {
      return mockUsers.find(u => u.id === userId) || null;
    }

    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error: any) {
      console.warn('API get user failed, falling back to demo mode:', error.message);
      return mockUsers.find(u => u.id === userId) || null;
    }
  }

  async updateUser(userId: string, updateData: UpdateUserData, updatedBy: User): Promise<User> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check permissions
    if (!canUserManageRole(updatedBy.role, user.role) && userId !== updatedBy.id) {
      throw new Error('You don\'t have permission to update this user');
    }

    if (this.isDemoMode()) {
      return this.updateUserDemo(userId, updateData);
    }

    try {
      const response = await api.put(`/users/${userId}`, {
        ...updateData,
        updatedBy: updatedBy.id
      });
      return response.data;
    } catch (error: any) {
      console.warn('API user update failed, falling back to demo mode:', error.message);
      return this.updateUserDemo(userId, updateData);
    }
  }

  private async updateUserDemo(userId: string, updateData: UpdateUserData): Promise<User> {
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const updatedUser = {
      ...mockUsers[userIndex],
      ...updateData,
      updatedAt: new Date()
    };

    mockUsers[userIndex] = updatedUser;
    return updatedUser;
  }

  async deactivateUser(userId: string, deactivatedBy: User): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!canUserManageRole(deactivatedBy.role, user.role)) {
      throw new Error('You don\'t have permission to deactivate this user');
    }

    await this.updateUser(userId, { isActive: false }, deactivatedBy);
  }

  // Get organizational hierarchy
  async getOrganizationalHierarchy(departmentId?: string): Promise<any[]> {
    if (this.isDemoMode()) {
      return this.getOrganizationalHierarchyDemo(departmentId);
    }

    try {
      const response = await api.get('/users/hierarchy', {
        params: { departmentId }
      });
      return response.data;
    } catch (error: any) {
      console.warn('API get hierarchy failed, falling back to demo mode:', error.message);
      return this.getOrganizationalHierarchyDemo(departmentId);
    }
  }

  private async getOrganizationalHierarchyDemo(departmentId?: string): Promise<any[]> {
    const users = departmentId 
      ? mockUsers.filter(u => u.department === departmentId)
      : mockUsers;

    // Build hierarchy tree
    const hierarchy: any[] = [];
    const userMap = new Map(users.map(u => [u.id, { ...u, children: [] as any[] }]));

    users.forEach(user => {
      const userNode = userMap.get(user.id);
      if (user.manager && userMap.has(user.manager)) {
        const managerNode = userMap.get(user.manager);
        if (managerNode && userNode) {
          managerNode.children.push(userNode);
        }
      } else {
        // Top-level user (no manager or manager not in filtered set)
        if (userNode) {
          hierarchy.push(userNode);
        }
      }
    });

    return hierarchy;
  }

  private generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}

export default new UserManagementService();
