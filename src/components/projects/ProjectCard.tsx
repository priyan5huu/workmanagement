import React from 'react';
import { Calendar, Users, CheckCircle } from 'lucide-react';
import { Project } from '../../types';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Card from '../ui/Card';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'COMPLETED':
        return 'primary';
      case 'ON_HOLD':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.name}</h3>
          <p className="text-gray-600 text-sm">{project.description}</p>
        </div>
        <Badge variant={getStatusColor(project.status)}>
          {project.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-600">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-3 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
        </div>
        <div className="flex items-center space-x-3 text-sm text-gray-600">
          <CheckCircle className="h-4 w-4" />
          <span>{project.tasks.length} tasks</span>
        </div>
        <div className="flex items-center space-x-3 text-sm text-gray-600">
          <Users className="h-4 w-4" />
          <span>{project.members.length} team members</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <Avatar
            src={project.manager.avatar}
            alt={project.manager.name}
            name={project.manager.name}
            size="sm"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">{project.manager.name}</p>
            <p className="text-xs text-gray-500">Project Manager</p>
          </div>
        </div>
        <div className="flex -space-x-2">
          {project.members.slice(0, 3).map((member) => (
            <Avatar
              key={member.id}
              src={member.avatar}
              alt={member.name}
              name={member.name}
              size="sm"
            />
          ))}
          {project.members.length > 3 && (
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 ring-2 ring-white">
              +{project.members.length - 3}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;