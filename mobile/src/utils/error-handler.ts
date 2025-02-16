import axios from 'axios';

interface ApiError {
  message?: string;
  error?: string;
  statusCode?: number;
}

let toastFunction: ((props: { message: string; type: 'success' | 'error' | 'info' }) => void) | null = null;

export const initializeErrorHandler = (
  showToast: (props: { message: string; type: 'success' | 'error' | 'info' }) => void
) => {
  toastFunction = showToast;
};

export const handleApiError = (error: unknown, fallbackMessage: string = 'Something went wrong') => {
  let message = fallbackMessage;

  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError;
    const statusCode = error.response?.status;

    // Handle specific status codes
    switch (statusCode) {
      case 401:
        message = 'Please sign in to continue';
        break;
      
      case 403:
        message = 'You don\'t have permission to perform this action';
        break;

      case 404:
        message = 'The requested resource was not found';
        break;

      case 422:
        message = apiError.message || 'Please check your input and try again';
        break;

      case 429:
        message = 'Please wait a moment before trying again';
        break;
    }

    // Handle error with response
    if (apiError?.message || apiError?.error) {
      message = apiError.message || apiError.error || fallbackMessage;
    }

    // Handle network errors
    if (error.message === 'Network Error') {
      message = 'Please check your internet connection and try again';
    }
  } else if (error instanceof Error) {
    message = error.message || fallbackMessage;
  }

  // Show toast notification
  if (toastFunction) {
    toastFunction({
      message,
      type: 'error'
    });
  }

  return message;
};

export const showSuccess = (message: string) => {
  if (toastFunction) {
    toastFunction({
      message,
      type: 'success'
    });
  }
};

export const showInfo = (message: string) => {
  if (toastFunction) {
    toastFunction({
      message,
      type: 'info'
    });
  }
};

export const formatErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError;
    return apiError?.message || apiError?.error || error.message || 'An error occurred';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred';
};