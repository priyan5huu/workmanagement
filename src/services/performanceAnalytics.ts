import { 
  PerformanceMetrics, 
  TeamPerformanceData, 
  User, 
  Task, 
  TaskStatus, 
  UserRole 
} from '../types';
import { mockUsers, mockTasks } from '../data/mockData';
import api from './api';
import { config } from '../config';

export interface PerformanceFilters {
  startDate: Date;
  endDate: Date;
  department?: string;
  role?: UserRole;
  teamId?: string;
}

export interface ProductivityReport {
  userId: string;
  userName: string;
  department: string;
  role: UserRole;
  metrics: {
    tasksCompleted: number;
    tasksOnTime: number;
    averageCompletionTime: number;
    qualityScore: number;
    productivityTrend: number; // percentage change from previous period
  };
  goals: {
    total: number;
    completed: number;
    inProgress: number;
  };
  lastUpdated: Date;
}

class PerformanceAnalyticsService {
  private isDemoMode(): boolean {
    return config.app.demoMode || !config.api.baseUrl || config.api.baseUrl.includes('localhost:3001');
  }

  // Get individual user performance metrics
  async getUserPerformanceMetrics(userId: string, filters: PerformanceFilters): Promise<PerformanceMetrics> {
    if (this.isDemoMode()) {
      return this.getUserPerformanceMetricsDemo(userId, filters);
    }

    try {
      const response = await api.get(`/analytics/user/${userId}/performance`, {
        params: filters
      });
      return response.data;
    } catch (error: any) {
      console.warn('API get user performance failed, falling back to demo mode:', error.message);
      return this.getUserPerformanceMetricsDemo(userId, filters);
    }
  }

  private async getUserPerformanceMetricsDemo(userId: string, filters: PerformanceFilters): Promise<PerformanceMetrics> {
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Filter tasks for the user within the date range
    const userTasks = mockTasks.filter(task => {
      const taskDate = task.createdAt;
      return task.assignee.id === userId &&
             taskDate >= filters.startDate &&
             taskDate <= filters.endDate;
    });

    const completedTasks = userTasks.filter(t => t.status === TaskStatus.COMPLETED);
    const onTimeTasks = completedTasks.filter(t => {
      const completed = t.updatedAt;
      return completed <= t.deadline;
    });

    // Calculate average completion time
    let totalCompletionTime = 0;
    completedTasks.forEach(task => {
      const completionTime = task.updatedAt.getTime() - task.createdAt.getTime();
      totalCompletionTime += completionTime / (1000 * 60 * 60 * 24); // Convert to days
    });

    const averageCompletionTime = completedTasks.length > 0 
      ? totalCompletionTime / completedTasks.length 
      : 0;

    // Generate mock scores (in real app, these would be calculated from actual data)
    const qualityScore = this.calculateQualityScore(userTasks);
    const collaborationScore = this.calculateCollaborationScore(userId);
    const innovationScore = this.calculateInnovationScore(userTasks);

    const performanceMetrics: PerformanceMetrics = {
      userId,
      period: {
        start: filters.startDate,
        end: filters.endDate
      },
      tasksCompleted: completedTasks.length,
      tasksOnTime: onTimeTasks.length,
      averageCompletionTime,
      qualityScore,
      collaborationScore,
      innovationScore,
      overallRating: (qualityScore + collaborationScore + innovationScore) / 3,
      goals: this.generateMockGoals(userId),
      feedback: this.generateMockFeedback(userId)
    };

    return performanceMetrics;
  }

  // Get team performance data
  async getTeamPerformanceData(filters: PerformanceFilters, requestingUser: User): Promise<TeamPerformanceData> {
    if (this.isDemoMode()) {
      return this.getTeamPerformanceDataDemo(filters, requestingUser);
    }

    try {
      const response = await api.get('/analytics/team/performance', {
        params: { ...filters, requestingUserId: requestingUser.id }
      });
      return response.data;
    } catch (error: any) {
      console.warn('API get team performance failed, falling back to demo mode:', error.message);
      return this.getTeamPerformanceDataDemo(filters, requestingUser);
    }
  }

