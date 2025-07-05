import React, { createContext, useContext, useReducer } from 'react';
import { Task, Project, User } from '../types';

interface AppState {
  tasks: Task[];
  projects: Project[];
  users: User[];
  selectedProject: Project | null;
  filters: {
    status: string[];
    priority: string[];
    assignee: string[];
  };
  searchQuery: string;
  isLoading: boolean;
}

interface AppAction {
  type: 'SET_TASKS' | 'ADD_TASK' | 'UPDATE_TASK' | 'DELETE_TASK' | 'SET_PROJECTS' | 'SELECT_PROJECT' | 'SET_FILTERS' | 'SET_SEARCH' | 'SET_LOADING';
  payload?: any;
}

const initialState: AppState = {
  tasks: [],
  projects: [],
  users: [],
  selectedProject: null,
  filters: {
    status: [],
    priority: [],
    assignee: []
  },
  searchQuery: '',
  isLoading: false
};

function appReducer(state: AppState, action: AppAction): AppState {
  let updatedState: AppState;
  
  switch (action.type) {
    case 'SET_TASKS':
      updatedState = { ...state, tasks: action.payload };
      break;
    case 'ADD_TASK':
      updatedState = { ...state, tasks: [action.payload, ...state.tasks] };
      break;
    case 'UPDATE_TASK':
      updatedState = {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? { ...task, ...action.payload } : task
        )
      };
      break;
    case 'DELETE_TASK':
      updatedState = {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };
      break;
    case 'SET_PROJECTS':
      updatedState = { ...state, projects: action.payload };
      break;
    case 'SELECT_PROJECT':
      updatedState = { ...state, selectedProject: action.payload };
      break;
    case 'SET_FILTERS':
      updatedState = { ...state, filters: { ...state.filters, ...action.payload } };
      break;
    case 'SET_SEARCH':
      updatedState = { ...state, searchQuery: action.payload };
      break;
    case 'SET_LOADING':
      updatedState = { ...state, isLoading: action.payload };
      break;
    default:
      return state;
  }

  // Persist tasks to localStorage whenever tasks change
  if (action.type === 'ADD_TASK' || action.type === 'UPDATE_TASK' || action.type === 'DELETE_TASK' || action.type === 'SET_TASKS') {
    try {
      localStorage.setItem('tasks', JSON.stringify(updatedState.tasks));
    } catch (error) {
      console.warn('Failed to persist tasks to localStorage:', error);
    }
  }

  return updatedState;
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};