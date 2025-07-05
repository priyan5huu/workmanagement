import { TaskDelegation, DelegationStatus, User, Task, UserRole } from '../types';
import { canUserManageRole, getRoleLevel } from '../utils/rolePermissions';
import { mockTasks } from '../data/mockData';
import api from './api';
import { config } from '../config';
import notificationService from './notification';

export interface DelegateTaskData {
  taskId: string;
  toUserId: string;
  reason: string;
  deadline?: Date;
  priority?: 'IMMEDIATE' | 'NORMAL' | 'LOW';
}

export interface DelegationResponse {
  delegationId: string;
  response: 'APPROVED' | 'REJECTED';
  comments?: string;
}

class TaskDelegationService {
  private isDemoMode(): boolean {
    return config.app.demoMode || !config.api.baseUrl || config.api.baseUrl.includes('localhost:3001');
  }

  // Request task delegation
  async delegateTask(delegationData: DelegateTaskData, fromUser: User): Promise<TaskDelegation> {
    const task = this.getTaskById(delegationData.taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Check if user has permission to delegate this task
    if (task.assignee.id !== fromUser.id && !this.canUserManageTask(fromUser, task)) {
      throw new Error('You don\'t have permission to delegate this task');
    }

    if (this.isDemoMode()) {
      return this.delegateTaskDemo(delegationData, fromUser);
    }

    try {
      const response = await api.post('/delegations', {
        ...delegationData,
        fromUserId: fromUser.id
      });

      // Send notification to the target user
      await notificationService.sendTaskDelegationNotification(
        delegationData.toUserId,
        fromUser,
        task,
        delegationData.reason
      );

      return response.data;
    } catch (error: any) {
      console.warn('API task delegation failed, falling back to demo mode:', error.message);
      return this.delegateTaskDemo(delegationData, fromUser);
    }
  }

  private async delegateTaskDemo(delegationData: DelegateTaskData, fromUser: User): Promise<TaskDelegation> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const delegation: TaskDelegation = {
      id: `delegation_${Date.now()}`,
      taskId: delegationData.taskId,
      fromUserId: fromUser.id,
      toUserId: delegationData.toUserId,
      reason: delegationData.reason,
      status: DelegationStatus.PENDING,
      requestedAt: new Date()
    };

    // In real app, this would be stored in the database
    // For demo, we'll store it in memory or localStorage
    this.storeDelegationDemo(delegation);

    return delegation;
  }

  // Respond to delegation request
  async respondToDelegation(delegationResponse: DelegationResponse, respondingUser: User): Promise<TaskDelegation> {
    const delegation = await this.getDelegationById(delegationResponse.delegationId);
    if (!delegation) {
      throw new Error('Delegation not found');
    }

    // Check if user is the target of the delegation
    if (delegation.toUserId !== respondingUser.id) {
      throw new Error('You are not authorized to respond to this delegation');
    }

    if (delegation.status !== DelegationStatus.PENDING) {
      throw new Error('This delegation has already been responded to');
    }

    if (this.isDemoMode()) {
      return this.respondToDelegationDemo(delegationResponse, respondingUser);
    }

    try {
      const response = await api.put(`/delegations/${delegationResponse.delegationId}/respond`, {
        ...delegationResponse,
        respondingUserId: respondingUser.id
      });

      return response.data;
    } catch (error: any) {
      console.warn('API delegation response failed, falling back to demo mode:', error.message);
      return this.respondToDelegationDemo(delegationResponse, respondingUser);
    }
  }

  private async respondToDelegationDemo(delegationResponse: DelegationResponse, respondingUser: User): Promise<TaskDelegation> {
    const delegation = await this.getDelegationById(delegationResponse.delegationId);
    if (!delegation) {
      throw new Error('Delegation not found');
    }

    const updatedDelegation: TaskDelegation = {
      ...delegation,
      status: delegationResponse.response === 'APPROVED' ? DelegationStatus.APPROVED : DelegationStatus.REJECTED,
      respondedAt: new Date(),
      comments: delegationResponse.comments
    };

    // Update task assignee if approved
    if (delegationResponse.response === 'APPROVED') {
      const taskIndex = mockTasks.findIndex(t => t.id === delegation.taskId);
      if (taskIndex !== -1) {
        // This would need to be properly handled with user service
        // mockTasks[taskIndex].assignee = respondingUser;
      }
    }

    this.storeDelegationDemo(updatedDelegation);

    // Send notification back to the original user
    const task = this.getTaskById(delegation.taskId);
    if (task) {
      await notificationService.sendDelegationResponseNotification(
        delegation.fromUserId,
        respondingUser,
        task,
        delegationResponse.response === 'APPROVED'
      );
    }

    return updatedDelegation;
  }

  // Get pending delegations for a user
  async getPendingDelegations(userId: string): Promise<TaskDelegation[]> {
    if (this.isDemoMode()) {
      return this.getPendingDelegationsDemo(userId);
    }

    try {
      const response = await api.get(`/delegations/pending/${userId}`);
      return response.data;
    } catch (error: any) {
      console.warn('API get pending delegations failed, falling back to demo mode:', error.message);
      return this.getPendingDelegationsDemo(userId);
    }
  }

