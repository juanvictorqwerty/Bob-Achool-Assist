// Get base API URL from environment or fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 
                        'http://localhost:4000';

export default API_BASE_URL;