  private async getTeamPerformanceDataDemo(filters: PerformanceFilters, requestingUser: User): Promise<TeamPerformanceData> {
    // Get team members based on requesting user's role and permissions
    let teamMembers: User[] = [];
    
    if (requestingUser.role === UserRole.DEPARTMENT_HEAD) {
      // Department heads can see all department members
      teamMembers = mockUsers.filter(u => 
        u.department === (filters.department || requestingUser.department)
      );
    } else if ([UserRole.MANAGER, UserRole.ASSISTANT_MANAGER].includes(requestingUser.role)) {
      // Managers can see their direct and indirect reports
      teamMembers = this.getTeamMembersForManager(requestingUser.id);
    } else if (requestingUser.role === UserRole.TEAM_LEAD) {
      // Team leads can see their direct reports
      teamMembers = mockUsers.filter(u => u.manager === requestingUser.id);
    } else {
      // Employees can only see their own data
      teamMembers = [requestingUser];
    }

    // Calculate team metrics
    const teamTasks = mockTasks.filter(task => {
      const taskDate = task.createdAt;
      return teamMembers.some(member => member.id === task.assignee.id) &&
             taskDate >= filters.startDate &&
             taskDate <= filters.endDate;
    });

    const completedTasks = teamTasks.filter(t => t.status === TaskStatus.COMPLETED);
    const overdueTasks = teamTasks.filter(t => {
      const now = new Date();
      return t.status !== TaskStatus.COMPLETED && t.deadline < now;
    });

    let totalCompletionTime = 0;
    completedTasks.forEach(task => {
      const completionTime = task.updatedAt.getTime() - task.createdAt.getTime();
      totalCompletionTime += completionTime / (1000 * 60 * 60 * 24);
    });

    const averageCompletionTime = completedTasks.length > 0 
      ? totalCompletionTime / completedTasks.length 
      : 0;

    // Calculate member contributions
    const memberMetrics = teamMembers.map(member => {
      const memberTasks = teamTasks.filter(t => t.assignee.id === member.id);
      const memberCompleted = memberTasks.filter(t => t.status === TaskStatus.COMPLETED);
      
      return {
        userId: member.id,
        contributionScore: this.calculateContributionScore(memberTasks, teamTasks),
        tasksCompleted: memberCompleted.length,
        qualityRating: this.calculateQualityScore(memberTasks)
      };
    });

    // Generate trend data
    const trends = this.generateTrendData(filters.startDate, filters.endDate, teamTasks);

    const teamPerformanceData: TeamPerformanceData = {
      departmentId: filters.department || requestingUser.department,
      teamId: filters.teamId,
      period: {
        start: filters.startDate,
        end: filters.endDate
      },
      metrics: {
        totalTasks: teamTasks.length,
        completedTasks: completedTasks.length,
        overdueTasks: overdueTasks.length,
        averageCompletionTime,
        productivityScore: this.calculateProductivityScore(teamTasks),
        collaborationIndex: this.calculateCollaborationIndex(teamMembers)
      },
      members: memberMetrics,
      trends
    };

    return teamPerformanceData;
  }

  // Get productivity report for multiple users
  async getProductivityReport(userIds: string[], filters: PerformanceFilters): Promise<ProductivityReport[]> {
    if (this.isDemoMode()) {
      return this.getProductivityReportDemo(userIds, filters);
    }

    try {
      const response = await api.post('/analytics/productivity-report', {
        userIds,
        filters
      });
      return response.data;
    } catch (error: any) {
      console.warn('API get productivity report failed, falling back to demo mode:', error.message);
      return this.getProductivityReportDemo(userIds, filters);
    }
  }

  private async getProductivityReportDemo(userIds: string[], filters: PerformanceFilters): Promise<ProductivityReport[]> {
    const reports: ProductivityReport[] = [];

    for (const userId of userIds) {
      const user = mockUsers.find(u => u.id === userId);
      if (!user) continue;

      const userTasks = mockTasks.filter(task => {
        const taskDate = task.createdAt;
        return task.assignee.id === userId &&
               taskDate >= filters.startDate &&
               taskDate <= filters.endDate;
      });

      const completedTasks = userTasks.filter(t => t.status === TaskStatus.COMPLETED);
      const onTimeTasks = completedTasks.filter(t => t.updatedAt <= t.deadline);

      let totalCompletionTime = 0;
      completedTasks.forEach(task => {
        const completionTime = task.updatedAt.getTime() - task.createdAt.getTime();
        totalCompletionTime += completionTime / (1000 * 60 * 60 * 24);
      });

      const averageCompletionTime = completedTasks.length > 0 
        ? totalCompletionTime / completedTasks.length 
        : 0;

      const goals = this.generateMockGoals(userId);

      const report: ProductivityReport = {
        userId,
        userName: user.name,
        department: user.department,
        role: user.role,
        metrics: {
          tasksCompleted: completedTasks.length,
          tasksOnTime: onTimeTasks.length,
          averageCompletionTime,
          qualityScore: this.calculateQualityScore(userTasks),
          productivityTrend: Math.random() * 20 - 10 // Mock trend percentage
        },
        goals: {
          total: goals.length,
          completed: goals.filter(g => g.status === 'COMPLETED').length,
          inProgress: goals.filter(g => g.status === 'ACTIVE').length
        },
        lastUpdated: new Date()
      };

      reports.push(report);
    }

    return reports.sort((a, b) => b.metrics.qualityScore - a.metrics.qualityScore);
  }

