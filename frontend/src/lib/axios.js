import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    if (!config || error.response?.status === 401 || error.response?.status === 403) {
      return Promise.reject(error);
    }

    if (!config._retryCount) {
      config._retryCount = 0;
    }

    if (config._retryCount < MAX_RETRIES) {
      config._retryCount += 1;
      console.log(`Retrying request (${config._retryCount}/${MAX_RETRIES})...`);
      
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * config._retryCount));
      return api(config);
    }

    return Promise.reject(error);
  }
);

export default api;
