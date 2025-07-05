import { VideoConference, VideoConferenceStatus, User } from '../types';
import api from './api';
import { config } from '../config';
import notificationService from './notification';

export interface CreateMeetingData {
  title: string;
  description?: string;
  participants: string[]; // User IDs
  startTime: Date;
  duration: number; // in minutes
  relatedTask?: string;
  relatedProject?: string;
}

export interface UpdateMeetingData {
  title?: string;
  description?: string;
  participants?: string[];
  startTime?: Date;
  duration?: number;
}

class VideoConferenceService {
  private isDemoMode(): boolean {
    return config.app.demoMode || !config.api.baseUrl || config.api.baseUrl.includes('localhost:3001');
  }

  // Create new meeting
  async createMeeting(meetingData: CreateMeetingData, host: User): Promise<VideoConference> {
    if (this.isDemoMode()) {
      return this.createMeetingDemo(meetingData, host);
    }

    try {
      const response = await api.post('/meetings', {
        ...meetingData,
        hostId: host.id
      });

      const meeting = response.data;
      
      // Send invitations to participants
      await this.sendMeetingInvitations(meeting);
      
      return meeting;
    } catch (error: any) {
      console.warn('API meeting creation failed, falling back to demo mode:', error.message);
      return this.createMeetingDemo(meetingData, host);
    }
  }

  private async createMeetingDemo(meetingData: CreateMeetingData, host: User): Promise<VideoConference> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const meeting: VideoConference = {
      id: `meeting_${Date.now()}`,
      title: meetingData.title,
      description: meetingData.description,
      status: VideoConferenceStatus.SCHEDULED,
      hostId: host.id,
      participants: meetingData.participants,
      startTime: meetingData.startTime,
      duration: meetingData.duration,
      meetingUrl: this.generateMeetingUrl(),
      relatedTask: meetingData.relatedTask,
      relatedProject: meetingData.relatedProject,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.storeMeetingDemo(meeting);
    
    // Send invitations
    await this.sendMeetingInvitations(meeting);
    
    return meeting;
  }

  // Start meeting
  async startMeeting(meetingId: string, hostId: string): Promise<VideoConference> {
    const meeting = await this.getMeetingById(meetingId);
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    if (meeting.hostId !== hostId) {
      throw new Error('Only the host can start the meeting');
    }

    if (this.isDemoMode()) {
      return this.startMeetingDemo(meetingId);
    }

    try {
      const response = await api.put(`/meetings/${meetingId}/start`);
      return response.data;
    } catch (error: any) {
      console.warn('API start meeting failed, falling back to demo mode:', error.message);
      return this.startMeetingDemo(meetingId);
    }
  }

  private async startMeetingDemo(meetingId: string): Promise<VideoConference> {
    const meetings = this.getAllMeetingsDemo();
    const meetingIndex = meetings.findIndex(m => m.id === meetingId);
    
    if (meetingIndex === -1) {
      throw new Error('Meeting not found');
    }

    const updatedMeeting = {
      ...meetings[meetingIndex],
      status: VideoConferenceStatus.ACTIVE,
      updatedAt: new Date()
    };

    meetings[meetingIndex] = updatedMeeting;
    localStorage.setItem('video_conferences', JSON.stringify(meetings));
    
    return updatedMeeting;
  }

  // End meeting
  async endMeeting(meetingId: string, hostId: string): Promise<VideoConference> {
    const meeting = await this.getMeetingById(meetingId);
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    if (meeting.hostId !== hostId) {
      throw new Error('Only the host can end the meeting');
    }

    if (this.isDemoMode()) {
      return this.endMeetingDemo(meetingId);
    }

    try {
      const response = await api.put(`/meetings/${meetingId}/end`);
      return response.data;
    } catch (error: any) {
      console.warn('API end meeting failed, falling back to demo mode:', error.message);
      return this.endMeetingDemo(meetingId);
    }
  }

  private async endMeetingDemo(meetingId: string): Promise<VideoConference> {
    const meetings = this.getAllMeetingsDemo();
    const meetingIndex = meetings.findIndex(m => m.id === meetingId);
    
    if (meetingIndex === -1) {
      throw new Error('Meeting not found');
    }

    const meeting = meetings[meetingIndex];
    const updatedMeeting = {
      ...meeting,
      status: VideoConferenceStatus.ENDED,
      endTime: new Date(),
      updatedAt: new Date()
    };

    meetings[meetingIndex] = updatedMeeting;
    localStorage.setItem('video_conferences', JSON.stringify(meetings));
    
    return updatedMeeting;
  }

