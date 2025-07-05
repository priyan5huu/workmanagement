import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search } from 'lucide-react';
import { Task, TaskStatus, TaskPriority, User } from '../../types';
import TaskCard from './TaskCard';
import TaskCreationModal from './TaskCreationModal';
import TeamMemberProfile from '../team/TeamMemberProfile';
import VideoConferenceModal from '../collaboration/VideoConferenceModal';
import { mockTasks, mockUsers } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../common/Toast';

interface KanbanBoardProps {
  onTaskCreate?: (taskData: any) => void;
  showFilters?: boolean;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ onTaskCreate, showFilters = true }) => {
  const { state, dispatch } = useApp();
  const { state: authState } = useAuth();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [quickAddColumnStatus, setQuickAddColumnStatus] = useState<TaskStatus>(TaskStatus.NOT_STARTED);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'ALL'>('ALL');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoParticipants, setVideoParticipants] = useState<User[]>([]);

  // Initialize tasks from AppContext or load from localStorage/mockData
  useEffect(() => {
    if (state.tasks.length === 0) {
      const storedTasks = localStorage.getItem('tasks');
      if (storedTasks) {
        try {
          const parsedTasks = JSON.parse(storedTasks);
          dispatch({ type: 'SET_TASKS', payload: [...parsedTasks, ...mockTasks] });
        } catch (error) {
          dispatch({ type: 'SET_TASKS', payload: mockTasks });
        }
      } else {
        dispatch({ type: 'SET_TASKS', payload: mockTasks });
      }
    }
  }, [state.tasks.length, dispatch]);

  const columns = [
    { id: TaskStatus.NOT_STARTED, title: 'Not Started', color: 'border-gray-300' },
    { id: TaskStatus.IN_PROGRESS, title: 'In Progress', color: 'border-blue-300' },
    { id: TaskStatus.IN_REVIEW, title: 'In Review', color: 'border-yellow-300' },
    { id: TaskStatus.COMPLETED, title: 'Completed', color: 'border-green-300' }
  ];

  const getTasksByStatus = (status: TaskStatus) => {
    let filteredTasks = state.tasks.filter((task: Task) => task.status === status);
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply priority filter
    if (priorityFilter !== 'ALL') {
      filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
    }
    
    return filteredTasks;
  };

  const handleQuickAdd = (status: TaskStatus) => {
    setQuickAddColumnStatus(status);
    setShowQuickAddModal(true);
  };

  const handleTaskDelete = (taskId: string) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId });
    showToast.success('Task deleted successfully');
  };

  const handleViewProfile = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setShowProfileModal(true);
    }
  };

  const handleStartVideoCall = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    if (user && authState.user) {
      setVideoParticipants([user]);
      setShowVideoModal(true);
      showToast.success(`Starting video call with ${user.name}...`);
    }
  };

  const handleDragStart = (_e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    
    if (draggedTask) {
      const updatedTask = { ...draggedTask, status, updatedAt: new Date() };
      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
      setDraggedTask(null);
    }
  };

  return (
    <div className="h-full">
      {/* Filters */}
      {showFilters && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'ALL')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="ALL">All Priorities</option>
                <option value={TaskPriority.HIGH}>High Priority</option>
                <option value={TaskPriority.MEDIUM}>Medium Priority</option>
                <option value={TaskPriority.LOW}>Low Priority</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex gap-6 h-full overflow-x-auto pb-6">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          
          return (
            <div
              key={column.id}
              className="flex-shrink-0 w-80"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className={`bg-white dark:bg-gray-800 rounded-lg border-t-4 ${column.color} shadow-sm`}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{column.title}</h3>
                      <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm px-2 py-1 rounded-full">
                        {columnTasks.length}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleQuickAdd(column.id)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      title="Add task to this column"
                    >
                      <Plus className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
                
                <div className="p-4 space-y-3 min-h-[200px] max-h-[calc(100vh-200px)] overflow-y-auto">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onDragStart={handleDragStart}
                      onDelete={handleTaskDelete}
                      onViewProfile={handleViewProfile}
                      onStartVideoCall={handleStartVideoCall}
                    />
                  ))}
                  
                  {columnTasks.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <p className="text-sm">No tasks</p>
                      <button 
                        onClick={() => handleQuickAdd(column.id)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                      >
                        Add first task
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Add Modal */}
      <TaskCreationModal
        isOpen={showQuickAddModal}
        onClose={() => setShowQuickAddModal(false)}
        onTaskCreate={(taskData) => {
          // Override status with the selected column
          const taskWithCorrectStatus = {
            ...taskData,
            status: quickAddColumnStatus
          };
          
          if (onTaskCreate) {
            onTaskCreate(taskWithCorrectStatus);
          }
          setShowQuickAddModal(false);
        }}
        preselectedProject={state.selectedProject}
      />

      {/* Team Member Profile Modal */}
      <TeamMemberProfile
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={selectedUser}
        onStartVideoCall={handleStartVideoCall}
        onSendMessage={(userId) => {
          // TODO: Implement messaging functionality
          console.log('Send message to user:', userId);
          showToast.success('Message feature coming soon!');
        }}
      />

      {/* Video Conference Modal */}
      {authState.user && (
        <VideoConferenceModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          participants={videoParticipants}
          currentUser={authState.user}
          roomId={`room_${Date.now()}`}
        />
      )}
    </div>
  );
};

export default KanbanBoard;