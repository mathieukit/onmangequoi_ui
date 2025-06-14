import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipes } from '../../hooks/useRecipes';
import { recipeService } from '../../services/api';
import type { Ingredient } from '../../types';
import './RecipeStyles.css';

const AddRecipe: React.FC = () => {
  const navigate = useNavigate();
  const { addRecipe, loading, error } = useRecipes();
  
  const [name, setName] = useState('');
  const [mealType, setMealType] = useState('déjeuner');
  const [mealTypeDropdownOpen, setMealTypeDropdownOpen] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { item: '', quantity: 0, unit: '' }
  ]);
  const [formError, setFormError] = useState<string | null>(null);
  const [importUrl, setImportUrl] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const mealTypes = [
    { value: 'petit déjeuner', label: 'Breakfast' },
    { value: 'déjeuner', label: 'Lunch' },
    { value: 'dîner', label: 'Dinner' },
  ];

  // Fix: close dropdown on selection and update mealType
  const handleSelectMealType = (value: string) => {
    setMealType(value);
    setMealTypeDropdownOpen(false);
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { item: '', quantity: 0, unit: '' }]);
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIngredients(newIngredients);
  };

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string | number) => {
    const newIngredients = [...ingredients];
    if (field === 'quantity') {
      // If input is empty, treat as 0 for state, but allow UI to show empty
      newIngredients[index][field] = value === '' ? 0 : parseFloat(value as string) || 0;
    } else {
      newIngredients[index][field] = value as string;
    }
    setIngredients(newIngredients);
  };

  const handleSetToTaste = (index: number) => {
    const newIngredients = [...ingredients];
    newIngredients[index].quantity = 0;
    newIngredients[index].unit = 'to taste';
    setIngredients(newIngredients);
  };

  const handleClearSpecialUnit = (index: number) => {
    const newIngredients = [...ingredients];
    if (newIngredients[index].unit === 'to taste') {
      newIngredients[index].unit = '';
      newIngredients[index].quantity = 1; // Set a default quantity
    }
    setIngredients(newIngredients);
  };

  const validateForm = () => {
    if (!name.trim()) {
      setFormError('Recipe name is required');
      return false;
    }

    if (ingredients.length === 0) {
      setFormError('At least one ingredient is required');
      return false;
    }

    for (const ingredient of ingredients) {
      if (!ingredient.item.trim()) {
        setFormError('All ingredients must have a name');
        return false;
      }
      // Allow quantity 0 only if unit is 'to taste'
      if (ingredient.quantity <= 0 && !['to taste'].includes((ingredient.unit || '').toLowerCase())) {
        setFormError('All ingredients must have a positive quantity or be marked as "to taste"');
        return false;
      }
      if (!ingredient.unit.trim()) {
        setFormError('All ingredients must have a unit (or use "to taste")');
        return false;
      }
    }

    setFormError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const recipe = {
      name,
      mealType,
      ingredients,
    };
    
    const success = await addRecipe(recipe);
    if (success) {
      navigate('/recipes');
    }
  };

  // Import recipe from URL
  const handleImportFromUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportError(null);
    setImportLoading(true);
    try {
      const { recipe } = await recipeService.parseRecipeUrl(importUrl);
      setName(recipe.name || '');
      setMealType(recipe.mealType || 'déjeuner');
      // Map API ingredient fields to UI fields
      const mappedIngredients = Array.isArray(recipe.ingredients)
        ? recipe.ingredients.map((ing: any) => ({
            item: ing.item || ing.name || '',
            quantity: parseFloat(ing.quantity) || (ing.quantity === 'to taste' ? ing.quantity : 0),
            unit: ing.unit || '',
          }))
        : [{ item: '', quantity: 0, unit: '' }];
      setIngredients(mappedIngredients.length > 0 ? mappedIngredients : [{ item: '', quantity: 0, unit: '' }]);
    } catch (err: any) {
      setImportError(err.response?.data?.detail || err.message || 'Failed to import recipe from URL');
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="add-recipe-container">
      {/* Header Section */}
      <div className="add-recipe-header">
        <div className="header-content">
          <div className="header-icon">
            <i className="recipe-icon">👨‍🍳</i>
          </div>
          <div className="header-text">
            <h1>Create New Recipe</h1>
            <p className="header-subtitle">Share your culinary masterpiece with the world</p>
          </div>
        </div>
      </div>

      {/* Import from URL Section */}
      <div className="import-url-section">
        <div className="section-header">
          <h2>
            <i className="section-icon">🔗</i>
            Quick Import
          </h2>
          <p className="section-description">Import a recipe directly from a website URL</p>
        </div>
        <form onSubmit={handleImportFromUrl} className="import-form">
          <div className="import-url-container">
            <div className="input-group">
              <input
                type="url"
                id="import-url"
                className="import-url-input"
                value={importUrl}
                onChange={e => setImportUrl(e.target.value)}
                placeholder="https://example.com/recipe-url"
                disabled={importLoading}
              />
              <button 
                type="submit" 
                className="btn-import" 
                disabled={importLoading || !importUrl.trim()}
              >
                {importLoading ? (
                  <>
                    <div className="loading-spinner-small"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <i className="import-icon">📥</i>
                    Import Recipe
                  </>
                )}
              </button>
            </div>
            <div className="supported-sites">
              <span className="sites-label">Supported:</span>
              <div className="site-badges">
                <span className="site-badge">Marmiton</span>
                <span className="site-badge">AllRecipes</span>
                <span className="site-badge">750g</span>
                <span className="site-badge">+More</span>
              </div>
            </div>
          </div>
        </form>
        {importError && (
          <div className="error-message">
            <i className="error-icon">⚠️</i> 
            <span>{importError}</span>
          </div>
        )}
      </div>
      
      {/* Error Display */}
      {(formError || error) && (
        <div className="error-message global-error">
          <div className="error-content">
            <i className="error-icon">⚠️</i>
            <div className="error-text">
              <strong>Error:</strong>
              <span>{formError || error}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Recipe Form */}
      <div className="recipe-form-section">
        <div className="section-header">
          <h2>
            <i className="section-icon">📝</i>
            Recipe Details
          </h2>
          <p className="section-description">Fill in the basic information about your recipe</p>
        </div>
        
        <form onSubmit={handleSubmit} className="recipe-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                <i className="label-icon">🍽️</i>
                Recipe Name
                <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g., Grandma's Secret Pasta"
                maxLength={100}
              />
              <div className="input-hint">Give your recipe a memorable name</div>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="mealType" className="form-label">
                <i className="label-icon">🕐</i>
                Meal Type
                <span className="required">*</span>
              </label>
              <div 
                className="custom-dropdown" 
                tabIndex={0} 
                onBlur={() => setMealTypeDropdownOpen(false)}
              >
                <button
                  type="button"
                  className="custom-dropdown-btn"
                  onClick={() => setMealTypeDropdownOpen((open) => !open)}
                  aria-haspopup="listbox"
                  aria-expanded={mealTypeDropdownOpen}
                >
                  <span className="dropdown-selected">
                    <i className="meal-icon">
                      {mealType === 'petit déjeuner' ? '🌅' : 
                       mealType === 'déjeuner' ? '☀️' : '🌙'}
                    </i>
                    {mealTypes.find(t => t.value === mealType)?.label}
                  </span>
                  <span className={`dropdown-arrow ${mealTypeDropdownOpen ? 'open' : ''}`}>
                    <i>▼</i>
                  </span>
                </button>
                {mealTypeDropdownOpen && (
                  <ul className="custom-dropdown-list" role="listbox">
                    {mealTypes.map((type) => (
                      <li
                        key={type.value}
                        className={`custom-dropdown-item${mealType === type.value ? ' selected' : ''}`}
                        role="option"
                        aria-selected={mealType === type.value}
                        onMouseDown={() => handleSelectMealType(type.value)}
                      >
                        <i className="meal-icon">
                          {type.value === 'petit déjeuner' ? '🌅' : 
                           type.value === 'déjeuner' ? '☀️' : '🌙'}
                        </i>
                        {type.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="input-hint">When is this meal typically enjoyed?</div>
            </div>
          </div>
          
          <div className="ingredients-section">
            <div className="section-header">
              <h3>
                <i className="section-icon">📋</i>
                Ingredients
                <span className="required">*</span>
              </h3>
              <p className="section-description">Add all the ingredients needed for your recipe</p>
            </div>
            
            <div className="ingredients-list">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="ingredient-row modern">
                  <div className="ingredient-number">
                    <span>{index + 1}</span>
                  </div>
                  <div className="ingredient-fields">
                    <div className="form-group ingredient-name-group">
                      <label htmlFor={`item-${index}`} className="form-label-inline">
                        <i className="label-icon">🥕</i>
                        Ingredient
                      </label>
                      <input
                        type="text"
                        id={`item-${index}`}
                        className="form-input"
                        value={ingredient.item}
                        onChange={(e) => handleIngredientChange(index, 'item', e.target.value)}
                        required
                        placeholder="e.g., Fresh tomatoes, Sea salt, Extra virgin olive oil"
                      />
                    </div>
                    
                    {ingredient.unit === 'to taste' ? (
                      <div className="form-group to-taste-display">
                        <label className="form-label-inline">Amount</label>
                        <div className="to-taste-indicator">
                          <span className="to-taste-badge">
                            <span className="unit-icon">🧂</span>
                            <span className="unit-text">To taste</span>
                          </span>
                          <button
                            type="button"
                            className="btn-switch-mode"
                            onClick={() => handleClearSpecialUnit(index)}
                            title="Switch to specific amount"
                          >
                            <i>⚖️</i>
                            Specific amount
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="form-group quantity-unit-group">
                        <label className="form-label-inline">
                          <i className="label-icon">📏</i>
                          Amount & Unit
                        </label>
                        <div className="quantity-unit-container">
                          <input
                            type="number"
                            value={ingredient.quantity || ''}
                            onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                            step="0.01"
                            min="0"
                            placeholder="2"
                            className="quantity-input"
                          />
                          <input
                            type="text"
                            value={ingredient.unit}
                            onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                            placeholder="cups, tbsp, kg, pieces"
                            className="unit-input"
                            required
                          />
                          <button
                            type="button"
                            className="btn-to-taste"
                            onClick={() => handleSetToTaste(index)}
                            title="Mark as 'to taste'"
                          >
                            <i>🧂</i>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove-ingredient"
                      onClick={() => handleRemoveIngredient(index)}
                      aria-label="Remove ingredient"
                    >
                      <i>🗑️</i>
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <button
              type="button"
              className="btn-add-ingredient"
              onClick={handleAddIngredient}
            >
              <i className="add-icon">➕</i>
              Add Another Ingredient
            </button>
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/recipes')}
            >
              <i>✖️</i> 
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner-small"></div>
                  Saving Recipe...
                </>
              ) : (
                <>
                  <i>💾</i> 
                  Save Recipe
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecipe;
