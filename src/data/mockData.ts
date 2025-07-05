import { User, Task, Project, UserRole, TaskStatus, TaskPriority } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'dept.head@company.com',
    role: UserRole.DEPARTMENT_HEAD,
    avatar: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=400',
    department: 'Engineering',
    directReports: ['2', '3'],
    isActive: true,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    email: 'manager@company.com',
    role: UserRole.MANAGER,
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
    department: 'Engineering',
    manager: '1',
    directReports: ['3', '4'],
    isActive: true,
    createdAt: new Date('2023-02-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '3',
    name: 'Lisa Thompson',
    email: 'assistant.manager@company.com',
    role: UserRole.ASSISTANT_MANAGER,
    avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=400',
    department: 'Engineering',
    manager: '2',
    directReports: ['4'],
    isActive: true,
    createdAt: new Date('2023-02-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'team.lead@company.com',
    role: UserRole.TEAM_LEAD,
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
    department: 'Engineering',
    manager: '3',
    directReports: ['5'],
    isActive: true,
    createdAt: new Date('2023-03-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '5',
    name: 'James Wilson',
    email: 'employee@company.com',
    role: UserRole.EMPLOYEE,
    avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400',
    department: 'Engineering',
    manager: '4',
    directReports: [],
    isActive: true,
    createdAt: new Date('2023-04-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '6',
    name: 'Emily Watson',
    email: 'emily@company.com',
    role: UserRole.MANAGER,
    avatar: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=400',
    department: 'Design',
    manager: '1',
    directReports: [],
    isActive: true,
    createdAt: new Date('2023-02-15'),
    updatedAt: new Date('2024-01-15')
  }
];

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Implement User Authentication',
    description: 'Create secure login system with JWT tokens and role-based access control',
    priority: TaskPriority.HIGH,
    status: TaskStatus.IN_PROGRESS,
    assignee: mockUsers[3], // David Kim (Team Lead)
    reporter: mockUsers[1], // Michael Rodriguez (Manager)
    deadline: new Date('2024-02-15'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    attachments: [],
    comments: [],
    tags: ['authentication', 'security', 'backend'],
    estimatedHours: 40,
    actualHours: 25,
    progress: 60
  },
  {
    id: '2',
    title: 'Design Dashboard UI',
    description: 'Create modern and intuitive dashboard interface for the work management system',
    priority: TaskPriority.HIGH,
    status: TaskStatus.IN_REVIEW,
    assignee: mockUsers[4], // James Wilson (Employee)
    reporter: mockUsers[2], // Lisa Thompson (Assistant Manager)
    deadline: new Date('2024-02-10'),
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-16'),
    attachments: [],
    comments: [],
    tags: ['ui', 'design', 'dashboard'],
    estimatedHours: 30,
    actualHours: 28,
    progress: 90
  },
  {
    id: '3',
    title: 'Database Schema Design',
    description: 'Design and implement MongoDB schema for users, tasks, and projects',
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.COMPLETED,
    assignee: mockUsers[3], // David Kim (Team Lead)
    reporter: mockUsers[0], // Sarah Chen (Department Head)
    deadline: new Date('2024-01-25'),
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-20'),
    attachments: [],
    comments: [],
    tags: ['database', 'schema', 'mongodb'],
    estimatedHours: 20,
    actualHours: 18,
    progress: 100
  },
  {
    id: '4',
    title: 'API Documentation',
    description: 'Create comprehensive API documentation using Swagger/OpenAPI',
    priority: TaskPriority.LOW,
    status: TaskStatus.NOT_STARTED,
    assignee: mockUsers[4], // James Wilson (Employee)
    reporter: mockUsers[1], // Michael Rodriguez (Manager)
    deadline: new Date('2024-03-01'),
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    attachments: [],
    comments: [],
    tags: ['documentation', 'api', 'swagger'],
    estimatedHours: 15,
    actualHours: 0,
    progress: 0
  },
  {
    id: '5',
    title: 'Mobile Responsive Design',
    description: 'Ensure all components work perfectly on mobile devices',
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.IN_PROGRESS,
    assignee: mockUsers[5],
    reporter: mockUsers[2],
    deadline: new Date('2024-02-20'),
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-17'),
    attachments: [],
    comments: [],
    tags: ['mobile', 'responsive', 'css'],
    estimatedHours: 25,
    actualHours: 12,
    progress: 45
  }
];

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Work Management System v2.0',
    description: 'Complete redesign and enhancement of the work management platform',
    status: 'ACTIVE',
    progress: 65,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-03-31'),
    tasks: mockTasks,
    members: mockUsers.slice(0, 5),
    manager: mockUsers[0]
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'Native mobile application for iOS and Android platforms',
    status: 'ACTIVE',
    progress: 30,
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-06-30'),
    tasks: [],
    members: mockUsers.slice(2, 6),
    manager: mockUsers[1]
  }
];