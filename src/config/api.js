// Use environment variable if available, otherwise detect based on hostname
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : 'https://farmtofork-backend-2.onrender.com/api');

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export { API_BASE_URL, API_ORIGIN };