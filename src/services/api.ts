import axios from 'axios';
import type { Recipe, GroceryItem, WeeklyMenu, ApiResponse, Menu, MenuSummary } from '../types';

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
    // We're sending recipe_names as the body (one entry per serving)
    // This matches the FastAPI endpoint that expects: list[str]
    const response = await api.post('/grocery-list', recipeNames);
    return response.data;
  },
  
  // Create a menu draft with specific dates and number of people
  createMenuDraft: async (menuName: string, dates: string[], peopleCount: number): Promise<{
    message: string;
    menu: Menu;
  }> => {
    try {
      // After multiple attempts, let's use a direct fetch approach to have more control over the request
      const baseUrl = api.defaults.baseURL || '';
      const token = localStorage.getItem('token');
      
      // Create query string for menu_name and people_count
      const queryString = `?menu_name=${encodeURIComponent(menuName)}&people_count=${peopleCount}`;
      
      // Create request options
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(dates) // Send dates as JSON array
      };
      
      // Log the exact request for debugging
      console.log('Sending request to:', `${baseUrl}/create-menu-draft${queryString}`);
      console.log('Request options:', {
        method: requestOptions.method,
        headers: requestOptions.headers,
        body: requestOptions.body
      });
      
      // Create fetch request with proper headers
      const response = await fetch(`${baseUrl}/create-menu-draft${queryString}`, requestOptions);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API call error details:', error);
      throw error;
    }
  },
  
  // Save a menu to the database
  saveMenu: async (menu: Menu): Promise<{
    message: string;
    menu_id: number;
    name: string;
  }> => {
    const response = await api.post('/save-menu', menu);
    return response.data;
  },
  
  // Get all menus
  getMenus: async (): Promise<{
    message: string;
    menus: MenuSummary[];
  }> => {
    const response = await api.get('/get-menus');
    return response.data;
  },
  
  // Get a specific menu
  getMenu: async (menuId: number): Promise<{
    message: string;
    menu: Menu;
  }> => {
    const response = await api.get(`/get-menu/${menuId}`);
    return response.data;
  },
  
  // Delete a menu
  deleteMenu: async (menuId: number): Promise<{
    message: string;
  }> => {
    const response = await api.delete(`/delete-menu/${menuId}`);
    return response.data;
  },
  
  // Legacy method for backward compatibility
  generateWeeklyMenu: async (_includeGroceryList: boolean = false): Promise<{
    message: string;
    menu: WeeklyMenu;
    grocery_list?: GroceryItem[];
  }> => {
    // This is now deprecated - create a menu draft for the current week instead
    const today = new Date();
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return date.toISOString().split('T')[0];
    });
    
    const response = await menuService.createMenuDraft("Weekly Menu", weekDates, 1);
    return {
      message: response.message,
      menu: response.menu as any as WeeklyMenu // Type conversion for backward compatibility
    };
  },
};

export default api;
