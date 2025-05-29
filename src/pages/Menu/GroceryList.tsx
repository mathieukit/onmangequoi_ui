import React, { useState, useEffect } from 'react';
import { useMenu } from '../../hooks/useMenu';
import { useRecipes } from '../../hooks/useRecipes';
import { Link } from 'react-router-dom';
import type { Menu, MenuDay, MealServing } from '../../types';
import './GroceryList.css';

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
  
  const { recipes } = useRecipes();
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null);
  const [currentMenu, setCurrentMenu] = useState<Menu | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  // Fetch available menus on component mount
  useEffect(() => {
    const loadMenus = async () => {
      await fetchSavedMenus();
    };
    loadMenus();
  }, [fetchSavedMenus]);
  
  // Handle menu selection
  const handleMenuChange = async (menuId: number | null) => {
    if (menuId !== null) {
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
  
  // Extract recipe IDs from the menu, with the correct number of duplicates based on servings
  const getMenuRecipeIds = (menu: Menu): number[] => {
    if (!menu) return [];
    
    const recipeIds: number[] = [];
    
    // Create a mapping of recipe names to IDs for quick lookup
    const recipeNameToId: Record<string, number> = {};
    recipes.forEach(recipe => {
      if (recipe.id !== undefined) {
        recipeNameToId[recipe.name] = recipe.id;
      }
    });
    
    // Process each day
    menu.days.forEach((day: MenuDay) => {
      // Process each meal time (breakfast, lunch, dinner)
      ['breakfast', 'lunch', 'dinner'].forEach((mealTime) => {
        const mealTimeSlot = day[mealTime as keyof typeof day];
        
        // Process each meal in this meal time - ensure it's the right type first
        if (mealTimeSlot && typeof mealTimeSlot !== 'string' && mealTimeSlot.meals) {
          mealTimeSlot.meals.forEach((meal: MealServing) => {
            // If we have recipe_id directly in the meal, use it
            if (meal.recipe_id !== undefined) {
              for (let i = 0; i < meal.people_count; i++) {
                recipeIds.push(meal.recipe_id);
              }
            } 
            // Otherwise look up the ID by name
            else if (recipeNameToId[meal.recipe_name]) {
              for (let i = 0; i < meal.people_count; i++) {
                recipeIds.push(recipeNameToId[meal.recipe_name]);
              }
            } else {
              console.warn(`Recipe ID not found for: ${meal.recipe_name}`, {
                availableRecipes: recipes.map(r => ({ id: r.id, name: r.name })),
                recipeNameToId: { ...recipeNameToId },
              });
            }
          });
        }
      });
    });
    
    return recipeIds;
  };

  // Generate grocery list for the selected menu
  const handleGenerateList = async () => {
    if (!currentMenu) return;
    
    const recipeIds = getMenuRecipeIds(currentMenu);
    
    if (recipeIds.length > 0) {
      await generateGroceryList(recipeIds);
      // Reset checked items when generating new list
      setCheckedItems(new Set());
    } else {
      console.warn("No recipe IDs found in the selected menu");
    }
  };

  // Group grocery items by category with better categorization
  const groupedGroceryItems = groceryList.reduce<Record<string, typeof groceryList>>(
    (groups, item) => {
      let category = 'Other';
      
      const lowerItem = item.item.toLowerCase();
      if (['flour', 'sugar', 'salt', 'oil', 'vinegar', 'spice', 'pepper', 'herbs', 'baking', 'pasta', 'rice', 'beans', 'lentils'].some(term => lowerItem.includes(term))) {
        category = 'Pantry';
      } else if (['milk', 'cheese', 'yogurt', 'butter', 'cream', 'eggs', 'dairy'].some(term => lowerItem.includes(term))) {
        category = 'Dairy';
      } else if (['apple', 'banana', 'orange', 'berry', 'fruit', 'lemon', 'lime', 'grape', 'strawberry', 'blueberry'].some(term => lowerItem.includes(term))) {
        category = 'Fruits';
      } else if (['carrot', 'potato', 'onion', 'garlic', 'vegetable', 'tomato', 'lettuce', 'spinach', 'broccoli', 'pepper', 'cucumber'].some(term => lowerItem.includes(term))) {
        category = 'Vegetables';
      } else if (['chicken', 'beef', 'pork', 'fish', 'meat', 'salmon', 'turkey', 'lamb', 'shrimp', 'seafood'].some(term => lowerItem.includes(term))) {
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

  // Handle item check/uncheck
  const handleItemCheck = (itemKey: string) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(itemKey)) {
      newCheckedItems.delete(itemKey);
    } else {
      newCheckedItems.add(itemKey);
    }
    setCheckedItems(newCheckedItems);
  };

  // Handle category collapse/expand
  const handleCategoryToggle = (category: string) => {
    const newCollapsedCategories = new Set(collapsedCategories);
    if (newCollapsedCategories.has(category)) {
      newCollapsedCategories.delete(category);
    } else {
      newCollapsedCategories.add(category);
    }
    setCollapsedCategories(newCollapsedCategories);
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Pantry': return '🏺';
      case 'Dairy': return '🥛';
      case 'Fruits': return '🍎';
      case 'Vegetables': return '🥕';
      case 'Meat & Fish': return '🥩';
      default: return '📦';
    }
  };

  // Get category icon class
  const getCategoryIconClass = (category: string) => {
    switch (category) {
      case 'Pantry': return 'pantry-icon';
      case 'Dairy': return 'dairy-icon';
      case 'Fruits': return 'fruits-icon';
      case 'Vegetables': return 'vegetables-icon';
      case 'Meat & Fish': return 'meat-icon';
      default: return 'other-icon';
    }
  };

  if (loading) {
    return (
      <div className="grocery-list-container">
        <div className="loading-modern">
          <div className="loading-spinner"></div>
          <div className="loading-text">Generating your grocery list...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grocery-list-container">
      {/* Header */}
      <div className="grocery-list-header">
        <h1 className="grocery-list-title">
          <span className="grocery-list-icon">🛒</span>
          Grocery List
        </h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message-modern">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}
      
      {/* Controls Section */}
      <div className="grocery-controls-modern">
        <div className="menu-selector-modern">
          <h3 className="selector-title">
            <span className="selector-icon">📋</span>
            Select a Menu
          </h3>
          
          <div className="filter-controls-modern">
            <div className="custom-dropdown-modern" tabIndex={0} onBlur={() => setDropdownOpen(false)}>
              <button
                type="button"
                className="custom-dropdown-btn-modern"
                onClick={() => setDropdownOpen((open) => !open)}
              >
                {selectedMenuId 
                  ? savedMenus.find(menu => menu.id === selectedMenuId)?.name 
                  : 'Choose a menu to generate grocery list'}
                <span className={`dropdown-arrow-modern ${dropdownOpen ? 'open' : ''}`}>▼</span>
              </button>
              {dropdownOpen && (
                <ul className="custom-dropdown-list-modern">
                  <li
                    className={`custom-dropdown-item-modern${selectedMenuId === null ? ' selected' : ''}`}
                    onMouseDown={() => {
                      handleMenuChange(null);
                      setDropdownOpen(false);
                    }}
                  >
                    Choose a menu to generate grocery list
                  </li>
                  {savedMenus.map((menu) => (
                    <li
                      key={menu.id}
                      className={`custom-dropdown-item-modern${selectedMenuId === menu.id ? ' selected' : ''}`}
                      onMouseDown={() => {
                        handleMenuChange(menu.id);
                        setDropdownOpen(false);
                      }}
                    >
                      {menu.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          <button
            className="generate-btn-modern"
            onClick={handleGenerateList}
            disabled={loading || !currentMenu}
          >
            <span className="generate-btn-icon">✨</span>
            Generate Grocery List
          </button>
          
          {/* Menu Summary */}
          {currentMenu && (
            <div className="menu-summary-modern">
              <h4 className="menu-summary-title">
                <span>📋</span>
                Selected Menu: {currentMenu.name}
              </h4>
              <p className="menu-summary-subtitle">
                Contains {currentMenu.days.length} days of meals
              </p>
              
              <div className="recipe-summary-modern">
                <h5 className="recipe-summary-title">Recipes in this menu:</h5>
                {(() => {
                  // Count recipe occurrences and track recipe IDs
                  const recipeCount: Record<string, number> = {};
                  const recipeIds: Record<string, number> = {};
                  
                  // Create a lookup map for recipe IDs
                  const recipeNameToId: Record<string, number> = {};
                  recipes.forEach(recipe => {
                    if (recipe.id !== undefined) {
                      recipeNameToId[recipe.name] = recipe.id;
                    }
                  });
                  
                  currentMenu.days.forEach(day => {
                    ['breakfast', 'lunch', 'dinner'].forEach(mealTime => {
                      const mealTimeSlot = day[mealTime as keyof typeof day];
                      
                      if (mealTimeSlot && typeof mealTimeSlot !== 'string' && mealTimeSlot.meals) {
                        mealTimeSlot.meals.forEach(meal => {
                          if (!recipeCount[meal.recipe_name]) {
                            recipeCount[meal.recipe_name] = 0;
                            // Store recipe ID if available directly or via lookup
                            if (meal.recipe_id) {
                              recipeIds[meal.recipe_name] = meal.recipe_id;
                            } else if (recipeNameToId[meal.recipe_name]) {
                              recipeIds[meal.recipe_name] = recipeNameToId[meal.recipe_name];
                            }
                          }
                          recipeCount[meal.recipe_name] += meal.people_count;
                        });
                      }
                    });
                  });
                  
                  return (
                    <ul className="recipe-list-modern">
                      {Object.entries(recipeCount).map(([recipe, servings]) => (
                        <li key={recipe} className="recipe-item-modern">
                          <span className="recipe-name-modern">{recipe}</span>
                          <span className="recipe-servings">{servings} servings</span>
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grocery List Display */}
      {groceryList.length > 0 ? (
        <div className="grocery-list-display">
          <div className="grocery-list-header-section">
            <h2 className="grocery-list-display-title">
              <span>🛍️</span>
              Your Grocery List
            </h2>
            <p className="grocery-list-subtitle">
              {groceryList.length} items • {Object.keys(groupedGroceryItems).length} categories
            </p>
          </div>
          
          <div className="grocery-categories">
            {Object.entries(groupedGroceryItems).map(([category, items]) => {
              const isCollapsed = collapsedCategories.has(category);
              return (
                <div key={category} className="grocery-category-modern">
                  <div 
                    className="category-header"
                    onClick={() => handleCategoryToggle(category)}
                  >
                    <div className="category-title">
                      <div className={`category-icon ${getCategoryIconClass(category)}`}>
                        {getCategoryIcon(category)}
                      </div>
                      {category}
                      <span className="category-count">{items.length}</span>
                    </div>
                    <span className={`category-expand-icon ${isCollapsed ? '' : 'expanded'}`}>
                      ▼
                    </span>
                  </div>
                  
                  <ul className={`grocery-items-modern ${isCollapsed ? 'collapsed' : ''}`}>
                    {items.map((item, index) => {
                      const itemKey = `${category}-${index}-${item.item}`;
                      const isChecked = checkedItems.has(itemKey);
                      
                      return (
                        <li 
                          key={index} 
                          className={`grocery-item-modern ${isChecked ? 'checked' : ''}`}
                        >
                          <input
                            type="checkbox"
                            className="grocery-checkbox"
                            checked={isChecked}
                            onChange={() => handleItemCheck(itemKey)}
                          />
                          <div className="grocery-item-content">
                            <span className="grocery-quantity-modern">
                              {item.quantity}
                            </span>
                            <span className="grocery-unit-modern">
                              {item.unit}
                            </span>
                            <span className="grocery-name-modern">
                              {item.item}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="grocery-actions-modern">
            <button 
              onClick={() => window.print()} 
              className="action-btn-modern btn-print"
            >
              <span>🖨️</span>
              Print List
            </button>
            <Link to="/weekly-menu" className="action-btn-modern btn-back">
              <span>←</span>
              Back to Menu
            </Link>
          </div>
        </div>
      ) : (
        <div className="empty-state-modern">
          <div className="empty-state-icon">🛒</div>
          <h3 className="empty-state-title">No Grocery List Yet</h3>
          <p className="empty-state-description">
            Select a menu from above and click "Generate Grocery List" to create your shopping list with all the ingredients you need.
          </p>
          <div className="empty-state-actions">
            <Link to="/weekly-menu" className="action-btn-modern btn-back">
              <span>📋</span>
              Create a Menu First
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroceryList;
