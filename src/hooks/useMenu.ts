import { useState, useCallback } from 'react';
import { menuService } from '../services/api';
import type { WeeklyMenu, GroceryItem } from '../types';

export const useMenu = () => {
  const [weeklyMenu, setWeeklyMenu] = useState<WeeklyMenu | null>(null);
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const generateGroceryList = useCallback(async (recipeNames: string[]) => {
    try {
      setLoading(true);
      setError(null);
      const response = await menuService.generateGroceryList(recipeNames);
      
      if (response.ingredients) {
        setGroceryList(response.ingredients);
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
    weeklyMenu,
    groceryList,
    loading,
    error,
    generateWeeklyMenu,
    generateGroceryList,
  };
};
