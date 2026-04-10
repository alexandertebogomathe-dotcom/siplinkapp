/**
 * API Configuration
 * Determines the backend server URL based on environment
 */

export const getApiUrl = (): string => {
  if (typeof window === 'undefined') {
    return 'http://localhost:5000';
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  // Development: localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }

  // Production: Network IP
  // This handles cases where the app is accessed from mobile on the same network
  // e.g., http://196.47.199.191:3000 -> backend is at http://196.47.199.191:5000
  return `${protocol}//${hostname}:5000`;
};

// Call once at module load time to detect issues early
export const API_URL = getApiUrl();

console.log(`🔗 API URL configured: ${API_URL}`);
