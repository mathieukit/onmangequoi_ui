import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRecipes } from '../../hooks/useRecipes';

const RecipeList: React.FC = () => {
  const { recipes, loading, error, removeRecipe } = useRecipes();
  const [filterType, setFilterType] = useState<string>('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const mealTypes = [
    { value: 'all', label: 'All Recipes' },
    { value: 'petit déjeuner', label: 'Breakfast' },
    { value: 'déjeuner', label: 'Lunch' },
    { value: 'dîner', label: 'Dinner' },
  ];
  
  // Group recipes by meal type
  const recipesByType: Record<string, typeof recipes> = {
    all: recipes,
    'petit déjeuner': recipes.filter(recipe => recipe.mealType === 'petit déjeuner'),
    'déjeuner': recipes.filter(recipe => recipe.mealType === 'déjeuner'),
    'dîner': recipes.filter(recipe => recipe.mealType === 'dîner'),
  };

  const displayedRecipes = recipesByType[filterType] || recipes;

  const handleRemoveRecipe = async (recipeName: string) => {
    if (window.confirm(`Are you sure you want to remove "${recipeName}"?`)) {
      await removeRecipe(recipeName);
    }
  };

  if (loading) {
    return <div className="loading">Loading recipes...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="recipe-list-container">
      <div className="recipe-list-header">
        <h1>My Recipes</h1>
        <Link to="/recipes/add" className="btn-primary">
          Add New Recipe
        </Link>
      </div>

      <div className="filter-controls modern-filter">
        <label htmlFor="filter-type" className="filter-label">Filter by type:</label>
        <div className="custom-dropdown" tabIndex={0} onBlur={() => setDropdownOpen(false)}>
          <button
            type="button"
            className="custom-dropdown-btn"
            onClick={() => setDropdownOpen((open) => !open)}
          >
            {mealTypes.find(t => t.value === filterType)?.label}
            <span className="dropdown-arrow">▼</span>
          </button>
          {dropdownOpen && (
            <ul className="custom-dropdown-list">
              {mealTypes.map((type) => (
                <li
                  key={type.value}
                  className={`custom-dropdown-item${filterType === type.value ? ' selected' : ''}`}
                  onMouseDown={() => {
                    setFilterType(type.value);
                    setDropdownOpen(false);
                  }}
                >
                  {type.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {displayedRecipes.length === 0 ? (
        <div className="empty-state">
          <p>No recipes found. Add your first recipe!</p>
        </div>
      ) : (
        <div className="recipe-grid">
          {displayedRecipes.map((recipe) => (
            <div key={recipe.id || recipe.name} className="recipe-card">
              <h3>{recipe.name}</h3>
              <p className="recipe-type">{recipe.mealType}</p>
              <p>{Array.isArray(recipe.ingredients) ? recipe.ingredients.length : 0} ingredients</p>
              
              <div className="recipe-card-actions">
                <Link to={`/recipes/${recipe.id}`} className="btn-secondary">
                  View Details
                </Link>
                <button 
                  onClick={() => handleRemoveRecipe(recipe.name)}
                  className="btn-danger"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeList;
