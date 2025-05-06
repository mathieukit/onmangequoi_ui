import React from 'react';
import { Recipe } from '@/types';

interface RecipeCardProps {
  recipe: Recipe;
  onDelete?: (recipeName: string) => void;
}

const mealTypeTranslations: Record<string, string> = {
  'petit déjeuner': 'Petit déjeuner',
  'déjeuner': 'Déjeuner',
  'dîner': 'Dîner'
};

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onDelete }) => {
  return (
    <div className="card">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-[var(--primary)]">{recipe.name}</h3>
        <span className="px-2 py-1 text-xs rounded-full bg-[var(--secondary)] text-white">
          {mealTypeTranslations[recipe.mealType] || recipe.mealType}
        </span>
      </div>
      
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2">Ingrédients :</h4>
        <ul className="space-y-1 text-sm">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index} className="flex justify-between">
              <span>{ingredient.item}</span>
              <span className="text-xs font-medium">
                {ingredient.quantity} {ingredient.unit}
              </span>
            </li>
          ))}
        </ul>
      </div>
      
      {onDelete && (
        <button 
          onClick={() => onDelete(recipe.name)}
          className="text-sm text-red-500 hover:text-red-700 transition-colors"
        >
          Supprimer la recette
        </button>
      )}
    </div>
  );
};

export default RecipeCard;
