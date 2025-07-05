import React, { useState, useEffect } from 'react';
import { Video, Calendar, Users, Clock, ExternalLink, Plus, Settings } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import videoConferenceService from '../../services/videoConference';
import { VideoConference, VideoConferenceStatus } from '../../types';
import { showToast } from '../common/Toast';

const VideoConferenceManager: React.FC = () => {
  const { state } = useAuth();
  const [conferences, setConferences] = useState<VideoConference[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newConference, setNewConference] = useState({
    title: '',
    description: '',
    scheduledFor: '',
    duration: 60,
    maxParticipants: 10
  });

  useEffect(() => {
    if (state.user) {
      loadConferences();
    }
  }, [state.user]);

  const loadConferences = async () => {
    if (!state.user) return;
    
    setLoading(true);
    try {
      const data = await videoConferenceService.getUpcomingMeetings(state.user.id);
      setConferences(data);
    } catch (error) {
      showToast.error('Failed to load conferences');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.user) return;

    try {
      const conference = await videoConferenceService.createMeeting({
        title: newConference.title,
        description: newConference.description,
        startTime: new Date(newConference.scheduledFor),
        duration: newConference.duration,
        participants: []
      }, state.user);

      setConferences(prev => [conference, ...prev]);
      setShowCreateForm(false);
      setNewConference({
        title: '',
        description: '',
        scheduledFor: '',
        duration: 60,
        maxParticipants: 10
      });
      showToast.success('Conference scheduled successfully');
    } catch (error) {
      showToast.error('Failed to schedule conference');
    }
  };

  const handleStartConference = async (conferenceId: string) => {
    if (!state.user) return;
    
    try {
      const conference = await videoConferenceService.startMeeting(conferenceId, state.user.id);
      window.open(conference.meetingUrl, '_blank');
      showToast.success('Conference started');
    } catch (error) {
      showToast.error('Failed to start conference');
    }
  };

  const handleJoinConference = async (conferenceId: string) => {
    if (!state.user) return;

    try {
      const meetingUrl = await videoConferenceService.joinMeeting(conferenceId, state.user.id);
      window.open(meetingUrl, '_blank');
      showToast.success('Joined conference');
    } catch (error) {
      showToast.error('Failed to join conference');
    }
  };

  const getStatusColor = (status: VideoConferenceStatus) => {
    switch (status) {
      case VideoConferenceStatus.SCHEDULED:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case VideoConferenceStatus.ACTIVE:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case VideoConferenceStatus.ENDED:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
      case VideoConferenceStatus.CANCELLED:
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(date));
  };

  const canStartConference = (conference: VideoConference) => {
    return state.user?.id === conference.hostId && 
           conference.status === VideoConferenceStatus.SCHEDULED;
  };

  const canJoinConference = (conference: VideoConference) => {
    return conference.status === VideoConferenceStatus.ACTIVE ||
           (conference.status === VideoConferenceStatus.SCHEDULED && 
            Date.now() >= new Date(conference.startTime).getTime() - 5 * 60 * 1000); // 5 minutes before
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Video Conferences</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Schedule and manage video meetings</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Meeting
        </Button>
      </div>

      {showCreateForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Schedule New Conference</h3>
          <form onSubmit={handleCreateConference} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={newConference.title}
                  onChange={(e) => setNewConference(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Meeting title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Scheduled Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={newConference.scheduledFor}
                  onChange={(e) => setNewConference(prev => ({ ...prev, scheduledFor: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={newConference.description}
                onChange={(e) => setNewConference(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Meeting description or agenda"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  max="480"
                  value={newConference.duration}
                  onChange={(e) => setNewConference(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Participants
                </label>
                <input
                  type="number"
                  min="2"
                  max="100"
                  value={newConference.maxParticipants}
                  onChange={(e) => setNewConference(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Schedule Conference
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Loading conferences...</p>
        </div>
      ) : conferences.length === 0 ? (
        <Card className="text-center py-12">
          <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No conferences scheduled</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by scheduling your first video conference</p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Meeting
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {conferences.map((conference) => (
            <Card key={conference.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Video className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{conference.title}</h3>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(conference.status)}`}>
                      {conference.status}
                    </span>
                  </div>
                </div>
                <Button variant="secondary" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>

              {conference.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{conference.description}</p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDateTime(conference.startTime)}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4 mr-2" />
                  {conference.duration} minutes
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Users className="h-4 w-4 mr-2" />
                  {conference.participants.length} participants
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {canStartConference(conference) && (
                  <Button
                    onClick={() => handleStartConference(conference.id)}
                    size="sm"
                    className="flex-1"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Start
                  </Button>
                )}
                
                {canJoinConference(conference) && !canStartConference(conference) && (
                  <Button
                    onClick={() => handleJoinConference(conference.id)}
                    size="sm"
                    className="flex-1"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Join
                  </Button>
                )}

                {conference.meetingUrl && conference.status === VideoConferenceStatus.ACTIVE && (
                  <Button
                    onClick={() => window.open(conference.meetingUrl, '_blank')}
                    variant="secondary"
                    size="sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoConferenceManager;
