import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, MessageSquare, Paperclip, Flag, MoreVertical, Trash2, User, Video } from 'lucide-react';
import { Task, TaskPriority } from '../../types';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';

interface TaskCardProps {
  task: Task;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
  onClick?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onViewProfile?: (userId: string) => void;
  onStartVideoCall?: (userId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onDragStart, 
  onClick, 
  onDelete,
  onViewProfile,
  onStartVideoCall 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'danger';
      case TaskPriority.MEDIUM:
        return 'warning';
      case TaskPriority.LOW:
        return 'success';
      default:
        return 'secondary';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'COMPLETED';

  return (
    <div
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 cursor-pointer relative"
      draggable
      onDragStart={(e) => onDragStart?.(e, task)}
      onClick={() => onClick?.(task)}
    >
      {/* Task Menu */}
      <div className="absolute top-2 right-2 z-10" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        
        {showMenu && (
          <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[180px] z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewProfile?.(task.assignee.id);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            >
              <User className="h-4 w-4 mr-2" />
              View Profile
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartVideoCall?.(task.assignee.id);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            >
              <Video className="h-4 w-4 mr-2" />
              Start Video Call
            </button>
            <hr className="my-1 border-gray-200 dark:border-gray-600" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this task?')) {
                  onDelete?.(task.id);
                }
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Task
            </button>
          </div>
        )}
      </div>

      <div className="flex items-start justify-between mb-3 pr-8">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-5 line-clamp-2">
          {task.title}
        </h3>
        <Badge variant={getPriorityColor(task.priority)} size="sm">
          <Flag className="h-3 w-3 mr-1" />
          {task.priority}
        </Badge>
      </div>

      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
        {task.description}
      </p>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span className={isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
              {formatDate(task.deadline)}
            </span>
          </div>
          {task.estimatedHours && (
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{task.estimatedHours}h</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewProfile?.(task.assignee.id);
            }}
            className="hover:scale-105 transition-transform"
            title={`View ${task.assignee.name}'s profile`}
          >
            <Avatar
              src={task.assignee.avatar}
              alt={task.assignee.name}
              name={task.assignee.name}
              size="sm"
            />
          </button>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            {task.comments.length > 0 && (
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4" />
                <span>{task.comments.length}</span>
              </div>
            )}
            {task.attachments.length > 0 && (
              <div className="flex items-center space-x-1">
                <Paperclip className="h-4 w-4" />
                <span>{task.attachments.length}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 ml-4">
          <div
            className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${task.progress}%` }}
          />
        </div>
      </div>

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {task.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" size="sm">
              {tag}
            </Badge>
          ))}
          {task.tags.length > 3 && (
            <Badge variant="secondary" size="sm">
              +{task.tags.length - 3}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;