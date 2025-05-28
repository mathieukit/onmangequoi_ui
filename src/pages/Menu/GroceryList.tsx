// filepath: /Users/matthieukitengengoie/Desktop/random/onmangequoi_UI/src/pages/Menu/GroceryList.tsx
import React, { useState, useEffect } from 'react';
import { useMenu } from '../../hooks/useMenu';
import { Link } from 'react-router-dom';
import type { Menu, MenuDay, MealServing } from '../../types';

const GroceryList: React.FC = () => {
  const { 
    groceryList, 
    loading, 
    error, 
    generateGroceryList, 
    savedMenus, 
    fetchSavedMenus, 
    fetchMenu
  } = useMenu();
  
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null);
  const [currentMenu, setCurrentMenu] = useState<Menu | null>(null);

  // Fetch available menus on component mount
  useEffect(() => {
    const loadMenus = async () => {
      await fetchSavedMenus();
    };
    loadMenus();
  }, [fetchSavedMenus]);
  
  // Handle menu selection
  const handleMenuChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const menuId = parseInt(e.target.value);
    if (!isNaN(menuId)) {
      setSelectedMenuId(menuId);
      const menu = await fetchMenu(menuId);
      if (menu) {
        setCurrentMenu(menu);
      }
    } else {
      setSelectedMenuId(null);
      setCurrentMenu(null);
    }
  };
  
  // Extract recipe names from the menu, with the correct number of duplicates based on servings
  const getMenuRecipeNames = (menu: Menu): string[] => {
    if (!menu) return [];
    
    const recipeNames: string[] = [];
    
    // Process each day
    menu.days.forEach((day: MenuDay) => {
      // Process each meal time (breakfast, lunch, dinner)
      ['breakfast', 'lunch', 'dinner'].forEach((mealTime) => {
        const mealTimeSlot = day[mealTime as keyof typeof day];
        
        // Process each meal in this meal time - ensure it's the right type first
        if (mealTimeSlot && typeof mealTimeSlot !== 'string' && mealTimeSlot.meals) {
          mealTimeSlot.meals.forEach((meal: MealServing) => {
            // Add recipe name once per serving
            for (let i = 0; i < meal.people_count; i++) {
              recipeNames.push(meal.recipe_name);
            }
          });
        }
      });
    });
    
    return recipeNames;
  };

  // Generate grocery list for the selected menu
  const handleGenerateList = async () => {
    if (!currentMenu) return;
    
    const recipeNames = getMenuRecipeNames(currentMenu);
    
    if (recipeNames.length > 0) {
      await generateGroceryList(recipeNames);
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
        <div className="menu-selector">
          <h3>Select a Menu</h3>
          <div style={{ marginBottom: '20px' }}>
            <select 
              value={selectedMenuId || ''}
              onChange={handleMenuChange}
              style={{ 
                padding: '10px', 
                borderRadius: '4px', 
                border: '1px solid #ddd', 
                width: '100%',
                maxWidth: '400px'
              }}
            >
              <option value="">-- Select a Menu --</option>
              {savedMenus.map(menu => (
                <option key={menu.id} value={menu.id}>
                  {menu.name}
                </option>
              ))}
            </select>
          </div>
          
          <button
            className="btn-primary"
            onClick={handleGenerateList}
            disabled={loading || !currentMenu}
            style={{ marginBottom: '20px' }}
          >
            Generate Grocery List
          </button>
          
          {currentMenu && (
            <div className="menu-summary" style={{ 
              marginBottom: '20px',
              padding: '15px', 
              backgroundColor: '#f8f9fa',
              borderRadius: '5px',
              border: '1px solid #eee'
            }}>
              <h4 style={{ marginTop: 0 }}>Selected Menu: {currentMenu.name}</h4>
              <p>Contains {currentMenu.days.length} days of meals</p>
              
              {/* Show recipe summary with serving counts */}
              <div className="recipe-summary">
                <h5 style={{ marginBottom: '8px' }}>Recipes in this menu:</h5>
                {(() => {
                  // Count recipe occurrences
                  const recipeCount: Record<string, number> = {};
                  
                  currentMenu.days.forEach(day => {
                    ['breakfast', 'lunch', 'dinner'].forEach(mealTime => {
                      const mealTimeSlot = day[mealTime as keyof typeof day];
                      
                      if (mealTimeSlot && typeof mealTimeSlot !== 'string' && mealTimeSlot.meals) {
                        mealTimeSlot.meals.forEach(meal => {
                          if (!recipeCount[meal.recipe_name]) {
                            recipeCount[meal.recipe_name] = 0;
                          }
                          recipeCount[meal.recipe_name] += meal.people_count;
                        });
                      }
                    });
                  });
                  
                  return (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {Object.entries(recipeCount).map(([recipe, servings]) => (
                        <li key={recipe} style={{ marginBottom: '4px' }}>
                          <span style={{ fontWeight: 500 }}>{recipe}</span>: {servings} servings
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
        
        {groceryList.length > 0 ? (
          <div className="grocery-list" style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
            marginTop: '20px'
          }}>
            <h2>Your Grocery List</h2>
            
            {Object.entries(groupedGroceryItems).map(([category, items]) => (
              <div key={category} className="grocery-category" style={{ marginBottom: '20px' }}>
                <h3 style={{ 
                  borderBottom: '2px solid #f0f0f0', 
                  paddingBottom: '8px',
                  marginBottom: '12px', 
                  color: '#333' 
                }}>{category}</h3>
                <ul className="grocery-items" style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  {items.map((item, index) => (
                    <li key={index} className="grocery-item" style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid #f0f0f0'
                    }}>
                      <span className="grocery-quantity" style={{ fontWeight: 'bold', marginRight: '5px' }}>
                        {item.quantity}
                      </span>
                      <span className="grocery-unit" style={{ color: '#666', width: '60px' }}>
                        {item.unit}
                      </span>
                      <span className="grocery-name" style={{ flex: 1 }}>
                        {item.item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button onClick={() => window.print()} className="btn-secondary" style={{ marginRight: '10px' }}>
                Print Grocery List
              </button>
            </div>
          </div>
        ) : (
          <div className="empty-state" style={{
            backgroundColor: '#f9f9f9',
            padding: '30px',
            borderRadius: '8px',
            textAlign: 'center',
            marginTop: '20px'
          }}>
            <p>Select a menu and generate a grocery list to see your shopping items.</p>
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
