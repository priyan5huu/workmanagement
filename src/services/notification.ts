import { 
  Notification, 
  NotificationType, 
  NotificationStatus, 
  User, 
  Task, 
  VideoConference
} from '../types';
import api from './api';
import { config } from '../config';

export interface SendNotificationData {
  type: NotificationType;
  title: string;
  message: string;
  recipient: string;
  sender?: string;
  relatedEntity?: {
    type: 'task' | 'project' | 'user' | 'meeting';
    id: string;
  };
  actionUrl?: string;
}

export interface EmailNotificationData {
  to: string;
  subject: string;
  body: string;
  template?: string;
  data?: Record<string, any>;
}

class NotificationService {
  private isDemoMode(): boolean {
    return config.app.demoMode || !config.api.baseUrl || config.api.baseUrl.includes('localhost:3001');
  }

  // Send general notification
  async sendNotification(notificationData: SendNotificationData): Promise<Notification> {
    if (this.isDemoMode()) {
      return this.sendNotificationDemo(notificationData);
    }

    try {
      const response = await api.post('/notifications', notificationData);
      return response.data;
    } catch (error: any) {
      console.warn('API notification failed, falling back to demo mode:', error.message);
      return this.sendNotificationDemo(notificationData);
    }
  }

  private async sendNotificationDemo(notificationData: SendNotificationData): Promise<Notification> {
    const notification: Notification = {
      id: `notification_${Date.now()}`,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      status: NotificationStatus.UNREAD,
      recipient: notificationData.recipient,
      sender: notificationData.sender,
      relatedEntity: notificationData.relatedEntity,
      actionUrl: notificationData.actionUrl,
      createdAt: new Date()
    };

    this.storeNotificationDemo(notification);
    return notification;
  }

  // Specific notification types
  async sendTaskAssignmentNotification(assigneeId: string, assigner: User, task: Task): Promise<void> {
    await this.sendNotification({
      type: NotificationType.TASK_ASSIGNED,
      title: 'New Task Assigned',
      message: `${assigner.name} has assigned you a new task: "${task.title}"`,
      recipient: assigneeId,
      sender: assigner.id,
      relatedEntity: {
        type: 'task',
        id: task.id
      },
      actionUrl: `/tasks/${task.id}`
    });

    // Send email notification if enabled
    await this.sendEmailNotification({
      to: task.assignee.email,
      subject: `New Task Assigned: ${task.title}`,
      body: this.generateTaskAssignmentEmail(assigner, task),
      template: 'task_assignment'
    });
  }

  async sendTaskDelegationNotification(toUserId: string, fromUser: User, task: Task, reason: string): Promise<void> {
    await this.sendNotification({
      type: NotificationType.DELEGATION_REQUEST,
      title: 'Task Delegation Request',
      message: `${fromUser.name} wants to delegate task "${task.title}" to you. Reason: ${reason}`,
      recipient: toUserId,
      sender: fromUser.id,
      relatedEntity: {
        type: 'task',
        id: task.id
      },
      actionUrl: `/delegations/pending`
    });
  }

  async sendDelegationResponseNotification(originalUserId: string, respondingUser: User, task: Task, approved: boolean): Promise<void> {
    const status = approved ? 'accepted' : 'rejected';
    await this.sendNotification({
      type: NotificationType.DELEGATION_REQUEST,
      title: `Delegation ${status}`,
      message: `${respondingUser.name} has ${status} the delegation for task "${task.title}"`,
      recipient: originalUserId,
      sender: respondingUser.id,
      relatedEntity: {
        type: 'task',
        id: task.id
      },
      actionUrl: `/tasks/${task.id}`
    });
  }

  async sendTaskCompletionNotification(reporterId: string, completer: User, task: Task): Promise<void> {
    await this.sendNotification({
      type: NotificationType.TASK_COMPLETED,
      title: 'Task Completed',
      message: `${completer.name} has completed the task: "${task.title}"`,
      recipient: reporterId,
      sender: completer.id,
      relatedEntity: {
        type: 'task',
        id: task.id
      },
      actionUrl: `/tasks/${task.id}`
    });
  }

  async sendDeadlineReminderNotification(userId: string, task: Task, daysUntilDeadline: number): Promise<void> {
    const timeframe = daysUntilDeadline === 0 ? 'today' : 
                     daysUntilDeadline === 1 ? 'tomorrow' : 
                     `in ${daysUntilDeadline} days`;

    await this.sendNotification({
      type: NotificationType.DEADLINE_APPROACHING,
      title: 'Deadline Reminder',
      message: `Task "${task.title}" is due ${timeframe}`,
      recipient: userId,
      relatedEntity: {
        type: 'task',
        id: task.id
      },
      actionUrl: `/tasks/${task.id}`
    });
  }

