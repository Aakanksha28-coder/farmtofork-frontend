// Universal API response handler with better error handling
export const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  
  // Handle empty responses
  if (response.status === 204) {
    return null;
  }
  
  // Handle 304 Not Modified
  if (response.status === 304) {
    return [];
  }
  
  // Check if response is JSON
  if (contentType.includes('application/json')) {
    try {
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }
      
      return data;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Server returned invalid JSON. The API might be down.');
      }
      throw error;
    }
  } else {
    // Response is not JSON (probably HTML error page)
    const text = await response.text();
    
    if (!response.ok) {
      // Check if it's an HTML error page
      if (text.includes('<!DOCTYPE') || text.includes('<html')) {
        throw new Error(`API Error: Server returned HTML instead of JSON. Status: ${response.status}. The backend might be down or the endpoint doesn't exist.`);
      }
      throw new Error(text || `Request failed with status ${response.status}`);
    }
    
    return text;
  }
};

// Get auth token from localStorage
export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};
