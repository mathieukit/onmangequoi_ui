import { useState, useCallback } from 'react';
import { menuService } from '../services/api';
import type { WeeklyMenu, GroceryItem, Menu, MenuSummary, MealServing } from '../types';
import { useRecipes } from './useRecipes';

export const useMenu = () => {
  // Legacy state for backward compatibility
  const [weeklyMenu, setWeeklyMenu] = useState<WeeklyMenu | null>(null);
  
  // New states for updated menu system
  const [menuDraft, setMenuDraft] = useState<Menu | null>(null);
  const [savedMenus, setSavedMenus] = useState<MenuSummary[]>([]);
  const [currentMenu, setCurrentMenu] = useState<Menu | null>(null);
  
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { recipes } = useRecipes();

  // Legacy method for backward compatibility
  const generateWeeklyMenu = useCallback(async (includeGroceryList: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const response = await menuService.generateWeeklyMenu(includeGroceryList);
      
      if (response.menu) {
        setWeeklyMenu(response.menu);
      }
      
      if (includeGroceryList && response.grocery_list) {
        setGroceryList(response.grocery_list);
      }
      
      return true;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate weekly menu');
      console.error('Error generating weekly menu:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new menu draft
  const createMenuDraft = useCallback(async (menuName: string, dates: string[], peopleCount: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await menuService.createMenuDraft(menuName, dates, peopleCount);
      
      if (response.menu) {
        setMenuDraft(response.menu);
        setCurrentMenu(response.menu);
      }
      
      return true;
    } catch (err: any) {
      // Enhanced error handling to provide better debug information
      let errorMessage = 'Failed to create menu draft';
      
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          // Format FastAPI validation errors
          const errors = err.response.data.detail.map((e: any) => {
            const location = e.loc.join('.');
            const input = e.input ? `\nInput: ${JSON.stringify(e.input)}` : '';
            return `${location}: ${e.msg}${input}`;
          }).join('\n\n');
          errorMessage = `Validation errors:\n${errors}`;
        } else {
          errorMessage = err.response.data.detail;
        }
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }
      
      setError(errorMessage);
      console.error('Error creating menu draft:', err);
      if (err.response) {
        console.error('API response:', err.response.data);
        console.error('Response status:', err.response.status);
        console.error('Response headers:', err.response.headers);
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Save the current menu to database
  const saveMenu = useCallback(async (menu: Menu) => {
    try {
      setLoading(true);
      setError(null);
      const response = await menuService.saveMenu(menu);
      
      // After saving, refresh the list of saved menus
      await fetchSavedMenus();
      
      return response;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save menu');
      console.error('Error saving menu:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all saved menus
  const fetchSavedMenus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await menuService.getMenus();
      
      if (response.menus) {
        setSavedMenus(response.menus);
      }
      
      return response.menus;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch saved menus');
      console.error('Error fetching saved menus:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get a specific menu by ID
  const fetchMenu = useCallback(async (menuId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await menuService.getMenu(menuId);
      
      if (response.menu) {
        setCurrentMenu(response.menu);
      }
      
      return response.menu;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch menu');
      console.error('Error fetching menu:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a menu
  const deleteMenu = useCallback(async (menuId: number) => {
    try {
      setLoading(true);
      setError(null);
      await menuService.deleteMenu(menuId);
      
      // After deleting, refresh the list of saved menus
      await fetchSavedMenus();
      
      return true;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete menu');
      console.error('Error deleting menu:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update meal servings in the draft menu
  const updateMealServings = useCallback((dayIndex: number, mealType: 'breakfast' | 'lunch' | 'dinner', mealIndex: number, peopleCount: number) => {
    if (!menuDraft) return;
    
    const updatedMenu = { ...menuDraft };
    const day = { ...updatedMenu.days[dayIndex] };
    const mealSlot = { ...day[mealType] };
    const meals = [...mealSlot.meals];
    
    // Update the specific meal's people count
    meals[mealIndex] = { ...meals[mealIndex], people_count: peopleCount };
    
    // Update the nested structure
    mealSlot.meals = meals;
    day[mealType] = mealSlot;
    updatedMenu.days[dayIndex] = day;
    
    setMenuDraft(updatedMenu);
    setCurrentMenu(updatedMenu);
  }, [menuDraft]);

  // Remove a meal from the menu
  const removeMeal = useCallback((dayIndex: number, mealType: 'breakfast' | 'lunch' | 'dinner', mealIndex: number) => {
    if (!menuDraft) return;
    
    const updatedMenu = { ...menuDraft };
    const day = { ...updatedMenu.days[dayIndex] };
    const mealSlot = { ...day[mealType] };
    
    // Filter out the meal at the specified index
    const meals = mealSlot.meals.filter((_, index) => index !== mealIndex);
    
    // Update the nested structure
    mealSlot.meals = meals;
    day[mealType] = mealSlot;
    updatedMenu.days[dayIndex] = day;
    
    setMenuDraft(updatedMenu);
    setCurrentMenu(updatedMenu);
  }, [menuDraft]);

  // Add a meal to the menu
  const addMeal = useCallback((dayIndex: number, mealType: 'breakfast' | 'lunch' | 'dinner', meal: MealServing) => {
    if (!menuDraft) return;
    
    const updatedMenu = { ...menuDraft };
    const day = { ...updatedMenu.days[dayIndex] };
    const mealSlot = { ...day[mealType] };
    
    // Add the new meal
    const meals = [...mealSlot.meals, meal];
    
    // Update the nested structure
    mealSlot.meals = meals;
    day[mealType] = mealSlot;
    updatedMenu.days[dayIndex] = day;
    
    setMenuDraft(updatedMenu);
    setCurrentMenu(updatedMenu);
  }, [menuDraft]);

  // Generate grocery list
  const generateGroceryList = useCallback(async (recipeIds: number[]) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await menuService.generateGroceryList(recipeIds);
      
      // Check for different possible response formats
      if (response.ingredients) {
        setGroceryList(response.ingredients);
      } else if (Array.isArray(response) && response.length > 0) {
        // If the API returns a direct array
        setGroceryList(response);
      } else if (response.grocery_list) {
        // Alternate response format
        setGroceryList(response.grocery_list);
      } else {
        console.warn('Unexpected response format:', response);
        setGroceryList([]);
      }
      
      return true;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate grocery list');
      console.error('Error generating grocery list:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // Legacy properties
    weeklyMenu,
    
    // New properties
    menuDraft,
    savedMenus,
    currentMenu,
    groceryList,
    loading,
    error,
    recipes,
    
    // Methods
    generateWeeklyMenu,
    createMenuDraft,
    saveMenu,
    fetchSavedMenus,
    fetchMenu,
    deleteMenu,
    updateMealServings,
    removeMeal,
    addMeal,
    generateGroceryList,
  };
};