  // Get department performance comparison
  async getDepartmentComparison(departments: string[], filters: PerformanceFilters): Promise<any[]> {
    if (this.isDemoMode()) {
      return this.getDepartmentComparisonDemo(departments, filters);
    }

    try {
      const response = await api.post('/analytics/department-comparison', {
        departments,
        filters
      });
      return response.data;
    } catch (error: any) {
      console.warn('API get department comparison failed, falling back to demo mode:', error.message);
      return this.getDepartmentComparisonDemo(departments, filters);
    }
  }

  private async getDepartmentComparisonDemo(departments: string[], filters: PerformanceFilters): Promise<any[]> {
    const comparisons = [];

    for (const department of departments) {
      const deptUsers = mockUsers.filter(u => u.department === department);
      const deptTasks = mockTasks.filter(task => {
        const taskDate = task.createdAt;
        return deptUsers.some(user => user.id === task.assignee.id) &&
               taskDate >= filters.startDate &&
               taskDate <= filters.endDate;
      });

      const completedTasks = deptTasks.filter(t => t.status === TaskStatus.COMPLETED);
      const completionRate = deptTasks.length > 0 ? (completedTasks.length / deptTasks.length) * 100 : 0;

      comparisons.push({
        department,
        memberCount: deptUsers.length,
        totalTasks: deptTasks.length,
        completedTasks: completedTasks.length,
        completionRate,
        averageProductivity: this.calculateProductivityScore(deptTasks),
        topPerformer: this.getTopPerformer(deptUsers, filters)
      });
    }

    return comparisons.sort((a, b) => b.completionRate - a.completionRate);
  }

  // Helper methods for calculations
  private calculateQualityScore(tasks: Task[]): number {
    if (tasks.length === 0) return 0;
    
    // Mock quality calculation based on task completion and progress
    let totalQuality = 0;
    tasks.forEach(task => {
      let quality = task.progress / 10; // Base quality from progress
      
      // Bonus for completion
      if (task.status === TaskStatus.COMPLETED) {
        quality += 2;
      }
      
      // Penalty for overdue
      if (task.deadline < new Date() && task.status !== TaskStatus.COMPLETED) {
        quality -= 1;
      }
      
      totalQuality += Math.min(Math.max(quality, 1), 10); // Clamp between 1-10
    });
    
    return Math.round((totalQuality / tasks.length) * 10) / 10;
  }

  private calculateCollaborationScore(userId: string): number {
    // Mock collaboration score based on task interactions
    const userTasks = mockTasks.filter(t => 
      t.assignee.id === userId || t.reporter.id === userId
    );
    
    const collaborationFactors = userTasks.length * 0.5; // More tasks = more collaboration
    return Math.min(Math.max(collaborationFactors + Math.random() * 3, 1), 10);
  }

  private calculateInnovationScore(tasks: Task[]): number {
    // Mock innovation score based on task complexity and tags
    if (tasks.length === 0) return 0;
    
    let innovationPoints = 0;
    tasks.forEach(task => {
      // Innovation tags
      const innovativeTags = ['innovation', 'research', 'new-feature', 'optimization'];
      const hasInnovativeTags = task.tags.some(tag => 
        innovativeTags.some(innovTag => tag.toLowerCase().includes(innovTag))
      );
      
      if (hasInnovativeTags) innovationPoints += 2;
      if (task.estimatedHours && task.estimatedHours > 20) innovationPoints += 1; // Complex tasks
    });
    
    const averageInnovation = tasks.length > 0 ? innovationPoints / tasks.length : 0;
    return Math.min(Math.max(averageInnovation * 2 + Math.random() * 2, 1), 10);
  }

