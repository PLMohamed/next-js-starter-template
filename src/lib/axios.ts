import { API_URL } from '@/constants/api';
import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL: API_URL,
});

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response.status === 403)
            window?.location?.reload();

        return Promise.reject(error);
    }
);