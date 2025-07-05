import toast, { Toaster, ToastOptions } from 'react-hot-toast';
import { AlertCircle, Info } from 'lucide-react';

// Custom toast styles
const toastStyles = {
  success: {
    style: {
      background: '#10B981',
      color: '#FFFFFF',
    },
    iconTheme: {
      primary: '#FFFFFF',
      secondary: '#10B981',
    },
  },
  error: {
    style: {
      background: '#EF4444',
      color: '#FFFFFF',
    },
    iconTheme: {
      primary: '#FFFFFF',
      secondary: '#EF4444',
    },
  },
  warning: {
    style: {
      background: '#F59E0B',
      color: '#FFFFFF',
    },
    iconTheme: {
      primary: '#FFFFFF',
      secondary: '#F59E0B',
    },
  },
  info: {
    style: {
      background: '#3B82F6',
      color: '#FFFFFF',
    },
    iconTheme: {
      primary: '#FFFFFF',
      secondary: '#3B82F6',
    },
  },
};

// Custom toast functions
export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    toast.success(message, {
      ...toastStyles.success,
      duration: 4000,
      ...options,
    });
  },

  error: (message: string, options?: ToastOptions) => {
    toast.error(message, {
      ...toastStyles.error,
      duration: 6000,
      ...options,
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    toast(message, {
      icon: <AlertCircle className="h-5 w-5" />,
      ...toastStyles.warning,
      duration: 5000,
      ...options,
    });
  },

  info: (message: string, options?: ToastOptions) => {
    toast(message, {
      icon: <Info className="h-5 w-5" />,
      ...toastStyles.info,
      duration: 4000,
      ...options,
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
    options?: ToastOptions
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        ...options,
        success: {
          ...toastStyles.success,
          duration: 4000,
        },
        error: {
          ...toastStyles.error,
          duration: 6000,
        },
      }
    );
  },

  loading: (message: string, options?: ToastOptions) => {
    return toast.loading(message, {
      duration: Infinity,
      ...options,
    });
  },

  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },

  remove: (toastId?: string) => {
    toast.remove(toastId);
  },
};

// Toast container component
export const ToastContainer: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        className: '',
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
          fontWeight: '500',
          fontSize: '14px',
          borderRadius: '8px',
          padding: '12px 16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
        success: toastStyles.success,
        error: toastStyles.error,
      }}
    />
  );
};

export default showToast;
