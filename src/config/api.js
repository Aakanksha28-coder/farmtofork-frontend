const API_BASE_URL = 'https://farmtofork-backend-2.onrender.com/api';

// Helpful companion: origin without the trailing "/api" segment
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export { API_BASE_URL, API_ORIGIN };