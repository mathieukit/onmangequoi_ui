import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useRecipes } from '../../hooks/useRecipes';
import type { Recipe } from '../../types';
import './RecipeStyles.css';

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
    return (
      <div className="loading-modern">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading recipe...</div>
      </div>
    );
  }

  if (error) {
    return <div className="error-message"><i className="error-icon">⚠️</i> {error}</div>;
  }

  if (!recipe) {
    return (
      <div className="loading-modern">
        <div className="loading-text">Recipe not found</div>
      </div>
    );
  }

  return (
    <div className="recipe-detail-container">
      <div className="recipe-detail-header">
        <h1>{recipe.name}</h1>
        <div className="recipe-type-badge">{recipe.mealType}</div>
      </div>

      <div className="recipe-detail-content">
        <div className="recipe-summary">
          <div className="recipe-info-box">
            <i className="recipe-info-icon large">🍽️</i>
            <div className="recipe-info-label">{recipe.mealType}</div>
          </div>
          <div className="recipe-info-box">
            <i className="recipe-info-icon large">📋</i>
            <div className="recipe-info-label">{recipe.ingredients.length} Ingredients</div>
          </div>
        </div>
        
        <div className="recipe-ingredients">
          <h2><i className="recipe-info-icon">📋</i> Ingredients</h2>
          <ul className="ingredients-list">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="ingredient-item">
                {ingredient.unit === 'to taste' ? (
                  <>
                    <span className="ingredient-special-unit">
                      <span className="unit-icon">🧂</span>
                      <span className="unit-text">to taste</span>
                    </span>
                    <span className="ingredient-name">{ingredient.item}</span>
                  </>
                ) : (
                  <>
                    <span className="ingredient-quantity">{ingredient.quantity || '—'}</span>
                    <span className="ingredient-unit">{ingredient.unit}</span>
                    <span className="ingredient-name">{ingredient.item}</span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="recipe-actions">
        <Link to="/recipes" className="btn-secondary">
          <i>⬅️</i> Back to Recipes
        </Link>
        <button 
          onClick={handleRemoveRecipe}
          className="btn-danger"
        >
          <i>🗑️</i> Remove Recipe
        </button>
      </div>
    </div>
  );
};

export default RecipeDetail;
