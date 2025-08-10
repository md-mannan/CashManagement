import axios from 'axios';

// Set the base URL for all requests
axios.defaults.baseURL = '/';

// Set the CSRF token for all requests
const token = document.head.querySelector('meta[name="csrf-token"]');
if (token) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = (token as HTMLMetaElement).content;
} else {
    console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}

// Set the Accept header for JSON responses
axios.defaults.headers.common['Accept'] = 'application/json';

// Include credentials (cookies) with requests
axios.defaults.withCredentials = true;

// Add request interceptor to include CSRF token
axios.interceptors.request.use(
    (config) => {
        // Get the CSRF token from the meta tag
        const token = document.head.querySelector('meta[name="csrf-token"]');
        if (token) {
            config.headers['X-CSRF-TOKEN'] = (token as HTMLMetaElement).content;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// Add response interceptor for error handling
axios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 419) {
            // CSRF token mismatch - reload the page to get a new token
            window.location.reload();
        }
        return Promise.reject(error);
    },
);

export default axios;
