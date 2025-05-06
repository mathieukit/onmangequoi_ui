'use client';

import { useState, useEffect } from 'react';
import { getRecipes, deleteRecipe } from '@/services/api';
import RecipeCard from '@/components/RecipeCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Recipe } from '@/types';

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterMealType, setFilterMealType] = useState<string>('all');

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getRecipes();
      setRecipes(data);
    } catch (err) {
      setError('Failed to load recipes. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = async (recipeName: string) => {
    if (window.confirm(`Are you sure you want to delete "${recipeName}"?`)) {
      try {
        const success = await deleteRecipe(recipeName);
        
        if (success) {
          // Remove the recipe from the local state
          setRecipes(recipes.filter(recipe => recipe.name !== recipeName));
        } else {
          setError('Failed to delete recipe. Please try again.');
        }
      } catch (err) {
        setError('An error occurred while deleting the recipe.');
        console.error(err);
      }
    }
  };

  const filteredRecipes = filterMealType === 'all'
    ? recipes
    : recipes.filter(recipe => recipe.mealType === filterMealType);

  return (
    <div className="max-w-6xl mx-auto">
      <section className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4 text-[var(--primary)]">Recettes</h1>
        <p className="mb-6">Parcourez et gérez vos recettes</p>
        
        {error && (
          <div className="text-red-500 mb-4">{error}</div>
        )}
        
        <div className="mb-6">
          <label htmlFor="filterMealType" className="mr-2">Filtrer par type de repas:</label>
          <select
            id="filterMealType"
            value={filterMealType}
            onChange={(e) => setFilterMealType(e.target.value)}
            className="input"
          >
            <option value="all">Tous les repas</option>
            <option value="petit déjeuner">Breakfast (Petit déjeuner)</option>
            <option value="déjeuner">Lunch (Déjeuner)</option>
            <option value="dîner">Dinner (Dîner)</option>
          </select>
        </div>
      </section>
      
      {loading ? (
        <div className="text-center py-12">
          <LoadingSpinner size="large" />
          <p className="mt-4">Chargement des recettes...</p>
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-lg mb-4">Aucune recette</p>
          <p>
            {filterMealType !== 'all'
              ? `No recipes found for the selected meal type. Try a different filter or add new recipes.`
              : `You haven't added any recipes yet. Add your first recipe to get started.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.name}
              recipe={recipe}
              onDelete={handleDeleteRecipe}
            />
          ))}
        </div>
      )}
    </div>
  );
}
