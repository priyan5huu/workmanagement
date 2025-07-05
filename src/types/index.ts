export enum UserRole {
  DEPARTMENT_HEAD = 'DEPARTMENT_HEAD',
  MANAGER = 'MANAGER',
  ASSISTANT_MANAGER = 'ASSISTANT_MANAGER',
  TEAM_LEAD = 'TEAM_LEAD',
  EMPLOYEE = 'EMPLOYEE'
}

export enum TaskStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  COMPLETED = 'COMPLETED'
}

export enum TaskPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department: string;
  manager?: string;
  directReports: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignee: User;
  reporter: User;
  project?: Project;
  deadline: Date;
  createdAt: Date;
  updatedAt: Date;
  attachments: Attachment[];
  comments: Comment[];
  tags: string[];
  estimatedHours?: number;
  actualHours?: number;
  progress: number;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: Date;
  updatedAt: Date;
  parentId?: string;
  replies: Comment[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
  progress: number;
  startDate: Date;
  endDate: Date;
  tasks: Task[];
  members: User[];
  manager: User;
}

export interface RolePermissions {
  create: string[];
  read: string[];
  update: string[];
  delete: string[];
  manage: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  permissions: RolePermissions;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  upcomingDeadlines: number;
  teamMembers: number;
  activeProjects: number;
}

// Enhanced Types for Core Functionality

export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  TASK_OVERDUE = 'TASK_OVERDUE',
  PROJECT_UPDATE = 'PROJECT_UPDATE',
  MEETING_REMINDER = 'MEETING_REMINDER',
  DEADLINE_APPROACHING = 'DEADLINE_APPROACHING',
  USER_CREATED = 'USER_CREATED',
  DELEGATION_REQUEST = 'DELEGATION_REQUEST'
}

export enum NotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
  ARCHIVED = 'ARCHIVED'
}

export enum VideoConferenceStatus {
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
  CANCELLED = 'CANCELLED'
}

export enum DelegationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED'
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  recipient: string; // User ID
  sender?: string; // User ID
  relatedEntity?: {
    type: 'task' | 'project' | 'user' | 'meeting';
    id: string;
  };
  createdAt: Date;
  readAt?: Date;
  actionUrl?: string;
}

export interface VideoConference {
  id: string;
  title: string;
  description?: string;
  status: VideoConferenceStatus;
  hostId: string;
  participants: string[]; // User IDs
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  recordingUrl?: string;
  meetingUrl: string;
  relatedTask?: string;
  relatedProject?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskDelegation {
  id: string;
  taskId: string;
  fromUserId: string;
  toUserId: string;
  reason: string;
  status: DelegationStatus;
  requestedAt: Date;
  respondedAt?: Date;
  approvedBy?: string; // User ID of approver
  comments?: string;
}

export interface PerformanceMetrics {
  userId: string;
  period: {
    start: Date;
    end: Date;
  };
  tasksCompleted: number;
  tasksOnTime: number;
  averageCompletionTime: number; // in days
  qualityScore: number; // 1-10
  collaborationScore: number; // 1-10
  innovationScore: number; // 1-10
  overallRating: number; // 1-10
  goals: Goal[];
  feedback: Feedback[];
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  progress: number; // 0-100
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  category: 'PERFORMANCE' | 'LEARNING' | 'LEADERSHIP' | 'TECHNICAL';
}

export interface Feedback {
  id: string;
  fromUserId: string;
  rating: number; // 1-5
  comment: string;
  category: 'TECHNICAL' | 'COMMUNICATION' | 'TEAMWORK' | 'LEADERSHIP';
  createdAt: Date;
}

export interface UserCreateRequest {
  name: string;
  email: string;
  role: UserRole;
  department: string;
  managerId?: string;
  temporaryPassword: string;
  requiredPasswordChange: boolean;
  permissions?: string[];
  startDate: Date;
  requestedBy: string; // User ID
  approvedBy?: string; // User ID
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
}

export interface TeamPerformanceData {
  departmentId: string;
  teamId?: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    averageCompletionTime: number;
    productivityScore: number;
    collaborationIndex: number;
  };
  members: {
    userId: string;
    contributionScore: number;
    tasksCompleted: number;
    qualityRating: number;
  }[];
  trends: {
    date: Date;
    completionRate: number;
    productivity: number;
  }[];
}

export interface EmailNotificationSettings {
  taskAssigned: boolean;
  taskCompleted: boolean;
  deadlineReminder: boolean;
  weeklyReport: boolean;
  meetingInvites: boolean;
  systemUpdates: boolean;
  frequency: 'IMMEDIATE' | 'DAILY' | 'WEEKLY';
}

// Enhanced User interface
export interface EnhancedUser extends User {
  phoneNumber?: string;
  timezone: string;
  lastLogin?: Date;
  passwordLastChanged: Date;
  twoFactorEnabled: boolean;
  emailNotificationSettings: EmailNotificationSettings;
  performanceMetrics?: PerformanceMetrics;
  goals: Goal[];
}

// Enhanced Task interface
export interface EnhancedTask extends Task {
  delegations: TaskDelegation[];
  watchers: string[]; // User IDs
  dependencies: string[]; // Task IDs
  videoConferences: VideoConference[];
  automatedNotifications: boolean;
  escalationRules?: {
    overdueDays: number;
    escalateToRole: UserRole;
    escalateToUser?: string;
  };
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