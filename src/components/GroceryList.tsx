import React from 'react';
import { Ingredient } from '@/types';

interface GroceryListProps {
  ingredients: Ingredient[];
}

const GroceryList: React.FC<GroceryListProps> = ({ ingredients }) => {
  // Group ingredients by category (we'll use the first letter as a simple grouping)
  const groupedIngredients: Record<string, Ingredient[]> = {};
  
  ingredients.forEach(ingredient => {
    const firstLetter = ingredient.item.charAt(0).toUpperCase();
    if (!groupedIngredients[firstLetter]) {
      groupedIngredients[firstLetter] = [];
    }
    groupedIngredients[firstLetter].push(ingredient);
  });

  // Sort the groups alphabetically
  const sortedGroups = Object.keys(groupedIngredients).sort();

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4 text-[var(--primary)]">Liste de Courses</h2>
      
      {sortedGroups.length === 0 ? (
        <p className="text-center py-4">Aucun ingrédient dans la liste de courses.</p>
      ) : (
        <div className="space-y-4">
          {sortedGroups.map(group => (
            <div key={group}>
              <h3 className="text-lg font-medium text-[var(--secondary)] mb-2">{group}</h3>
              <ul className="space-y-2">
                {groupedIngredients[group].map((ingredient, index) => (
                  <li key={index} className="flex justify-between items-center border-b border-[var(--border)] pb-2">
                    <span>{ingredient.item}</span>
                    <span className="text-sm font-medium">
                      {ingredient.quantity} {ingredient.unit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroceryList;
