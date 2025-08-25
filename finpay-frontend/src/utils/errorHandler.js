// Utility for handling API errors
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return error.response.data.error || 'An error occurred';
  } else if (error.request) {
    // Request was made but no response received
    return 'Network error. Please check your connection.';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
};