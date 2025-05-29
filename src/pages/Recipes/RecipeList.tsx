import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRecipes } from '../../hooks/useRecipes';
import './RecipeStyles.css';

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
  
  // Close dropdown when clicking outside
  useEffect(() => {
    if (dropdownOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        // Check if the clicked element is not part of the dropdown
        const dropdown = document.querySelector('.custom-dropdown');
        if (dropdown && !dropdown.contains(event.target as Node)) {
          setDropdownOpen(false);
        }
      };
      
      // Add event listener
      document.addEventListener('mousedown', handleClickOutside);
      
      // Clean up the event listener
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);
  
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
    return (
      <div className="loading-modern">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading recipes...</div>
      </div>
    );
  }

  if (error) {
    return <div className="error-message"><i className="error-icon">⚠️</i> {error}</div>;
  }

  return (
    <div className="recipe-list-container">
      <div className="recipe-list-header">
        <h1 className="recipe-list-title">
          <i className="recipe-list-icon">🍽️</i>
          My Recipes
        </h1>
        <Link to="/recipes/add" className="btn-add-recipe">
          <i>➕</i> Add New Recipe
        </Link>
      </div>

      <div className="filter-controls-modern">
        <label htmlFor="filter-type" className="filter-label">
          <i className="filter-icon">🔍</i>
          Filter by meal type
        </label>
        <div className="custom-dropdown" tabIndex={0} onBlur={() => setDropdownOpen(false)}>
          <button
            type="button"
            className="custom-dropdown-btn"
            onClick={() => {
              // Simply toggle dropdown state
              setDropdownOpen((open) => !open);
            }}
          >
            {mealTypes.find(t => t.value === filterType)?.label}
            <span className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`}>▼</span>
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
          <div className="empty-state-icon">📝</div>
          <h3 className="empty-state-title">No recipes found</h3>
          <p>Add your first recipe to get started!</p>
          <div className="empty-state-actions">
            <Link to="/recipes/add" className="btn-add-recipe">
              <i>➕</i> Create Recipe
            </Link>
          </div>
        </div>
      ) : (
        <div className="recipe-grid">
          {displayedRecipes.map((recipe) => (
            <div key={recipe.id || recipe.name} className="recipe-card">
              <div className="recipe-card-image">
                <span className="recipe-card-image-icon">🍽️</span>
              </div>
              <div className="recipe-card-content">
                <h3>{recipe.name}</h3>
                <span className="recipe-type-badge">{recipe.mealType}</span>
                <div className="recipe-info">
                  <i className="recipe-info-icon">📋</i>
                  {Array.isArray(recipe.ingredients) ? recipe.ingredients.length : 0} ingredients
                </div>
                
                <div className="recipe-card-actions">
                  <Link to={`/recipes/${recipe.id}`} className="btn-view-recipe">
                    <i>👁️</i> View Details
                  </Link>
                  <button 
                    onClick={() => handleRemoveRecipe(recipe.name)}
                    className="btn-remove-recipe"
                  >
                    <i>🗑️</i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeList;
