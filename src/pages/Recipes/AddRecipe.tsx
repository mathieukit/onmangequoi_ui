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
      setMealType(recipe.mealType || 'Lunch');
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
      <h1>Add New Recipe</h1>

      {/* Import from URL */}
      <form onSubmit={handleImportFromUrl} className="form-group" style={{ marginBottom: 24 }}>
        <label htmlFor="import-url">Import from Recipe URL</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="url"
            id="import-url"
            value={importUrl}
            onChange={e => setImportUrl(e.target.value)}
            placeholder="Paste recipe URL (e.g. marmiton.org, allrecipes.com...)"
            style={{ flex: 1 }}
            disabled={importLoading}
            required
          />
          <button type="submit" className="btn-secondary" disabled={importLoading || !importUrl} style={{ minWidth: 120 }}>
            {importLoading ? 'Importing...' : 'Import'}
          </button>
        </div>
        {importError && <div className="error-message" style={{ marginTop: 8 }}><i className="error-icon">⚠️</i> {importError}</div>}
      </form>
      
      {(formError || error) && (
        <div className="error-message">
          <i className="error-icon">⚠️</i>
          {formError || error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="recipe-form">
        <div className="form-group">
          <label htmlFor="name">Recipe Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter recipe name"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="mealType">Meal Type</label>
          <div className="custom-dropdown" tabIndex={0} onBlur={() => setMealTypeDropdownOpen(false)}>
            <button
              type="button"
              className="custom-dropdown-btn"
              onClick={() => setMealTypeDropdownOpen((open) => !open)}
              aria-haspopup="listbox"
              aria-expanded={mealTypeDropdownOpen}
            >
              {mealTypes.find(t => t.value === mealType)?.label}
              <span className={`dropdown-arrow ${mealTypeDropdownOpen ? 'open' : ''}`}>▼</span>
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
                    {type.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <div className="ingredients-section">
          <h3><i className="recipe-info-icon">📋</i> Ingredients</h3>
          
          {ingredients.map((ingredient, index) => (
            <div key={index} className="ingredient-row">
              <div className="ingredient-fields">
                <div className="form-group">
                  <label htmlFor={`item-${index}`}>Item</label>
                  <input
                    type="text"
                    id={`item-${index}`}
                    value={ingredient.item}
                    onChange={(e) => handleIngredientChange(index, 'item', e.target.value)}
                    required
                    placeholder="Ingredient name"
                  />
                </div>
                
                <div className="form-group to-taste-group">
                  <label htmlFor={`quantity-${index}`}>
                    Quantity
                    {ingredient.unit === 'to taste' && (
                      <span className="quantity-helper">
                        • No specific amount needed
                      </span>
                    )}
                  </label>
                  <div className="quantity-controls">
                    <div className="quantity-input-wrapper">
                      <input
                        type="number"
                        id={`quantity-${index}`}
                        value={ingredient.unit === 'to taste' ? '' : ingredient.quantity || ''}
                        onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                        step="0.01"
                        min="0"
                        placeholder="0"
                        disabled={ingredient.unit === 'to taste'}
                        className={ingredient.unit === 'to taste' ? 'input-disabled' : ''}
                      />
                      {ingredient.unit === 'to taste' && (
                        <button
                          type="button"
                          className="btn-clear-special"
                          onClick={() => handleClearSpecialUnit(index)}
                          aria-label="Clear special unit"
                          title="Clear and enter quantity"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <div className="special-unit-buttons">
                      <button
                        type="button"
                        className={`btn-special-unit${ingredient.unit === 'to taste' ? ' active' : ''}`}
                        onClick={() => handleSetToTaste(index)}
                        aria-pressed={ingredient.unit === 'to taste'}
                        title="Use when exact amount depends on personal preference"
                      >
                        <span className="unit-icon" role="img" aria-label="to taste">🧂</span>
                        <span className="unit-text">To taste</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor={`unit-${index}`}>Unit</label>
                  <input
                    type="text"
                    id={`unit-${index}`}
                    value={ingredient.unit}
                    onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                    placeholder="g, ml, piece, etc."
                    required
                  />
                </div>
              </div>
              
              {ingredients.length > 1 && (
                <button
                  type="button"
                  className="btn-remove-recipe"
                  onClick={() => handleRemoveIngredient(index)}
                  aria-label="Remove ingredient"
                >
                  <i>🗑️</i>
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            className="btn-secondary"
            onClick={handleAddIngredient}
          >
            <i>➕</i> Add Ingredient
          </button>
        </div>
        
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/recipes')}
          >
            <i>✖️</i> Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            <i>💾</i> {loading ? 'Saving...' : 'Save Recipe'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRecipe;
