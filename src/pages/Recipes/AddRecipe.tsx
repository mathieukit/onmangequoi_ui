import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipes } from '../../hooks/useRecipes';
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
    newIngredients[index] = {
      ...newIngredients[index],
      [field]: field === 'quantity' ? parseFloat(value as string) || 0 : value,
    };
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
      if (ingredient.quantity <= 0) {
        setFormError('All ingredients must have a positive quantity');
        return false;
      }
      if (!ingredient.unit.trim()) {
        setFormError('All ingredients must have a unit');
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

  return (
    <div className="add-recipe-container">
      <h1>Add New Recipe</h1>
      
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
                
                <div className="form-group">
                  <label htmlFor={`quantity-${index}`}>Quantity</label>
                  <input
                    type="number"
                    id={`quantity-${index}`}
                    value={ingredient.quantity || ''}
                    onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                    step="0.01"
                    min="0"
                    required
                    placeholder="0"
                  />
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
