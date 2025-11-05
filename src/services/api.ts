import axios, { AxiosResponse } from 'axios';
import { IUser, IPlan, IProgress, IMeal, IDailyProgress, WorkoutData } from '../types/interfaces';
import config from './config';

const API_URL = config.baseURL;

const userClient = axios.create({
    baseURL: API_URL,
    timeout: 10000,
  });

const mealGenerationClient = axios.create({
    baseURL: API_URL,
    timeout: config.mealGenerationTimeout,
  });

// Helper function to get token from localStorage
const getAuthToken = (): string | null => {
    return localStorage.getItem('token');
};

// Helper function to get auth headers
const getAuthHeaders = (): { Authorization: string } | {} => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const getAllUsers = async (): Promise<IUser[]> => {
    try {
        const response: AxiosResponse<IUser[]> = await userClient.get<IUser[]>('/users');
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.message || 'Failed to fetch users. Please try again.');
        }
        throw new Error('An unexpected error occurred. Please try again.');
    }
}

const getUserById = async (id: string): Promise<IUser> => {
    try {
        const response: AxiosResponse<IUser> = await userClient.get<IUser>(`/users/${id}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.message || 'Failed to fetch user. Please try again.');
        }
        throw new Error('An unexpected error occurred. Please try again.');
    }
}

const saveUser = async (user: IUser): Promise<IUser> => {
    try {
        const response: AxiosResponse<IUser> = await userClient.post<IUser>('/users', user);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.message || 'Failed to save user. Please try again.');
        }
        throw new Error('An unexpected error occurred. Please try again.');
    }
}

const updateUser = async (id: string, user: IUser): Promise<IUser> => {
    try {
        const response: AxiosResponse<IUser> = await userClient.put<IUser>(`/users/${id}`, user, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.message || 'Failed to update user. Please try again.');
        }
        throw new Error('An unexpected error occurred. Please try again.');
    }
};

const deleteUser = async (id: string): Promise<void> => {
    try {
        await userClient.delete(`/users/${id}`, { headers: getAuthHeaders() });
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.message || 'Failed to delete user. Please try again.');
        }
        throw new Error('An unexpected error occurred. Please try again.');
    }
};

const login = async (email: string, password: string): Promise<string> => {
    try {
        const response: AxiosResponse<{ data: { token: string }, status: string }> = await userClient.post('/login', { email, password });
        return response.data.data.token;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.message || 'Failed to login. Please try again.');
        }
        throw new Error('An unexpected error occurred. Please try again.');
    }
};

    const signup = async (email: string, password: string, userData?: any): Promise<{ token: string; user: IUser; plan: IPlan }> => {
    try {
        const response: AxiosResponse<{ data: { user: IUser, plan: IPlan, token: string }, status: string }> = await userClient.post('/signup', { email, password, userData });
        return response.data.data;
    } catch (error) {   
        if (axios.isAxiosError(error)) {
            throw new Error(error.message || 'Failed to signup. Please try again.');
        }
        throw new Error('An unexpected error occurred. Please try again.');
    }
};

const fetchUser = async (token: string): Promise<{ user: IUser, plan: IPlan }> => {
    try {
        const response: AxiosResponse<{ data: { user: IUser, plan: IPlan } }> = await userClient.get('/users/me', { headers: { Authorization: `Bearer ${token}` } });
        return response.data.data;
    } catch (error) {
        throw new Error('Failed to fetch user. Please try again.');
    }
};

const oauthSignin = async (provider: string, idToken?: string, accessToken?: string): Promise<{ token: string; user: IUser }> => {
    try {
        const payload: any = { provider };
        
        if (idToken) {
            payload.idToken = idToken;
        }
        
        if (accessToken) {
            payload.accessToken = accessToken;
        }

        const response: AxiosResponse<{ token: string; user: IUser }> = await userClient.post(`/${provider}/signin`, payload);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'OAuth sign-in failed. Please try again.');
        }
        throw new Error('An unexpected error occurred during OAuth sign-in.');
    }
};

const oauthSignup = async (provider: string, idToken?: string, accessToken?: string): Promise<{ token: string; user: IUser }> => {
    try {
        const payload: any = { provider };
        
        if (idToken) {
            payload.idToken = idToken;
        }
        
        if (accessToken) {
            payload.accessToken = accessToken;
        }

        const response: AxiosResponse<{ token: string; user: IUser }> = await userClient.post(`/auth/${provider}/signup`, payload);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'OAuth sign-up failed. Please try again.');
        }
        throw new Error('An unexpected error occurred during OAuth sign-up.');
    }
};

const initiateOAuth = async (provider: string, action: 'signin' | 'signup' = 'signin'): Promise<string> => {
    try {
        const response: AxiosResponse<{ authUrl: string }> = await userClient.get(`/auth/${provider}`, {
            params: { action }
        });
        return response.data.authUrl;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to initiate OAuth. Please try again.');
        }
        throw new Error('An unexpected error occurred while initiating OAuth.');
    }
};

const getTodayProgress = async (userId: string): Promise<{  data: {progress: IDailyProgress, stats: any, message: string} }> => {
    try {
        const response: AxiosResponse<{ data: { progress: IDailyProgress, stats: any, message: string } }> = await userClient.get(`/progress/today/${userId}`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw new Error('Failed to get today progress. Please try again.');
    }
}

const generateMealPlan = async (userData: IUser, language: string): Promise<{data: any}> => {
    const payload = {
        userData,
        startDate: new Date().toISOString(),
        language,
        useMock: config.useMock
    }
    try {
        const response: AxiosResponse<{ data: any }> = await mealGenerationClient.post(`/plan/generate`, payload, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
            throw new Error('Meal plan generation is taking longer than expected. Please try again.');
        }
        throw new Error('Failed to generate meal plan. Please try again.');
    }
}

const updateProgress = async (userId: string, progress: IDailyProgress): Promise<{data: any}> => {
    const payload = {
        progress,
        useMock: config.useMock
    }
    try {
        const response: AxiosResponse<{ data: any }> = await userClient.put(`/progress/${userId}`, payload, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw new Error('Failed to update progress. Please try again.');
    }
}

const updateMealPlan = async (userId: string, mealPlan: IPlan): Promise<{data: any}> => {
    const payload = {
        mealPlan,
        useMock: config.useMock
    }
    try {
        const response: AxiosResponse<{ data: any }> = await userClient.put(`/plan/${userId}`, payload, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw new Error('Failed to update meal plan. Please try again.');
    }
}

const updateMealInPlan = async (userId: string, date: Date, meal: IMeal): Promise<{data: any}> => {
    const stringDate = new Date(date).toISOString();
    const payload = {
        date: stringDate,
        meal,
        useMock: config.useMock
    }
    try {
        const response: AxiosResponse<{ data: any }> = await userClient.put(`/plan/${userId}/update-meal`, payload, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw new Error('Failed to update meal. Please try again.');
    }
}

const addWaterGlass = async (userId: string, date: string, glasses: number): Promise<{data: any}> => {
    const payload = {
        glasses,
        date,
        useMock: config.useMock
    }
    try {
        const response: AxiosResponse<{ data: any }> = await userClient.post(`/progress/water/${userId}`, payload, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw new Error('Failed to add water glass. Please try again.');
    }
}

const addWorkout = async (userId: string, date: string, workout: WorkoutData): Promise<{data: any}> => {
    const dailyDate = new Date(date);
    dailyDate.setHours(0, 0, 0, 0);
    const payload = {
        date: dailyDate.toISOString(),
        workout,
        useMock: config.useMock
    }
    try {
        const response: AxiosResponse<{ data: any }> = await userClient.post(`/plan/${userId}/add-workout`, payload, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw new Error('Failed to add workout. Please try again.');
    }
}

const updateWorkout = async (userId: string, date: string, workout: WorkoutData): Promise<{data: any}> => {
    const dailyDate = new Date(date);
    dailyDate.setHours(0, 0, 0, 0);
    const payload = {
        date: dailyDate.toISOString(),
        workout,
        useMock: config.useMock
    }
    try {
        const response: AxiosResponse<{ data: any }> = await userClient.put(`/plan/${userId}/update-workout`, payload, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw new Error('Failed to update workout. Please try again.');
    }
}

const deleteWorkout = async (userId: string, date: string, workout: WorkoutData): Promise<{data: any}> => { 
    const dailyDate = new Date(date);
    dailyDate.setHours(0, 0, 0, 0);
    try {
        const response: AxiosResponse<{ data: any }> = await userClient.delete(`/plan/${userId}/delete-workout/day=${dailyDate.toISOString()}/workout=${workout.name}`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw new Error('Failed to delete workout. Please try again.');
    }
}

const completeWorkout = async (userId: string, date: string, workout: WorkoutData): Promise<{data: any}> => {
    const dailyDate = new Date(date);
    dailyDate.setHours(0, 0, 0, 0);
    const payload = {
        date: dailyDate.toISOString(),
        workout,
    }
    try {
        const response: AxiosResponse<{ data: any }> = await userClient.put(`/progress/workout-completed/${userId}`, payload, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw new Error('Failed to complete workout. Please try again.');
    }
}

const updateFavorite = async (userId: string, mealId: string, isFavorite: boolean): Promise<{data: any}> => {
    const payload = {
        mealId,
        isFavorite,
        useMock: config.useMock
    }
    try {
        const response: AxiosResponse<{ data: any }> = await userClient.put(`/users/${userId}/favorites`, payload, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            throw new Error('AUTH_ERROR');
        }
        throw new Error('Failed to update favorite. Please try again.');
    }
}

const getFavoritesByUserId = async (userId: string): Promise<{data: any}> => {
    try {
        const response: AxiosResponse<{ data: any }> = await userClient.get(`/users/${userId}/favorites`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw new Error('Failed to get favorites. Please try again.');
    }
}

export const userAPI = {
    getAllUsers,
    getUserById,
    saveUser,
    updateUser,
    deleteUser,
    login,
    signup,
    fetchUser,
    oauthSignin,
    oauthSignup,
    initiateOAuth,
    getTodayProgress,
    generateMealPlan,
    updateProgress,
    updateMealPlan,
    updateMealInPlan,
    addWaterGlass,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    completeWorkout,
    updateFavorite,
    getFavoritesByUserId
};

