import React, { useState, useEffect } from 'react';
import { useMenu } from '../../hooks/useMenu';
import type { MealServing, MenuDay, Recipe } from '../../types';
import './WeeklyMenu.css';

const WeeklyMenu: React.FC = () => {
  // State for menu generation form
  const [menuName, setMenuName] = useState<string>('Weekly Menu');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [peopleCount, setPeopleCount] = useState<number>(1);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showMenuForm, setShowMenuForm] = useState<boolean>(true);
  const [showSavedMenus, setShowSavedMenus] = useState<boolean>(false);
  const [availableRecipesByType, setAvailableRecipesByType] = useState<Record<string, Recipe[]>>({});
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null);
  
  // State for collapsible days - track which days are expanded
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());
  
  // Use the menu hook for all menu-related functionality
  const {
    menuDraft,
    currentMenu,
    savedMenus,
    loading,
    error,
    recipes,
    createMenuDraft,
    saveMenu,
    fetchSavedMenus,
    fetchMenu,
    deleteMenu,
    updateMealServings,
    removeMeal,
    addMeal
  } = useMenu();

  // Fetch saved menus on component mount
  useEffect(() => {
    fetchSavedMenus();
  }, [fetchSavedMenus]);
  
  // Organize recipes by meal type
  useEffect(() => {
    if (recipes.length > 0) {
      const recipesByType: Record<string, Recipe[]> = {};
      
      for (const recipe of recipes) {
        if (!recipesByType[recipe.mealType]) {
          recipesByType[recipe.mealType] = [];
        }
        recipesByType[recipe.mealType].push(recipe);
      }
      
      setAvailableRecipesByType(recipesByType);
    }
  }, [recipes]);

  // Toggle day expansion
  const toggleDayExpansion = (dayIndex: number) => {
    const newExpandedDays = new Set(expandedDays);
    if (newExpandedDays.has(dayIndex)) {
      newExpandedDays.delete(dayIndex);
    } else {
      newExpandedDays.add(dayIndex);
    }
    setExpandedDays(newExpandedDays);
  };

  // Handle date selection
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    
    if (selectedDates.includes(date)) {
      setSelectedDates(selectedDates.filter(d => d !== date));
    } else {
      setSelectedDates([...selectedDates, date].sort());
    }
  };

  // Generate a week of dates starting from today
  const generateWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    setSelectedDates(dates);
  };
  
  // Handle menu generation
  const handleGenerateMenu = async () => {
    if (selectedDates.length === 0) {
      alert('Please select at least one date for the menu');
      return;
    }
    
    const success = await createMenuDraft(menuName, selectedDates, peopleCount);
    if (success) {
      setShowMenuForm(false);
    }
  };
  
  // Save the current menu draft
  const handleSaveMenu = async () => {
    if (!menuDraft) return;
    
    try {
      await saveMenu(menuDraft);
      alert('Menu saved successfully!');
    } catch (err) {
      console.error('Error saving menu:', err);
      alert('Failed to save menu. Please try again.');
    }
  };
  
  // Load a saved menu
  const handleLoadMenu = async (menuId: number) => {
    await fetchMenu(menuId);
    setSelectedMenuId(menuId);
    setShowSavedMenus(false);
    setShowMenuForm(false);
  };
  
  // Delete a saved menu
  const handleDeleteMenu = async (menuId: number) => {
    if (window.confirm('Are you sure you want to delete this menu?')) {
      await deleteMenu(menuId);
    }
  };
  
  // Format date for display
  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format date for compact display
  const formatDateCompact = (dateString: string) => {
    const date = new Date(dateString);
    return {
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' })
    };
  };
  
  // Handle serving count changes
  const handleServingChange = (dayIndex: number, mealType: 'breakfast' | 'lunch' | 'dinner', mealIndex: number, newCount: number) => {
    updateMealServings(dayIndex, mealType, mealIndex, newCount);
  };
  
  // Handle removing a meal
  const handleRemoveMeal = (dayIndex: number, mealType: 'breakfast' | 'lunch' | 'dinner', mealIndex: number) => {
    removeMeal(dayIndex, mealType, mealIndex);
  };
  
  // Handle adding a meal
  const handleAddMeal = (dayIndex: number, mealSlot: 'breakfast' | 'lunch' | 'dinner', recipeName: string) => {
    const recipe = recipes.find(recipe => recipe.name === recipeName);
    
    if (!recipe || recipe.id === undefined) {
      console.warn(`Adding meal without recipe ID: ${recipeName}`, {
        availableRecipes: recipes.map(r => ({ id: r.id, name: r.name }))
      });
    }
    
    const newMeal: MealServing = {
      recipe_name: recipeName,
      recipe_id: recipe?.id,
      people_count: peopleCount
    };
    
    addMeal(dayIndex, mealSlot, newMeal);
  };

  // Get meal summary for compact view
  const getMealSummary = (meals: MealServing[]) => {
    if (meals.length === 0) return 'No meal planned';
    if (meals.length === 1) return meals[0].recipe_name;
    return `${meals[0].recipe_name} +${meals.length - 1} more`;
  };

  // Get meal type icon
  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      default: return '🍽️';
    }
  };
  
  // Reset to menu form
  const handleNewMenu = () => {
    setShowMenuForm(true);
    setShowSavedMenus(false);
    setSelectedMenuId(null);
    setExpandedDays(new Set());
  };
  
  // Check if the component is in a loading state
  if (loading) {
    return (
      <div className="loading-modern">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  return (
    <div className="weekly-menu-container">
      {/* Header */}
      <div className="weekly-menu-header">
        <h1 className="weekly-menu-title">Weekly Menu</h1>
        
        {/* Top action buttons */}
        <div className="header-actions">
          <button 
            className="modern-btn btn-secondary-modern" 
            onClick={() => {
              setShowMenuForm(true);
              setShowSavedMenus(false);
            }}
            disabled={showMenuForm}
          >
            Create New
          </button>
          
          <button 
            className="modern-btn btn-secondary-modern"
            onClick={() => {
              setShowSavedMenus(true);
              setShowMenuForm(false);
            }}
            disabled={showSavedMenus}
          >
            Load Saved Menu
          </button>
          
          {menuDraft && !showMenuForm && !showSavedMenus && (
            <button 
              className="modern-btn btn-primary-modern"
              onClick={handleSaveMenu}
            >
              Save Menu
            </button>
          )}
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="error-message-modern">
          <h4>Error:</h4>
          <p>{error}</p>
        </div>
      )}
      
      {/* Menu Creation Form */}
      {showMenuForm && (
        <div className="menu-form-modern">
          <h2 className="form-title">Create New Menu</h2>
          
          <div className="form-group-modern">
            <label className="form-label-modern" htmlFor="menu-name">Menu Name</label>
            <input
              className="form-input-modern"
              type="text"
              id="menu-name"
              value={menuName}
              onChange={(e) => setMenuName(e.target.value)}
              placeholder="Enter a name for your menu"
            />
          </div>
          
          <div className="form-group-modern">
            <label className="form-label-modern" htmlFor="people-count">Number of People</label>
            <input
              className="form-input-modern"
              type="number"
              id="people-count"
              min="1"
              max="10"
              value={peopleCount}
              onChange={(e) => setPeopleCount(parseInt(e.target.value))}
            />
          </div>
          
          <div className="form-group-modern">
            <label className="form-label-modern">Select Dates</label>
            <div className="date-controls">
              <button
                className="modern-btn btn-outline-modern"
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                {showDatePicker ? 'Hide Calendar' : 'Show Calendar'}
              </button>
              
              <button
                className="modern-btn btn-outline-modern"
                onClick={generateWeekDates}
              >
                Select This Week
              </button>
            </div>
            
            {showDatePicker && (
              <div className="date-picker-grid">
                {Array.from({ length: 14 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() + i);
                  const dateStr = date.toISOString().split('T')[0];
                  return (
                    <div key={dateStr} className="checkbox-group-modern">
                      <input
                        type="checkbox"
                        id={`date-${dateStr}`}
                        value={dateStr}
                        checked={selectedDates.includes(dateStr)}
                        onChange={handleDateChange}
                      />
                      <label htmlFor={`date-${dateStr}`}>
                        {date.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
            
            {selectedDates.length > 0 && (
              <div className="selected-dates">
                <h4>Selected Dates:</h4>
                <div className="date-tags">
                  {selectedDates.map(date => (
                    <span key={date} className="date-tag">
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                      <button
                        className="date-tag-remove"
                        onClick={() => setSelectedDates(selectedDates.filter(d => d !== date))}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="form-actions">
            <button
              className="modern-btn btn-primary-modern"
              onClick={handleGenerateMenu}
              disabled={selectedDates.length === 0 || loading}
            >
              Generate Menu
            </button>
          </div>
        </div>
      )}
      
      {/* Saved Menus List */}
      {showSavedMenus && (
        <div className="saved-menus-modern">
          <h2 className="form-title">Saved Menus</h2>
          
          {savedMenus.length === 0 ? (
            <div className="empty-state-modern">
              <div className="empty-state-icon">📋</div>
              <p>You don't have any saved menus yet.</p>
            </div>
          ) : (
            <div>
              {savedMenus.map(menu => (
                <div key={menu.id} className="saved-menu-item">
                  <div className="saved-menu-info">
                    <h3>{menu.name}</h3>
                  </div>
                  
                  <div className="saved-menu-actions">
                    <button
                      className="modern-btn btn-small-modern btn-primary-modern"
                      onClick={() => handleLoadMenu(menu.id)}
                    >
                      Load
                    </button>
                    
                    <button
                      className="modern-btn btn-small-modern btn-outline-modern"
                      onClick={() => handleDeleteMenu(menu.id)}
                      style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Menu Display - New Compact Design */}
      {currentMenu && !showMenuForm && !showSavedMenus && (
        <>
          <div className="menu-header-modern">
            <div className="menu-info">
              <h2 className="menu-title">{currentMenu.name}</h2>
              {selectedMenuId !== null && (
                <span className="menu-id">ID: {selectedMenuId}</span>
              )}
            </div>
            <div className="menu-actions-header">
              {!selectedMenuId && (
                <button
                  className="modern-btn btn-primary-modern"
                  onClick={handleSaveMenu}
                >
                  Save Menu
                </button>
              )}
              <button
                className="modern-btn btn-outline-modern"
                onClick={handleNewMenu}
              >
                New Menu
              </button>
            </div>
          </div>
          
          <div className="weekly-menu-overview">
            {currentMenu.days.map((day, dayIndex) => {
              const isExpanded = expandedDays.has(dayIndex);
              const dateInfo = formatDateCompact(day.date);
              
              return (
                <div key={day.date} className={`day-card ${isExpanded ? 'expanded' : 'collapsed'}`}>
                  {/* Day Header - Always Visible */}
                  <div 
                    className="day-card-header"
                    onClick={() => toggleDayExpansion(dayIndex)}
                  >
                    <div className="day-info">
                      <div className="day-date">
                        <span className="day-weekday">{dateInfo.weekday}</span>
                        <span className="day-number">{dateInfo.day}</span>
                        <span className="day-month">{dateInfo.month}</span>
                      </div>
                      
                      {!isExpanded && (
                        <div className="day-summary">
                          <div className="meal-summary">
                            <span className="meal-icon">🌅</span>
                            <span className="meal-text">{getMealSummary(day.breakfast.meals)}</span>
                          </div>
                          <div className="meal-summary">
                            <span className="meal-icon">☀️</span>
                            <span className="meal-text">{getMealSummary(day.lunch.meals)}</span>
                          </div>
                          <div className="meal-summary">
                            <span className="meal-icon">🌙</span>
                            <span className="meal-text">{getMealSummary(day.dinner.meals)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="expand-indicator">
                      <span className={`expand-arrow ${isExpanded ? 'expanded' : ''}`}>▼</span>
                    </div>
                  </div>
                  
                  {/* Day Content - Expandable */}
                  {isExpanded && (
                    <div className="day-card-content">
                      {/* Breakfast */}
                      <div className="meal-section">
                        <div className="meal-type-header">
                          <div className="meal-type-icon breakfast-icon">🌅</div>
                          <h3 className="meal-type-title">Breakfast</h3>
                        </div>
                        
                        {day.breakfast.meals.length > 0 ? (
                          day.breakfast.meals.map((meal, mealIndex) => (
                            <div key={`breakfast-${mealIndex}`} className="meal-card-modern">
                              <div className="meal-content">
                                <p className="meal-name-modern">
                                  {meal.recipe_name}
                                  {meal.recipe_id !== undefined && (
                                    <span className="meal-id"> (ID: {meal.recipe_id})</span>
                                  )}
                                </p>
                                <div className="meal-controls">
                                  <div className="serving-controls">
                                    <button
                                      className="serving-btn"
                                      onClick={() => handleServingChange(dayIndex, 'breakfast', mealIndex, Math.max(1, meal.people_count - 1))}
                                    >
                                      -
                                    </button>
                                    <span className="serving-count">{meal.people_count}</span>
                                    <button
                                      className="serving-btn"
                                      onClick={() => handleServingChange(dayIndex, 'breakfast', mealIndex, meal.people_count + 1)}
                                    >
                                      +
                                    </button>
                                  </div>
                                  <button
                                    className="remove-meal-btn"
                                    onClick={() => handleRemoveMeal(dayIndex, 'breakfast', mealIndex)}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="empty-meal">No breakfast planned</div>
                        )}
                        
                        {availableRecipesByType['petit déjeuner'] && (
                          <div className="add-meal-dropdown">
                            <select
                              className="meal-select-modern"
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAddMeal(dayIndex, 'breakfast', e.target.value);
                                  e.target.value = '';
                                }
                              }}
                              value=""
                            >
                              <option value="" disabled>Add breakfast</option>
                              {availableRecipesByType['petit déjeuner'].map(recipe => (
                                <option key={recipe.id} value={recipe.name}>
                                  {recipe.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                      
                      {/* Lunch */}
                      <div className="meal-section">
                        <div className="meal-type-header">
                          <div className="meal-type-icon lunch-icon">☀️</div>
                          <h3 className="meal-type-title">Lunch</h3>
                        </div>
                        
                        {day.lunch.meals.length > 0 ? (
                          day.lunch.meals.map((meal, mealIndex) => (
                            <div key={`lunch-${mealIndex}`} className="meal-card-modern">
                              <div className="meal-content">
                                <p className="meal-name-modern">
                                  {meal.recipe_name}
                                  {meal.recipe_id !== undefined && (
                                    <span className="meal-id"> (ID: {meal.recipe_id})</span>
                                  )}
                                </p>
                                <div className="meal-controls">
                                  <div className="serving-controls">
                                    <button
                                      className="serving-btn"
                                      onClick={() => handleServingChange(dayIndex, 'lunch', mealIndex, Math.max(1, meal.people_count - 1))}
                                    >
                                      -
                                    </button>
                                    <span className="serving-count">{meal.people_count}</span>
                                    <button
                                      className="serving-btn"
                                      onClick={() => handleServingChange(dayIndex, 'lunch', mealIndex, meal.people_count + 1)}
                                    >
                                      +
                                    </button>
                                  </div>
                                  <button
                                    className="remove-meal-btn"
                                    onClick={() => handleRemoveMeal(dayIndex, 'lunch', mealIndex)}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="empty-meal">No lunch planned</div>
                        )}
                        
                        {availableRecipesByType['déjeuner'] && (
                          <div className="add-meal-dropdown">
                            <select
                              className="meal-select-modern"
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAddMeal(dayIndex, 'lunch', e.target.value);
                                  e.target.value = '';
                                }
                              }}
                              value=""
                            >
                              <option value="" disabled>Add lunch</option>
                              {availableRecipesByType['déjeuner'].map(recipe => (
                                <option key={recipe.id} value={recipe.name}>
                                  {recipe.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                      
                      {/* Dinner */}
                      <div className="meal-section">
                        <div className="meal-type-header">
                          <div className="meal-type-icon dinner-icon">🌙</div>
                          <h3 className="meal-type-title">Dinner</h3>
                        </div>
                        
                        {day.dinner.meals.length > 0 ? (
                          day.dinner.meals.map((meal, mealIndex) => (
                            <div key={`dinner-${mealIndex}`} className="meal-card-modern">
                              <div className="meal-content">
                                <p className="meal-name-modern">
                                  {meal.recipe_name}
                                  {meal.recipe_id !== undefined && (
                                    <span className="meal-id"> (ID: {meal.recipe_id})</span>
                                  )}
                                </p>
                                <div className="meal-controls">
                                  <div className="serving-controls">
                                    <button
                                      className="serving-btn"
                                      onClick={() => handleServingChange(dayIndex, 'dinner', mealIndex, Math.max(1, meal.people_count - 1))}
                                    >
                                      -
                                    </button>
                                    <span className="serving-count">{meal.people_count}</span>
                                    <button
                                      className="serving-btn"
                                      onClick={() => handleServingChange(dayIndex, 'dinner', mealIndex, meal.people_count + 1)}
                                    >
                                      +
                                    </button>
                                  </div>
                                  <button
                                    className="remove-meal-btn"
                                    onClick={() => handleRemoveMeal(dayIndex, 'dinner', mealIndex)}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="empty-meal">No dinner planned</div>
                        )}
                        
                        {availableRecipesByType['dîner'] && (
                          <div className="add-meal-dropdown">
                            <select
                              className="meal-select-modern"
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAddMeal(dayIndex, 'dinner', e.target.value);
                                  e.target.value = '';
                                }
                              }}
                              value=""
                            >
                              <option value="" disabled>Add dinner</option>
                              {availableRecipesByType['dîner'].map(recipe => (
                                <option key={recipe.id} value={recipe.name}>
                                  {recipe.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Bottom Actions */}
          <div className="menu-bottom-actions">
            <button
              className="modern-btn btn-primary-modern"
              onClick={handleSaveMenu}
            >
              Save Menu
            </button>
          </div>
        </>
      )}
      
      {/* Empty state when no menu is selected or created */}
      {!currentMenu && !showMenuForm && !showSavedMenus && (
        <div className="empty-state-modern">
          <div className="empty-state-icon">🍽️</div>
          <p>Create a new menu or load a saved menu to get started.</p>
          <div className="empty-state-actions">
            <button
              className="modern-btn btn-primary-modern"
              onClick={handleNewMenu}
            >
              Create New Menu
            </button>
            <button
              className="modern-btn btn-secondary-modern"
              onClick={() => setShowSavedMenus(true)}
            >
              Load Saved Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyMenu;
