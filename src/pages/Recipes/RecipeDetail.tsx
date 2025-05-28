import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useRecipes } from '../../hooks/useRecipes';
import type { Recipe } from '../../types';

const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { recipes, loading, error, removeRecipe } = useRecipes();
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    if (recipes.length > 0 && id) {
      const recipeId = parseInt(id, 10);
      const foundRecipe = recipes.find(r => r.id === recipeId);
      
      if (foundRecipe) {
        setRecipe(foundRecipe);
      } else {
        // Recipe not found, redirect to recipes list
        navigate('/recipes');
      }
    }
  }, [recipes, id, navigate]);

  const handleRemoveRecipe = async () => {
    if (recipe && window.confirm(`Are you sure you want to remove "${recipe.name}"?`)) {
      const success = await removeRecipe(recipe.name);
      if (success) {
        navigate('/recipes');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading recipe...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!recipe) {
    return <div className="loading">Recipe not found</div>;
  }

  return (
    <div className="recipe-detail-container">
      <div className="recipe-detail-header">
        <h1>{recipe.name}</h1>
        <div className="recipe-type-badge">{recipe.mealType}</div>
      </div>

      <div className="recipe-detail-content">
        <div className="recipe-ingredients">
          <h2>Ingredients</h2>
          <ul className="ingredients-list">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="ingredient-item">
                <span className="ingredient-quantity">{ingredient.quantity}</span>
                <span className="ingredient-unit">{ingredient.unit}</span>
                <span className="ingredient-name">{ingredient.item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="recipe-actions">
        <Link to="/recipes" className="btn-secondary">
          Back to Recipes
        </Link>
        <button 
          onClick={handleRemoveRecipe}
          className="btn-danger"
        >
          Remove Recipe
        </button>
      </div>
    </div>
  );
};

export default RecipeDetail;
