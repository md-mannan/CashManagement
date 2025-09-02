import axios from 'axios';
import { config, debugLog, errorLog, warnLog } from '@/config/environment';

// Set the base URL for all requests
axios.defaults.baseURL = '/';

// Set the CSRF token for all requests
const token = document.head.querySelector('meta[name="csrf-token"]');
if (token) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = (token as HTMLMetaElement).content;
    debugLog('CSRF token found and set');
} else {
    errorLog('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}

// Set the Accept header for JSON responses
axios.defaults.headers.common['Accept'] = 'application/json';

// Include credentials (cookies) with requests
axios.defaults.withCredentials = true;

// Environment-aware timeout
axios.defaults.timeout = config.apiTimeout;
debugLog(`API timeout set to ${config.apiTimeout}ms for ${config.isDevelopment ? 'development' : 'production'} environment`);

// Add request interceptor to include CSRF token
axios.interceptors.request.use(
    (config) => {
        // Get the CSRF token from the meta tag
        const token = document.head.querySelector('meta[name="csrf-token"]');
        if (token) {
            config.headers['X-CSRF-TOKEN'] = (token as HTMLMetaElement).content;
        }
        
        debugLog(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
        return config;
    },
    (error) => {
        errorLog('Request interceptor error', error);
        return Promise.reject(error);
    },
);

// Add response interceptor for error handling with retry logic
axios.interceptors.response.use(
    (response) => {
        debugLog(`Successful response from ${response.config.url}`, {
            status: response.status,
            data: response.data
        });
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        // Handle CSRF token mismatch
        if (error.response?.status === 419) {
            warnLog('CSRF token mismatch - reloading page to get new token');
            window.location.reload();
            return Promise.reject(error);
        }
        
        // Handle timeout errors
        if (error.code === 'ECONNABORTED') {
            errorLog('Request timeout - server might be slow or unavailable', {
                url: originalRequest?.url,
                timeout: config.apiTimeout
            });
        }
        
        // Handle network errors with retry logic (production only)
        if (config.isProduction && !originalRequest._retry && shouldRetry(error)) {
            originalRequest._retry = true;
            originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
            
            if (originalRequest._retryCount <= config.retryAttempts) {
                warnLog(`Retrying request (${originalRequest._retryCount}/${config.retryAttempts})`, {
                    url: originalRequest.url,
                    error: error.message
                });
                
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, config.retryDelay));
                return axios(originalRequest);
            }
        }
        
        // Log the final error
        errorLog('Request failed', {
            url: originalRequest?.url,
            status: error.response?.status,
            message: error.message,
            retries: originalRequest?._retryCount || 0
        });
        
        return Promise.reject(error);
    },
);

/**
 * Determine if a request should be retried
 */
function shouldRetry(error: any): boolean {
    // Don't retry client errors (4xx)
    if (error.response?.status >= 400 && error.response?.status < 500) {
        return false;
    }
    
    // Retry server errors (5xx) and network errors
    return (
        error.response?.status >= 500 ||
        error.code === 'NETWORK_ERROR' ||
        error.code === 'ECONNABORTED' ||
        !error.response
    );
}

export default axios;
