import React, { useState } from 'react';
import { Recipe, Ingredient } from '@/types';

interface RecipeFormProps {
  onSubmit: (recipe: Recipe) => void;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [mealType, setMealType] = useState('dîner');
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { item: '', quantity: 0, unit: 'g' }
  ]);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { item: '', quantity: 0, unit: 'g' }]);
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
      [field]: field === 'quantity' ? Number(value) : value
    };
    setIngredients(newIngredients);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!name.trim()) {
      alert('Veuillez entrer un nom de recette');
      return;
    }
    
    if (ingredients.length === 0) {
      alert('Veuillez ajouter au moins un ingrédient');
      return;
    }
    
    // Check if all ingredients have names and quantities
    const invalidIngredient = ingredients.find(
      ing => !ing.item.trim() || ing.quantity <= 0
    );
    
    if (invalidIngredient) {
      alert('Veuillez remplir tous les champs d\'ingrédients avec des valeurs valides');
      return;
    }
    
    // Create recipe object
    const recipe: Recipe = {
      name,
      mealType,
      ingredients
    };
    
    // Submit the recipe
    onSubmit(recipe);
    
    // Reset form
    setName('');
    setMealType('dîner');
    setIngredients([{ item: '', quantity: 0, unit: 'g' }]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Nom de la recette
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input w-full"
          required
        />
      </div>
      
      <div>
        <label htmlFor="mealType" className="block text-sm font-medium mb-1">
          Type de repas
        </label>
        <select
          id="mealType"
          value={mealType}
          onChange={(e) => setMealType(e.target.value)}
          className="input w-full"
          required
        >
          <option value="petit déjeuner">Petit déjeuner</option>
          <option value="déjeuner">Déjeuner</option>
          <option value="dîner">Dîner</option>
        </select>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium">Ingrédients</label>
          <button
            type="button"
            onClick={handleAddIngredient}
            className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)]"
          >
            + Ajouter un ingrédient
          </button>
        </div>
        
        <div className="space-y-3">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-grow">
                <input
                  type="text"
                  placeholder="Nom de l'ingrédient"
                  value={ingredient.item}
                  onChange={(e) => handleIngredientChange(index, 'item', e.target.value)}
                  className="input w-full"
                  required
                />
              </div>
              
              <div className="w-20">
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="Qté"
                  value={ingredient.quantity || ''}
                  onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                  className="input w-full"
                  required
                />
              </div>
              
              <div className="w-24">
                <select
                  value={ingredient.unit}
                  onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                  className="input w-full"
                  required
                >
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                  <option value="l">l</option>
                  <option value="pièce">pièce</option>
                  <option value="c. à soupe">c. à soupe</option>
                  <option value="c. à café">c. à café</option>
                  <option value="gousse">gousse</option>
                  <option value="tranche">tranche</option>
                </select>
              </div>
              
              {ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(index)}
                  className="text-red-500 hover:text-red-700 px-2"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <button type="submit" className="btn btn-primary w-full">
          Ajouter la recette
        </button>
      </div>
    </form>
  );
};

export default RecipeForm;
