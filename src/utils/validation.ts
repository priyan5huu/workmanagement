import { z } from 'zod';
import { UserRole, TaskPriority, TaskStatus } from '../types';

// Common validation rules
export const emailSchema = z.string().email('Please enter a valid email address');
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number');

// Auth schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  department: z.string().min(1, 'Department is required'),
  role: z.nativeEnum(UserRole),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const passwordResetSchema = z.object({
  email: emailSchema,
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// User schemas
export const userUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  department: z.string().min(1, 'Department is required'),
  role: z.nativeEnum(UserRole).optional(),
  avatar: z.string().url().optional().or(z.literal('')),
});

// Task schemas
export const taskCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
  priority: z.nativeEnum(TaskPriority),
  status: z.nativeEnum(TaskStatus),
  assigneeId: z.string().min(1, 'Assignee is required'),
  deadline: z.date({ required_error: 'Deadline is required' }),
  estimatedHours: z.number().min(0.5, 'Estimated hours must be at least 0.5').max(1000, 'Estimated hours cannot exceed 1000').optional(),
  tags: z.array(z.string()).optional(),
});

export const taskUpdateSchema = taskCreateSchema.partial().extend({
  id: z.string().min(1, 'Task ID is required'),
  actualHours: z.number().min(0, 'Actual hours cannot be negative').optional(),
  progress: z.number().min(0, 'Progress cannot be negative').max(100, 'Progress cannot exceed 100').optional(),
});

// Project schemas
export const projectCreateBaseSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Project name must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
  startDate: z.date({ required_error: 'Start date is required' }),
  endDate: z.date({ required_error: 'End date is required' }),
  managerId: z.string().min(1, 'Manager is required'),
  memberIds: z.array(z.string()).min(1, 'At least one team member is required'),
});

export const projectCreateSchema = projectCreateBaseSchema.refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const projectUpdateSchema = projectCreateBaseSchema.partial().extend({
  id: z.string().min(1, 'Project ID is required'),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ON_HOLD']).optional(),
  progress: z.number().min(0, 'Progress cannot be negative').max(100, 'Progress cannot exceed 100').optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return data.endDate > data.startDate;
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

// Comment schemas
export const commentCreateSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(1000, 'Comment must be less than 1000 characters'),
  taskId: z.string().min(1, 'Task ID is required'),
  parentId: z.string().optional(),
});

// File upload schemas
export const fileUploadSchema = z.object({
  file: z.instanceof(File, { message: 'Please select a file' }),
}).refine((data) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    return allowedTypes.includes(data.file.type);
  }, {
    message: 'File type not supported. Please upload JPG, PNG, GIF, PDF, DOC, DOCX, or TXT files.',
  })
  .refine((data) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    return data.file.size <= maxSize;
  }, {
    message: 'File size must be less than 10MB.',
  });

// Settings schemas
export const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  taskUpdates: z.boolean(),
  projectUpdates: z.boolean(),
  teamUpdates: z.boolean(),
  deadlineReminders: z.boolean(),
});

export const profileSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  language: z.string(),
  timezone: z.string(),
  dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']),
  timeFormat: z.enum(['12', '24']),
});

// Type exports for form data
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type PasswordResetFormData = z.infer<typeof passwordResetSchema>;
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;
export type UserUpdateFormData = z.infer<typeof userUpdateSchema>;
export type TaskCreateFormData = z.infer<typeof taskCreateSchema>;
export type TaskUpdateFormData = z.infer<typeof taskUpdateSchema>;
export type ProjectCreateFormData = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateFormData = z.infer<typeof projectUpdateSchema>;
export type CommentCreateFormData = z.infer<typeof commentCreateSchema>;
export type FileUploadFormData = z.infer<typeof fileUploadSchema>;
export type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>;
export type ProfileSettingsFormData = z.infer<typeof profileSettingsSchema>;
