import { useState, useEffect, useCallback } from 'react';
import { recipeService } from '../services/api';
import type { Recipe } from '../types';

export const useRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await recipeService.getRecipes();
      setRecipes(response.recipes || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch recipes');
      console.error('Error fetching recipes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const addRecipe = async (recipe: Recipe) => {
    try {
      setLoading(true);
      setError(null);
      await recipeService.addRecipe(recipe);
      // Refresh the recipes list
      await fetchRecipes();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add recipe');
      console.error('Error adding recipe:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeRecipe = async (recipeName: string) => {
    try {
      setLoading(true);
      setError(null);
      await recipeService.removeRecipe(recipeName);
      // Refresh the recipes list
      await fetchRecipes();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to remove recipe');
      console.error('Error removing recipe:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    recipes,
    loading,
    error,
    fetchRecipes,
    addRecipe,
    removeRecipe,
  };
};
