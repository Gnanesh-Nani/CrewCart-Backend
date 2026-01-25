export const RESPONSE_MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Login successful',
    LOGIN_FAILED: 'Invalid email or password',
    UNAUTHORIZED: 'Unauthorized access',
  },

  USER: {
    CREATED: 'User created successfully',
    UPDATED: 'User updated successfully',
    NOT_FOUND: 'User not found',
  },

  RIDE: {
    CREATED: 'Ride created successfully',
    CANCELLED: 'Ride cancelled successfully',
    NOT_FOUND: 'Ride not found',
  },

  COMMON: {
    SUCCESS: 'Operation completed successfully',
    FAILED: 'Something went wrong',
    INVALID_REQUEST: 'Invalid request data',
  },
} as const;