  async sendMeetingReminderNotification(userId: string, meeting: VideoConference, minutesUntilStart: number): Promise<void> {
    await this.sendNotification({
      type: NotificationType.MEETING_REMINDER,
      title: 'Meeting Reminder',
      message: `Meeting "${meeting.title}" starts in ${minutesUntilStart} minutes`,
      recipient: userId,
      relatedEntity: {
        type: 'meeting',
        id: meeting.id
      },
      actionUrl: meeting.meetingUrl
    });
  }

  // Email notifications
  async sendEmailNotification(emailData: EmailNotificationData): Promise<void> {
    if (this.isDemoMode()) {
      console.log('Demo: Email notification would be sent:', emailData);
      return;
    }

    try {
      await api.post('/notifications/email', emailData);
    } catch (error: any) {
      console.warn('Email notification failed:', error.message);
    }
  }

  // Get notifications for user
  async getUserNotifications(userId: string, status?: NotificationStatus): Promise<Notification[]> {
    if (this.isDemoMode()) {
      return this.getUserNotificationsDemo(userId, status);
    }

    try {
      const response = await api.get(`/notifications/user/${userId}`, {
        params: { status }
      });
      return response.data;
    } catch (error: any) {
      console.warn('API get notifications failed, falling back to demo mode:', error.message);
      return this.getUserNotificationsDemo(userId, status);
    }
  }

  private async getUserNotificationsDemo(userId: string, status?: NotificationStatus): Promise<Notification[]> {
    const notifications = this.getAllNotificationsDemo();
    return notifications.filter(n => {
      if (n.recipient !== userId) return false;
      if (status && n.status !== status) return false;
      return true;
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    if (this.isDemoMode()) {
      this.markAsReadDemo(notificationId);
      return;
    }

    try {
      await api.put(`/notifications/${notificationId}/read`);
    } catch (error: any) {
      console.warn('Mark as read failed, falling back to demo mode:', error.message);
      this.markAsReadDemo(notificationId);
    }
  }

  private markAsReadDemo(notificationId: string): void {
    const notifications = this.getAllNotificationsDemo();
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.status = NotificationStatus.READ;
      notification.readAt = new Date();
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }

  // Bulk operations
  async markAllAsRead(userId: string): Promise<void> {
    if (this.isDemoMode()) {
      this.markAllAsReadDemo(userId);
      return;
    }

    try {
      await api.put(`/notifications/user/${userId}/mark-all-read`);
    } catch (error: any) {
      console.warn('Mark all as read failed, falling back to demo mode:', error.message);
      this.markAllAsReadDemo(userId);
    }
  }

  private markAllAsReadDemo(userId: string): void {
    const notifications = this.getAllNotificationsDemo();
    notifications.forEach(n => {
      if (n.recipient === userId && n.status === NotificationStatus.UNREAD) {
        n.status = NotificationStatus.READ;
        n.readAt = new Date();
      }
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }

  // Auto-notifications setup
  async setupAutomaticNotifications(): Promise<void> {
    // Set up periodic checks for deadlines
    setInterval(() => {
      this.checkUpcomingDeadlines();
    }, 60000 * 60); // Check every hour

    // Set up meeting reminders
    setInterval(() => {
      this.checkUpcomingMeetings();
    }, 60000 * 5); // Check every 5 minutes
  }

  private async checkUpcomingDeadlines(): Promise<void> {
    // Implementation would check all tasks for approaching deadlines
    // and send notifications accordingly
    console.log('Checking for upcoming deadlines...');
  }

  private async checkUpcomingMeetings(): Promise<void> {
    // Implementation would check all scheduled meetings
    // and send reminder notifications
    console.log('Checking for upcoming meetings...');
  }

  // Helper methods
  private generateTaskAssignmentEmail(assigner: User, task: Task): string {
    return `
      <h2>New Task Assigned</h2>
      <p>Hi ${task.assignee.name},</p>
      <p>${assigner.name} has assigned you a new task:</p>
      <h3>${task.title}</h3>
      <p><strong>Description:</strong> ${task.description}</p>
      <p><strong>Priority:</strong> ${task.priority}</p>
      <p><strong>Deadline:</strong> ${task.deadline.toLocaleDateString()}</p>
      <p>Please log in to your dashboard to view more details and start working on this task.</p>
      <p>Best regards,<br>Work Management System</p>
    `;
  }

  private getAllNotificationsDemo(): Notification[] {
    const stored = localStorage.getItem('notifications');
    if (!stored) return [];
    
    const notifications = JSON.parse(stored);
    // Convert date strings back to Date objects
    return notifications.map((n: any) => ({
      ...n,
      createdAt: new Date(n.createdAt),
      readAt: n.readAt ? new Date(n.readAt) : undefined
    }));
  }

  private storeNotificationDemo(notification: Notification): void {
    const notifications = this.getAllNotificationsDemo();
    notifications.push(notification);
    
    // Keep only the latest 100 notifications in demo mode
    if (notifications.length > 100) {
      notifications.splice(0, notifications.length - 100);
    }
    
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }
}

export default new NotificationService();
