import axios from 'axios';
import type { Recipe, GroceryItem, WeeklyMenu, ApiResponse } from '../types';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:8000', // Adjust this to match your backend URL
});

// Add request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth services
export const authService = {
  register: async (username: string, password: string): Promise<ApiResponse<void>> => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    const response = await api.post('/register', formData);
    return response.data;
  },

  login: async (username: string, password: string): Promise<{ access_token: string; token_type: string }> => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    const response = await api.post('/login', formData);
    return response.data;
  },
};

// Recipe services
export const recipeService = {
  getRecipes: async (): Promise<ApiResponse<Recipe[]>> => {
    const response = await api.get('/get_recipes');
    return response.data;
  },

  addRecipe: async (recipe: Recipe): Promise<ApiResponse<Recipe>> => {
    const response = await api.post('/add_recipe', recipe);
    return response.data;
  },

  removeRecipe: async (recipeName: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/recipes/${recipeName}`);
    return response.data;
  },
};

// Menu and grocery list services
// All endpoints below require authentication (token in Authorization header)
export const menuService = {
  generateGroceryList: async (recipeNames: string[]): Promise<ApiResponse<GroceryItem[]>> => {
    const response = await api.post('/grocery-list', recipeNames);
    return response.data;
  },

  // Calls /weekly-menu with optional grocery list, always sends auth token
  generateWeeklyMenu: async (includeGroceryList: boolean = false): Promise<{
    message: string;
    menu: WeeklyMenu;
    grocery_list?: GroceryItem[];
  }> => {
    const response = await api.get(`/weekly-menu?include_grocery_list=${includeGroceryList}`);
    return response.data;
  },
};

export default api;
