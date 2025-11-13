const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'https://farmtofork-backend-2.onrender.com/api'
  : 'https://farmtofork-backend-2.onrender.com/api';

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export { API_BASE_URL, API_ORIGIN };