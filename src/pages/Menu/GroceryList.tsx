import React, { useState } from 'react';
import { useMenu } from '../../hooks/useMenu';
import { useRecipes } from '../../hooks/useRecipes';
import { Link } from 'react-router-dom';

const GroceryList: React.FC = () => {
  const { groceryList, loading, error, generateGroceryList } = useMenu();
  const { recipes } = useRecipes();
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);

  const handleRecipeToggle = (recipeName: string) => {
    setSelectedRecipes(prev => 
      prev.includes(recipeName)
        ? prev.filter(name => name !== recipeName)
        : [...prev, recipeName]
    );
  };

  const handleGenerateList = async () => {
    if (selectedRecipes.length > 0) {
      await generateGroceryList(selectedRecipes);
    }
  };

  // Group grocery items by category (simple implementation)
  const groupedGroceryItems = groceryList.reduce<Record<string, typeof groceryList>>(
    (groups, item) => {
      // This is a simple categorization, could be improved
      let category = 'Other';
      
      const lowerItem = item.item.toLowerCase();
      if (['flour', 'sugar', 'salt', 'oil', 'vinegar', 'spice'].some(term => lowerItem.includes(term))) {
        category = 'Pantry';
      } else if (['milk', 'cheese', 'yogurt', 'butter', 'cream'].some(term => lowerItem.includes(term))) {
        category = 'Dairy';
      } else if (['apple', 'banana', 'orange', 'berry', 'fruit'].some(term => lowerItem.includes(term))) {
        category = 'Fruits';
      } else if (['carrot', 'potato', 'onion', 'garlic', 'vegetable'].some(term => lowerItem.includes(term))) {
        category = 'Vegetables';
      } else if (['chicken', 'beef', 'pork', 'fish', 'meat'].some(term => lowerItem.includes(term))) {
        category = 'Meat & Fish';
      }
      
      if (!groups[category]) {
        groups[category] = [];
      }
      
      groups[category].push(item);
      return groups;
    },
    {}
  );

  if (loading) {
    return <div className="loading">Generating your grocery list...</div>;
  }

  return (
    <div className="grocery-list-container">
      <h1>Grocery List</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="grocery-controls">
        <div className="recipe-selector">
          <h3>Select Recipes</h3>
          <div className="recipe-checkbox-list">
            {recipes.map(recipe => (
              <div key={recipe.id || recipe.name} className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id={`recipe-${recipe.id || recipe.name}`}
                  checked={selectedRecipes.includes(recipe.name)}
                  onChange={() => handleRecipeToggle(recipe.name)}
                />
                <label htmlFor={`recipe-${recipe.id || recipe.name}`}>{recipe.name}</label>
              </div>
            ))}
          </div>
          
          <button 
            className="btn-primary"
            onClick={handleGenerateList}
            disabled={loading || selectedRecipes.length === 0}
          >
            Generate Grocery List
          </button>
        </div>
        
        {groceryList.length > 0 ? (
          <div className="grocery-list">
            <h2>Your Grocery List</h2>
            
            {Object.entries(groupedGroceryItems).map(([category, items]) => (
              <div key={category} className="grocery-category">
                <h3>{category}</h3>
                <ul className="grocery-items">
                  {items.map((item, index) => (
                    <li key={index} className="grocery-item">
                      <span className="grocery-quantity">{item.quantity}</span>
                      <span className="grocery-unit">{item.unit}</span>
                      <span className="grocery-name">{item.item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Select recipes and generate a grocery list to see your shopping items.</p>
          </div>
        )}
      </div>
      
      <div className="grocery-actions">
        <Link to="/weekly-menu" className="btn-secondary">
          Back to Weekly Menu
        </Link>
      </div>
    </div>
  );
};

export default GroceryList;
