import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ToastContainer } from './components/common/Toast';
import Loading from './components/common/Loading';
import LoginForm from './components/auth/LoginForm';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './views/Dashboard';
import Tasks from './views/Tasks';
import Projects from './views/Projects';
import Team from './views/Team';
import Analytics from './views/Analytics';
import Settings from './views/Settings';
import UserCreationForm from './components/admin/UserCreationForm';
import TaskDelegation from './components/tasks/TaskDelegation';

const MainApp: React.FC = () => {
  const { state } = useAuth();
  const { dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Show loading screen while authenticating
  if (state.isLoading) {
    return <Loading fullScreen text="Authenticating..." />;
  }

  // Show login form if not authenticated
  if (!state.isAuthenticated) {
    return <LoginForm />;
  }

  const handleTaskCreate = (taskData: Task) => {
    // Add task to global state
    dispatch({ type: 'ADD_TASK', payload: taskData });
    
    // Store in localStorage for demo persistence
    const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const updatedTasks = [taskData, ...existingTasks];
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    
    console.log('New task created:', taskData);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'tasks':
        return <Tasks />;
      case 'projects':
        return <Projects />;
      case 'team':
        return <Team />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      case 'admin-users':
        return <UserCreationForm />;
      case 'admin-delegation':
        return <TaskDelegation />;
      default:
        return <Dashboard />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard';
      case 'tasks':
        return 'Tasks';
      case 'projects':
        return 'Projects';
      case 'team':
        return 'Team';
      case 'analytics':
        return 'Analytics';
      case 'settings':
        return 'Settings';
      case 'admin-users':
        return 'User Management';
      case 'admin-delegation':
        return 'Task Delegation';
      default:
        return 'Dashboard';
    }
  };

  const getPageSubtitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Welcome back! Here\'s an overview of your work.';
      case 'tasks':
        return 'Manage and track your tasks efficiently.';
      case 'projects':
        return 'Organize your projects and monitor progress.';
      case 'team':
        return 'Collaborate with your team members.';
      case 'analytics':
        return 'Analyze performance and track metrics.';
      case 'settings':
        return 'Configure your preferences and account settings.';
      case 'admin-users':
        return 'Create and manage user accounts across the organization.';
      case 'admin-delegation':
        return 'Delegate tasks and manage approval workflows.';
      default:
        return '';
    }
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      <div className="w-64 flex-shrink-0">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={getPageTitle()} 
          subtitle={getPageSubtitle()}
          onTaskCreate={handleTaskCreate}
        />
        
        <main className="flex-1 overflow-auto p-6 bg-gray-100 dark:bg-gray-800">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <MainApp />
            <ToastContainer />
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;