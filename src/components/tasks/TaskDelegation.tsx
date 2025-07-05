import React, { useState, useEffect } from 'react';
import { TaskDelegation, DelegationStatus, User, Task } from '../../types';
import taskDelegationService from '../../services/taskDelegation';
import userManagementService from '../../services/userManagement';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { showToast } from '../common/Toast';
import { Clock, User as UserIcon, ArrowRight, CheckCircle, XCircle } from 'lucide-react';

interface TaskDelegationComponentProps {
  task?: Task;
  onDelegationComplete?: (delegation: TaskDelegation) => void;
}

export const TaskDelegationComponent: React.FC<TaskDelegationComponentProps> = ({
  task,
  onDelegationComplete
}) => {
  const { state } = useAuth();
  const currentUser = state.user;
  
  const [pendingDelegations, setPendingDelegations] = useState<TaskDelegation[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDelegationForm, setShowDelegationForm] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadPendingDelegations();
      loadAvailableUsers();
    }
  }, [currentUser]);

  const loadPendingDelegations = async () => {
    if (!currentUser) return;

    try {
      const delegations = await taskDelegationService.getPendingDelegations(currentUser.id);
      setPendingDelegations(delegations);
    } catch (error) {
      console.error('Failed to load pending delegations:', error);
    }
  };

  const loadAvailableUsers = async () => {
    if (!currentUser) return;

    try {
      const users = await userManagementService.getManagedUsers(currentUser.id);
      setAvailableUsers(users);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleDelegateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !task || !selectedUserId || !reason.trim()) {
      showToast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const delegation = await taskDelegationService.delegateTask({
        taskId: task.id,
        toUserId: selectedUserId,
        reason: reason.trim()
      }, currentUser);

      showToast.success('Task delegation request sent successfully');
      setReason('');
      setSelectedUserId('');
      setShowDelegationForm(false);

      if (onDelegationComplete) {
        onDelegationComplete(delegation);
      }
    } catch (error: any) {
      showToast.error(error.message || 'Failed to delegate task');
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToDelegation = async (delegationId: string, response: 'APPROVED' | 'REJECTED', comments?: string) => {
    if (!currentUser) return;

    setLoading(true);

    try {
      await taskDelegationService.respondToDelegation({
        delegationId,
        response,
        comments
      }, currentUser);

      showToast.success(`Delegation ${response.toLowerCase()} successfully`);
      loadPendingDelegations(); // Refresh the list
    } catch (error: any) {
      showToast.error(error.message || 'Failed to respond to delegation');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!currentUser) {
    return <div>Please log in to manage task delegations.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Pending Delegations */}
      {pendingDelegations.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Pending Delegation Requests
            </h3>
            <div className="space-y-4">
              {pendingDelegations.map((delegation) => (
                <div key={delegation.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <UserIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Task Delegation Request
                        </span>
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs rounded-full">
                          Pending
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Task ID</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{delegation.taskId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">From User</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{delegation.fromUserId}</p>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reason</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{delegation.reason}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>Requested {formatDate(delegation.requestedAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        onClick={() => handleRespondToDelegation(delegation.id, 'APPROVED')}
                        disabled={loading}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleRespondToDelegation(delegation.id, 'REJECTED')}
                        disabled={loading}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Task Delegation Form */}
      {task && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delegate Task: {task.title}
              </h3>
              <Button
                onClick={() => setShowDelegationForm(!showDelegationForm)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {showDelegationForm ? 'Cancel' : 'Delegate Task'}
              </Button>
            </div>

            {showDelegationForm && (
              <form onSubmit={handleDelegateTask} className="space-y-4">
                <div>
                  <label htmlFor="selectedUser" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Delegate to User *
                  </label>
                  <select
                    id="selectedUser"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select a user...</option>
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role.replace(/_/g, ' ')}) - {user.department}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason for Delegation *
                  </label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Explain why you're delegating this task..."
                  />
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                  <div className="flex items-center space-x-2 mb-2">
                    <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                      Task Details
                    </span>
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                    <p><strong>Priority:</strong> {task.priority}</p>
                    <p><strong>Status:</strong> {task.status}</p>
                    <p><strong>Deadline:</strong> {formatDate(task.deadline)}</p>
                    <p><strong>Progress:</strong> {task.progress}%</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    onClick={() => setShowDelegationForm(false)}
                    disabled={loading}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !selectedUserId || !reason.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                  >
                    {loading ? 'Delegating...' : 'Send Delegation Request'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Card>
      )}

      {/* Delegation History */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Delegation History
          </h3>
          <DelegationHistory userId={currentUser.id} />
        </div>
      </Card>
    </div>
  );
};

// Sub-component for delegation history
const DelegationHistory: React.FC<{ userId: string }> = ({ userId }) => {
  const [delegations, setDelegations] = useState<TaskDelegation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDelegationHistory();
  }, [userId]);

  const loadDelegationHistory = async () => {
    try {
      const history = await taskDelegationService.getDelegationHistory(userId);
      setDelegations(history);
    } catch (error) {
      console.error('Failed to load delegation history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: DelegationStatus) => {
    switch (status) {
      case DelegationStatus.APPROVED:
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case DelegationStatus.REJECTED:
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case DelegationStatus.PENDING:
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case DelegationStatus.COMPLETED:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading delegation history...</div>;
  }

  if (delegations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No delegation history found.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {delegations.map((delegation) => (
        <div key={delegation.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Task ID: {delegation.taskId}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(delegation.status)}`}>
                {delegation.status}
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(delegation.requestedAt).toLocaleDateString()}
            </span>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            <strong>From:</strong> {delegation.fromUserId} → <strong>To:</strong> {delegation.toUserId}
          </div>
          
          <p className="text-sm text-gray-700 dark:text-gray-300">{delegation.reason}</p>
          
          {delegation.comments && (
            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
              <strong>Response:</strong> {delegation.comments}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TaskDelegationComponent;