  // Join meeting
  async joinMeeting(meetingId: string, userId: string): Promise<string> {
    const meeting = await this.getMeetingById(meetingId);
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    // Check if user is invited
    if (!meeting.participants.includes(userId) && meeting.hostId !== userId) {
      throw new Error('You are not invited to this meeting');
    }

    // Check if meeting is active or scheduled
    if (meeting.status === VideoConferenceStatus.ENDED) {
      throw new Error('This meeting has ended');
    }

    if (meeting.status === VideoConferenceStatus.CANCELLED) {
      throw new Error('This meeting has been cancelled');
    }

    return meeting.meetingUrl;
  }

  // Get upcoming meetings for user
  async getUpcomingMeetings(userId: string): Promise<VideoConference[]> {
    if (this.isDemoMode()) {
      return this.getUpcomingMeetingsDemo(userId);
    }

    try {
      const response = await api.get(`/meetings/upcoming/${userId}`);
      return response.data;
    } catch (error: any) {
      console.warn('API get upcoming meetings failed, falling back to demo mode:', error.message);
      return this.getUpcomingMeetingsDemo(userId);
    }
  }

  private async getUpcomingMeetingsDemo(userId: string): Promise<VideoConference[]> {
    const meetings = this.getAllMeetingsDemo();
    const now = new Date();
    
    return meetings.filter(meeting => {
      // User is host or participant
      const isInvited = meeting.hostId === userId || meeting.participants.includes(userId);
      if (!isInvited) return false;
      
      // Meeting is scheduled or active
      if (meeting.status === VideoConferenceStatus.ENDED || 
          meeting.status === VideoConferenceStatus.CANCELLED) {
        return false;
      }
      
      // Meeting is in the future or happening now
      return meeting.startTime >= now || meeting.status === VideoConferenceStatus.ACTIVE;
    }).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  // Get meeting history for user
  async getMeetingHistory(userId: string): Promise<VideoConference[]> {
    if (this.isDemoMode()) {
      return this.getMeetingHistoryDemo(userId);
    }

    try {
      const response = await api.get(`/meetings/history/${userId}`);
      return response.data;
    } catch (error: any) {
      console.warn('API get meeting history failed, falling back to demo mode:', error.message);
      return this.getMeetingHistoryDemo(userId);
    }
  }

  private async getMeetingHistoryDemo(userId: string): Promise<VideoConference[]> {
    const meetings = this.getAllMeetingsDemo();
    
    return meetings.filter(meeting => {
      // User was host or participant
      const wasInvited = meeting.hostId === userId || meeting.participants.includes(userId);
      if (!wasInvited) return false;
      
      // Meeting has ended
      return meeting.status === VideoConferenceStatus.ENDED;
    }).sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  // Update meeting
  async updateMeeting(meetingId: string, updateData: UpdateMeetingData, userId: string): Promise<VideoConference> {
    const meeting = await this.getMeetingById(meetingId);
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    if (meeting.hostId !== userId) {
      throw new Error('Only the host can update the meeting');
    }

    if (this.isDemoMode()) {
      return this.updateMeetingDemo(meetingId, updateData);
    }

    try {
      const response = await api.put(`/meetings/${meetingId}`, updateData);
      return response.data;
    } catch (error: any) {
      console.warn('API update meeting failed, falling back to demo mode:', error.message);
      return this.updateMeetingDemo(meetingId, updateData);
    }
  }

  private async updateMeetingDemo(meetingId: string, updateData: UpdateMeetingData): Promise<VideoConference> {
    const meetings = this.getAllMeetingsDemo();
    const meetingIndex = meetings.findIndex(m => m.id === meetingId);
    
    if (meetingIndex === -1) {
      throw new Error('Meeting not found');
    }

    const updatedMeeting = {
      ...meetings[meetingIndex],
      ...updateData,
      updatedAt: new Date()
    };

    meetings[meetingIndex] = updatedMeeting;
    localStorage.setItem('video_conferences', JSON.stringify(meetings));
    
    return updatedMeeting;
  }

  // Cancel meeting
  async cancelMeeting(meetingId: string, hostId: string, reason?: string): Promise<VideoConference> {
    const meeting = await this.getMeetingById(meetingId);
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    if (meeting.hostId !== hostId) {
      throw new Error('Only the host can cancel the meeting');
    }

    if (this.isDemoMode()) {
      return this.cancelMeetingDemo(meetingId, reason);
    }

    try {
      const response = await api.put(`/meetings/${meetingId}/cancel`, { reason });
      
      // Notify participants about cancellation
      await this.notifyMeetingCancellation(response.data, reason);
      
      return response.data;
    } catch (error: any) {
      console.warn('API cancel meeting failed, falling back to demo mode:', error.message);
      return this.cancelMeetingDemo(meetingId, reason);
    }
  }

  private async cancelMeetingDemo(meetingId: string, reason?: string): Promise<VideoConference> {
    const meetings = this.getAllMeetingsDemo();
    const meetingIndex = meetings.findIndex(m => m.id === meetingId);
    
    if (meetingIndex === -1) {
      throw new Error('Meeting not found');
    }

    const updatedMeeting = {
      ...meetings[meetingIndex],
      status: VideoConferenceStatus.CANCELLED,
      updatedAt: new Date()
    };

    meetings[meetingIndex] = updatedMeeting;
    localStorage.setItem('video_conferences', JSON.stringify(meetings));
    
    // Notify participants
    await this.notifyMeetingCancellation(updatedMeeting, reason);
    
    return updatedMeeting;
  }

  // Helper methods
  private async getMeetingById(meetingId: string): Promise<VideoConference | null> {
    if (this.isDemoMode()) {
      const meetings = this.getAllMeetingsDemo();
      return meetings.find(m => m.id === meetingId) || null;
    }

    try {
      const response = await api.get(`/meetings/${meetingId}`);
      return response.data;
    } catch (error: any) {
      return null;
    }
  }

  private getAllMeetingsDemo(): VideoConference[] {
    const stored = localStorage.getItem('video_conferences');
    if (!stored) return [];
    
    const meetings = JSON.parse(stored);
    // Convert date strings back to Date objects
    return meetings.map((m: any) => ({
      ...m,
      startTime: new Date(m.startTime),
      endTime: m.endTime ? new Date(m.endTime) : undefined,
      createdAt: new Date(m.createdAt),
      updatedAt: new Date(m.updatedAt)
    }));
  }

  private storeMeetingDemo(meeting: VideoConference): void {
    const meetings = this.getAllMeetingsDemo();
    const existingIndex = meetings.findIndex(m => m.id === meeting.id);
    
    if (existingIndex !== -1) {
      meetings[existingIndex] = meeting;
    } else {
      meetings.push(meeting);
    }

    localStorage.setItem('video_conferences', JSON.stringify(meetings));
  }

  private generateMeetingUrl(): string {
    // In a real application, this would integrate with a video conferencing service
    // like Zoom, Teams, Google Meet, etc.
    const meetingId = Math.random().toString(36).substring(2, 15);
    return `https://meet.company.com/room/${meetingId}`;
  }

  private async sendMeetingInvitations(meeting: VideoConference): Promise<void> {
    // Send notifications to all participants
    for (const participantId of meeting.participants) {
      await notificationService.sendNotification({
        type: 'MEETING_REMINDER' as any,
        title: 'Meeting Invitation',
        message: `You have been invited to "${meeting.title}" scheduled for ${meeting.startTime.toLocaleString()}`,
        recipient: participantId,
        sender: meeting.hostId,
        relatedEntity: {
          type: 'meeting',
          id: meeting.id
        },
        actionUrl: meeting.meetingUrl
      });
    }
  }

  private async notifyMeetingCancellation(meeting: VideoConference, reason?: string): Promise<void> {
    const message = reason 
      ? `Meeting "${meeting.title}" has been cancelled. Reason: ${reason}`
      : `Meeting "${meeting.title}" has been cancelled.`;

    for (const participantId of meeting.participants) {
      await notificationService.sendNotification({
        type: 'MEETING_REMINDER' as any,
        title: 'Meeting Cancelled',
        message,
        recipient: participantId,
        sender: meeting.hostId,
        relatedEntity: {
          type: 'meeting',
          id: meeting.id
        }
      });
    }
  }

  // Setup automatic reminders
  async setupMeetingReminders(): Promise<void> {
    // Check for meetings starting in 15 minutes every 5 minutes
    setInterval(async () => {
      await this.checkAndSendMeetingReminders();
    }, 5 * 60 * 1000); // 5 minutes
  }

  private async checkAndSendMeetingReminders(): Promise<void> {
    const now = new Date();
    const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

    const meetings = this.getAllMeetingsDemo();
    
    for (const meeting of meetings) {
      if (meeting.status === VideoConferenceStatus.SCHEDULED &&
          meeting.startTime <= fifteenMinutesFromNow &&
          meeting.startTime > now) {
        
        const minutesUntilStart = Math.round((meeting.startTime.getTime() - now.getTime()) / (1000 * 60));
        
        // Send reminder to host
        await notificationService.sendMeetingReminderNotification(
          meeting.hostId,
          meeting,
          minutesUntilStart
        );
        
        // Send reminder to participants
        for (const participantId of meeting.participants) {
          await notificationService.sendMeetingReminderNotification(
            participantId,
            meeting,
            minutesUntilStart
          );
        }
      }
    }
  }
}

export default new VideoConferenceService();