  private async getPendingDelegationsDemo(userId: string): Promise<TaskDelegation[]> {
    const delegations = this.getAllDelegationsDemo();
    return delegations.filter(d => 
      d.toUserId === userId && d.status === DelegationStatus.PENDING
    );
  }

  // Get delegation history for a user
  async getDelegationHistory(userId: string, role?: 'FROM' | 'TO' | 'ALL'): Promise<TaskDelegation[]> {
    if (this.isDemoMode()) {
      return this.getDelegationHistoryDemo(userId, role);
    }

    try {
      const response = await api.get(`/delegations/history/${userId}`, {
        params: { role }
      });
      return response.data;
    } catch (error: any) {
      console.warn('API get delegation history failed, falling back to demo mode:', error.message);
      return this.getDelegationHistoryDemo(userId, role);
    }
  }

  private async getDelegationHistoryDemo(userId: string, role: 'FROM' | 'TO' | 'ALL' = 'ALL'): Promise<TaskDelegation[]> {
    const delegations = this.getAllDelegationsDemo();
    
    return delegations.filter(d => {
      switch (role) {
        case 'FROM':
          return d.fromUserId === userId;
        case 'TO':
          return d.toUserId === userId;
        case 'ALL':
        default:
          return d.fromUserId === userId || d.toUserId === userId;
      }
    });
  }

  // Escalate task delegation (for managers)
  async escalateDelegation(delegationId: string, escalatingUser: User, newAssigneeId: string): Promise<TaskDelegation> {
    const delegation = await this.getDelegationById(delegationId);
    if (!delegation) {
      throw new Error('Delegation not found');
    }

    // Check if user has permission to escalate
    if (!this.canUserEscalateDelegation(escalatingUser, delegation)) {
      throw new Error('You don\'t have permission to escalate this delegation');
    }

    if (this.isDemoMode()) {
      return this.escalateDelegationDemo(delegationId, escalatingUser, newAssigneeId);
    }

    try {
      const response = await api.put(`/delegations/${delegationId}/escalate`, {
        escalatingUserId: escalatingUser.id,
        newAssigneeId
      });

      return response.data;
    } catch (error: any) {
      console.warn('API delegation escalation failed, falling back to demo mode:', error.message);
      return this.escalateDelegationDemo(delegationId, escalatingUser, newAssigneeId);
    }
  }

  private async escalateDelegationDemo(delegationId: string, escalatingUser: User, _newAssigneeId: string): Promise<TaskDelegation> {
    const delegation = await this.getDelegationById(delegationId);
    if (!delegation) {
      throw new Error('Delegation not found');
    }

    const updatedDelegation: TaskDelegation = {
      ...delegation,
      status: DelegationStatus.APPROVED,
      approvedBy: escalatingUser.id,
      respondedAt: new Date(),
      comments: `Escalated by ${escalatingUser.name} and reassigned`
    };

    // Update task assignee
    const taskIndex = mockTasks.findIndex(t => t.id === delegation.taskId);
    if (taskIndex !== -1) {
      // This would need proper user lookup
      // mockTasks[taskIndex].assignee = newAssignee;
    }

    this.storeDelegationDemo(updatedDelegation);
    return updatedDelegation;
  }

  // Helper methods
  private canUserManageTask(user: User, task: Task): boolean {
    // User can manage task if they are:
    // 1. The task assignee
    // 2. The task reporter
    // 3. In a management role over the assignee
    // 4. Department head or higher
    
    if (task.assignee.id === user.id || task.reporter.id === user.id) {
      return true;
    }

    if (user.role === UserRole.DEPARTMENT_HEAD) {
      return true;
    }

    // Check if user manages the task assignee
    return canUserManageRole(user.role, task.assignee.role);
  }

  private canUserEscalateDelegation(user: User, _delegation: TaskDelegation): boolean {
    // Only managers and above can escalate delegations
    return getRoleLevel(user.role) <= getRoleLevel(UserRole.MANAGER);
  }

  private getTaskById(taskId: string): Task | undefined {
    return mockTasks.find(t => t.id === taskId);
  }

  private async getDelegationById(delegationId: string): Promise<TaskDelegation | null> {
    if (this.isDemoMode()) {
      const delegations = this.getAllDelegationsDemo();
      return delegations.find(d => d.id === delegationId) || null;
    }

    try {
      const response = await api.get(`/delegations/${delegationId}`);
      return response.data;
    } catch (error: any) {
      return null;
    }
  }

  private getAllDelegationsDemo(): TaskDelegation[] {
    // In demo mode, store delegations in localStorage
    const stored = localStorage.getItem('task_delegations');
    return stored ? JSON.parse(stored) : [];
  }

  private storeDelegationDemo(delegation: TaskDelegation): void {
    const delegations = this.getAllDelegationsDemo();
    const existingIndex = delegations.findIndex(d => d.id === delegation.id);
    
    if (existingIndex !== -1) {
      delegations[existingIndex] = delegation;
    } else {
      delegations.push(delegation);
    }

    localStorage.setItem('task_delegations', JSON.stringify(delegations));
  }
}

export default new TaskDelegationService();