  private calculateContributionScore(memberTasks: Task[], allTasks: Task[]): number {
    if (allTasks.length === 0) return 0;
    
    const memberContribution = memberTasks.length / allTasks.length;
    const memberCompleted = memberTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const completionBonus = memberTasks.length > 0 ? memberCompleted / memberTasks.length : 0;
    
    return Math.round((memberContribution * 50 + completionBonus * 50) * 10) / 10;
  }

  private calculateProductivityScore(tasks: Task[]): number {
    if (tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED);
    const completionRate = completedTasks.length / tasks.length;
    
    const onTimeTasks = completedTasks.filter(t => t.updatedAt <= t.deadline);
    const onTimeRate = completedTasks.length > 0 ? onTimeTasks.length / completedTasks.length : 0;
    
    return Math.round((completionRate * 60 + onTimeRate * 40) * 100) / 10;
  }

  private calculateCollaborationIndex(members: User[]): number {
    // Mock collaboration index based on team size and hierarchy
    const teamSize = members.length;
    const roleVariety = new Set(members.map(m => m.role)).size;
    
    return Math.min(Math.max((teamSize * 2 + roleVariety * 3) / 10, 1), 10);
  }

  private generateTrendData(startDate: Date, endDate: Date, tasks: Task[]): any[] {
    const trends = [];
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const interval = Math.max(Math.floor(daysDiff / 10), 1); // Max 10 data points
    
    for (let i = 0; i < daysDiff; i += interval) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dayTasks = tasks.filter(t => {
        const taskDate = new Date(t.createdAt);
        return taskDate <= date;
      });
      
      const completedByDate = dayTasks.filter(t => 
        t.status === TaskStatus.COMPLETED && t.updatedAt <= date
      );
      
      trends.push({
        date,
        completionRate: dayTasks.length > 0 ? (completedByDate.length / dayTasks.length) * 100 : 0,
        productivity: this.calculateProductivityScore(dayTasks)
      });
    }
    
    return trends;
  }

  private getTeamMembersForManager(managerId: string): User[] {
    const directReports = mockUsers.filter(u => u.manager === managerId);
    let allReports = [...directReports];
    
    // Get indirect reports recursively
    directReports.forEach(report => {
      const subReports = this.getTeamMembersForManager(report.id);
      allReports = [...allReports, ...subReports];
    });
    
    return allReports;
  }

  private getTopPerformer(users: User[], filters: PerformanceFilters): { name: string; score: number } | null {
    if (users.length === 0) return null;
    
    let topPerformer = users[0];
    let topScore = 0;
    
    users.forEach(user => {
      const userTasks = mockTasks.filter(task => {
        const taskDate = task.createdAt;
        return task.assignee.id === user.id &&
               taskDate >= filters.startDate &&
               taskDate <= filters.endDate;
      });
      
      const score = this.calculateQualityScore(userTasks);
      if (score > topScore) {
        topScore = score;
        topPerformer = user;
      }
    });
    
    return { name: topPerformer.name, score: topScore };
  }

  private generateMockGoals(userId: string): any[] {
    // Generate mock goals for demo purposes
    return [
      {
        id: `goal_1_${userId}`,
        title: 'Complete 10 tasks this month',
        description: 'Achieve high productivity by completing at least 10 tasks',
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        progress: Math.random() * 100,
        status: Math.random() > 0.3 ? 'ACTIVE' : 'COMPLETED',
        category: 'PERFORMANCE'
      },
      {
        id: `goal_2_${userId}`,
        title: 'Improve code quality metrics',
        description: 'Achieve quality score above 8.0',
        targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        progress: Math.random() * 100,
        status: 'ACTIVE',
        category: 'TECHNICAL'
      }
    ];
  }

  private generateMockFeedback(userId: string): any[] {
    // Generate mock feedback for demo purposes
    const feedbackTypes = ['TECHNICAL', 'COMMUNICATION', 'TEAMWORK', 'LEADERSHIP'];
    return [
      {
        id: `feedback_1_${userId}`,
        fromUserId: 'mock_manager',
        rating: Math.floor(Math.random() * 2) + 4, // 4-5 rating
        comment: 'Great work on the recent project. Shows excellent technical skills.',
        category: feedbackTypes[Math.floor(Math.random() * feedbackTypes.length)],
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      }
    ];
  }
}

export default new PerformanceAnalyticsService();
