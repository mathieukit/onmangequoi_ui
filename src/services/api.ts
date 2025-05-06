import { Recipe, RecipesResponse, WeeklyMenuResponse, GroceryListResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Fetch all recipes from the API
 */
export async function getRecipes(): Promise<Recipe[]> {
  try {
    const response = await fetch(`${API_URL}/get_recipes`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch recipes: ${response.status}`);
    }
    
    const data: RecipesResponse = await response.json();
    return data.recipes;
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return [];
  }
}

/**
 * Add a new recipe to the API
 */
export async function addRecipe(recipe: Recipe): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/add_recipe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipe),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error adding recipe:', error);
    return false;
  }
}

/**
 * Delete a recipe by name
 */
export async function deleteRecipe(recipeName: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/recipes/${encodeURIComponent(recipeName)}`, {
      method: 'DELETE',
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return false;
  }
}

/**
 * Generate a weekly menu
 */
export async function generateWeeklyMenu(includeGroceryList: boolean = false): Promise<WeeklyMenuResponse | null> {
  try {
    const response = await fetch(`${API_URL}/weekly-menu?include_grocery_list=${includeGroceryList}`);
    
    if (!response.ok) {
      throw new Error(`Failed to generate weekly menu: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error generating weekly menu:', error);
    return null;
  }
}

/**
 * Generate a grocery list for selected recipes
 */
export async function generateGroceryList(recipeNames: string[]): Promise<GroceryListResponse | null> {
  try {
    const response = await fetch(`${API_URL}/grocery-list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipeNames),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate grocery list: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error generating grocery list:', error);
    return null;
  }
}
