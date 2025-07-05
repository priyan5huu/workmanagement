import React, { useState, useEffect } from 'react';
import { 
  PerformanceMetrics, 
  TeamPerformanceData, 
  ProductivityReport, 
  UserRole 
} from '../../types';
import performanceAnalyticsService from '../../services/performanceAnalytics';
import { useAuth } from '../../context/AuthContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Users, 
  Clock, 
  Award,
  BarChart3,
  Calendar
} from 'lucide-react';

interface PerformanceDashboardProps {
  className?: string;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ 
  className = '' 
}) => {
  const { state } = useAuth();
  const currentUser = state.user;
  
  const [userMetrics, setUserMetrics] = useState<PerformanceMetrics | null>(null);
  const [teamData, setTeamData] = useState<TeamPerformanceData | null>(null);
  const [productivityReport, setProductivityReport] = useState<ProductivityReport[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date()
  });
  const [activeTab, setActiveTab] = useState<'personal' | 'team' | 'department'>('personal');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadPerformanceData();
    }
  }, [currentUser, dateRange, activeTab]);

  const loadPerformanceData = async () => {
    if (!currentUser) return;

    setLoading(true);

    try {
      const filters = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        department: currentUser.department
      };

      // Load personal metrics
      if (activeTab === 'personal') {
        const metrics = await performanceAnalyticsService.getUserPerformanceMetrics(
          currentUser.id, 
          filters
        );
        setUserMetrics(metrics);
      }

      // Load team data if user has management role
      if (activeTab === 'team' && [UserRole.TEAM_LEAD, UserRole.ASSISTANT_MANAGER, UserRole.MANAGER, UserRole.DEPARTMENT_HEAD].includes(currentUser.role)) {
        const data = await performanceAnalyticsService.getTeamPerformanceData(filters, currentUser);
        setTeamData(data);
      }

      // Load department productivity report
      if (activeTab === 'department' && [UserRole.MANAGER, UserRole.DEPARTMENT_HEAD].includes(currentUser.role)) {
        // Get all department members for the report
        const deptUsers = [currentUser.id]; // This would normally come from user service
        const report = await performanceAnalyticsService.getProductivityReport(deptUsers, filters);
        setProductivityReport(report);
      }
    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (range: 'week' | 'month' | 'quarter') => {
    const now = new Date();
    let startDate: Date;

    switch (range) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
    }

    setDateRange({ startDate, endDate: now });
  };

  const formatScore = (score: number) => {
    return Math.round(score * 10) / 10;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 dark:text-green-400';
    if (score >= 6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <div className="h-4 w-4" />;
  };

  if (!currentUser) {
    return <div>Please log in to view performance dashboard.</div>;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Performance Dashboard
        </h2>
        
        {/* Date Range Selector */}
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Calendar className="h-4 w-4 text-gray-500" />
          <div className="flex rounded-md shadow-sm">
            {['week', 'month', 'quarter'].map((range) => (
              <Button
                key={range}
                onClick={() => handleDateRangeChange(range as any)}
                className={`px-3 py-1 text-sm ${
                  dateRange.startDate.getTime() === new Date(Date.now() - (range === 'week' ? 7 : range === 'month' ? 30 : 90) * 24 * 60 * 60 * 1000).getTime()
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('personal')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'personal'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Personal Performance
          </button>
          
          {[UserRole.TEAM_LEAD, UserRole.ASSISTANT_MANAGER, UserRole.MANAGER, UserRole.DEPARTMENT_HEAD].includes(currentUser.role) && (
            <button
              onClick={() => setActiveTab('team')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'team'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Team Performance
            </button>
          )}
          
          {[UserRole.MANAGER, UserRole.DEPARTMENT_HEAD].includes(currentUser.role) && (
            <button
              onClick={() => setActiveTab('department')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'department'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Department Overview
            </button>
          )}
        </nav>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Loading performance data...</p>
        </div>
      ) : (
        <>
          {/* Personal Performance Tab */}
          {activeTab === 'personal' && userMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Key Metrics Cards */}
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Tasks Completed
                    </h3>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {userMetrics.tasksCompleted}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {userMetrics.tasksOnTime} on time
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Avg. Completion
                    </h3>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatScore(userMetrics.averageCompletionTime)} days
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Award className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Quality Score
                    </h3>
                    <p className={`text-2xl font-bold ${getScoreColor(userMetrics.qualityScore)}`}>
                      {formatScore(userMetrics.qualityScore)}/10
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BarChart3 className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Overall Rating
                    </h3>
                    <p className={`text-2xl font-bold ${getScoreColor(userMetrics.overallRating)}`}>
                      {formatScore(userMetrics.overallRating)}/10
                    </p>
                  </div>
                </div>
              </Card>

              {/* Detailed Scores */}
              <Card className="md:col-span-2 lg:col-span-4 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Performance Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Collaboration Score
                    </h4>
                    <div className={`text-3xl font-bold ${getScoreColor(userMetrics.collaborationScore)}`}>
                      {formatScore(userMetrics.collaborationScore)}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(userMetrics.collaborationScore / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Innovation Score
                    </h4>
                    <div className={`text-3xl font-bold ${getScoreColor(userMetrics.innovationScore)}`}>
                      {formatScore(userMetrics.innovationScore)}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${(userMetrics.innovationScore / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Quality Score
                    </h4>
                    <div className={`text-3xl font-bold ${getScoreColor(userMetrics.qualityScore)}`}>
                      {formatScore(userMetrics.qualityScore)}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(userMetrics.qualityScore / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Goals Section */}
              <Card className="md:col-span-2 lg:col-span-4 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Current Goals
                </h3>
                <div className="space-y-3">
                  {userMetrics.goals.map((goal) => (
                    <div key={goal.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">{goal.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          goal.status === 'COMPLETED' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                        }`}>
                          {goal.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{goal.description}</p>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${goal.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {Math.round(goal.progress)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Team Performance Tab */}
          {activeTab === 'team' && teamData && (
            <div className="space-y-6">
              {/* Team Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Team Size
                      </h3>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {teamData.members.length}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <Target className="h-8 w-8 text-green-600 dark:text-green-400" />
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Completion Rate
                      </h3>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {Math.round((teamData.metrics.completedTasks / teamData.metrics.totalTasks) * 100)}%
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <BarChart3 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Productivity Score
                      </h3>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {formatScore(teamData.metrics.productivityScore)}/10
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Team Members Performance */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Team Members Performance
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Member
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Tasks Completed
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Quality Rating
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Contribution Score
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {teamData.members.map((member) => (
                        <tr key={member.userId}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {member.userId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {member.tasksCompleted}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <span className={getScoreColor(member.qualityRating)}>
                              {formatScore(member.qualityRating)}/10
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatScore(member.contributionScore)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Department Overview Tab */}
          {activeTab === 'department' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Department Productivity Report
              </h3>
              {productivityReport.length > 0 ? (
                <div className="space-y-4">
                  {productivityReport.map((report) => (
                    <div key={report.userId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {report.userName}
                        </h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {report.role.replace(/_/g, ' ')} - {report.department}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Tasks Completed:</span>
                          <span className="ml-2 font-medium">{report.metrics.tasksCompleted}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">On Time:</span>
                          <span className="ml-2 font-medium">{report.metrics.tasksOnTime}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Quality Score:</span>
                          <span className={`ml-2 font-medium ${getScoreColor(report.metrics.qualityScore)}`}>
                            {formatScore(report.metrics.qualityScore)}/10
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-500 dark:text-gray-400">Trend:</span>
                          <span className="ml-2 flex items-center">
                            {getTrendIcon(report.metrics.productivityTrend)}
                            <span className={`ml-1 ${report.metrics.productivityTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {report.metrics.productivityTrend >= 0 ? '+' : ''}{formatScore(report.metrics.productivityTrend)}%
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No productivity data available for the selected period.
                </div>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default PerformanceDashboard;
