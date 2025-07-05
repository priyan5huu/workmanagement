import React from 'react';
import { CheckSquare, Users, Clock, TrendingUp, FolderOpen, AlertTriangle } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import TasksChart from '../components/dashboard/TasksChart';
import FeatureSummary from '../components/common/FeatureSummary';
import { mockTasks, mockUsers } from '../data/mockData';

const Dashboard: React.FC = () => {
  const totalTasks = mockTasks.length;
  const completedTasks = mockTasks.filter(task => task.status === 'COMPLETED').length;
  const overdueTasks = mockTasks.filter(task => 
    new Date(task.deadline) < new Date() && task.status !== 'COMPLETED'
  ).length;

  return (
    <div className="space-y-6">
      {/* Feature Summary */}
      <FeatureSummary />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Tasks"
          value={totalTasks}
          change={{ value: 12, type: 'increase' }}
          icon={CheckSquare}
          color="blue"
        />
        <StatsCard
          title="Completed"
          value={completedTasks}
          change={{ value: 8, type: 'increase' }}
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="Team Members"
          value={mockUsers.length}
          icon={Users}
          color="purple"
        />
        <StatsCard
          title="Overdue"
          value={overdueTasks}
          change={{ value: 5, type: 'decrease' }}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TasksChart />
        <ActivityFeed />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Deadlines</h2>
          <div className="space-y-4">
            {mockTasks
              .filter(task => task.status !== 'COMPLETED')
              .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
              .slice(0, 5)
              .map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <p className="text-sm text-gray-600">Assigned to {task.assignee.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(task.deadline).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {Math.ceil((new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <CheckSquare className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Create New Task</span>
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <FolderOpen className="h-5 w-5 text-green-600" />
                <span className="font-medium">New Project</span>
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Invite Team Member</span>
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="font-medium">Time Tracking</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;