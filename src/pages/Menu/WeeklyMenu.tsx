import React, { useState, useEffect } from 'react';
import { useMenu } from '../../hooks/useMenu';
import type { MealServing, MenuDay, Recipe } from '../../types';

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

  // We'll use hardcoded meal type names in our component
  
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

  // Handle date selection
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    
    if (selectedDates.includes(date)) {
      // Remove date if already selected
      setSelectedDates(selectedDates.filter(d => d !== date));
    } else {
      // Add date if not already selected
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
    // Find the recipe ID from the available recipes
    const recipe = recipes.find(recipe => recipe.name === recipeName);
    
    if (!recipe || recipe.id === undefined) {
      console.warn(`Adding meal without recipe ID: ${recipeName}`, {
        availableRecipes: recipes.map(r => ({ id: r.id, name: r.name }))
      });
    }
    
    const newMeal: MealServing = {
      recipe_name: recipeName,
      recipe_id: recipe?.id, // Include the recipe ID if available
      people_count: peopleCount
    };
    
    
    addMeal(dayIndex, mealSlot, newMeal);
  };
  
  // Reset to menu form
  const handleNewMenu = () => {
    setShowMenuForm(true);
    setShowSavedMenus(false);
    setSelectedMenuId(null);
  };
  
  // Check if the component is in a loading state
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="weekly-menu-container">
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        rowGap: '1rem',
      }}>
        <h1 style={{ margin: 0 }}>Weekly Menu</h1>
        
        {/* Top action buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn-secondary" 
            onClick={() => {
              setShowMenuForm(true);
              setShowSavedMenus(false);
            }}
            disabled={showMenuForm}
          >
            Create New
          </button>
          
          <button 
            className="btn-secondary"
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
              className="btn-primary"
              onClick={handleSaveMenu}
            >
              Save Menu
            </button>
          )}
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="error-message" style={{ marginBottom: '20px', padding: '15px' }}>
          <h4 style={{ marginTop: 0 }}>Error:</h4>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{error}</p>
        </div>
      )}
      
      {/* Menu Creation Form */}
      {showMenuForm && (
        <div className="menu-form" style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          marginBottom: '20px'
        }}>
          <h2>Create New Menu</h2>
          
          <div className="form-group">
            <label htmlFor="menu-name">Menu Name</label>
            <input
              type="text"
              id="menu-name"
              value={menuName}
              onChange={(e) => setMenuName(e.target.value)}
              placeholder="Enter a name for your menu"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="people-count">Number of People</label>
            <input
              type="number"
              id="people-count"
              min="1"
              max="10"
              value={peopleCount}
              onChange={(e) => setPeopleCount(parseInt(e.target.value))}
            />
          </div>
          
          <div className="form-group">
            <label>Select Dates</label>
            <div style={{ marginBottom: '10px' }}>
              <button
                className="btn-small btn-secondary"
                onClick={() => setShowDatePicker(!showDatePicker)}
                style={{ marginRight: '10px' }}
              >
                {showDatePicker ? 'Hide Calendar' : 'Show Calendar'}
              </button>
              
              <button
                className="btn-small btn-secondary"
                onClick={generateWeekDates}
              >
                Select This Week
              </button>
            </div>
            
            {showDatePicker && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '10px',
                marginTop: '10px'
              }}>
                {Array.from({ length: 14 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() + i);
                  const dateStr = date.toISOString().split('T')[0];
                  return (
                    <div key={dateStr} className="checkbox-group">
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
              <div style={{ marginTop: '10px' }}>
                <h4>Selected Dates:</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {selectedDates.map(date => (
                    <span 
                      key={date}
                      style={{
                        background: '#f0f0f0',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                      <button
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          color: '#ff6b6b'
                        }}
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
              className="btn-primary"
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
        <div className="saved-menus" style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          marginBottom: '20px'
        }}>
          <h2>Saved Menus</h2>
          
          {savedMenus.length === 0 ? (
            <div className="empty-state">
              <p>You don't have any saved menus yet.</p>
            </div>
          ) : (
            <div style={{ marginTop: '20px' }}>
              {savedMenus.map(menu => (
                <div 
                  key={menu.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '15px',
                    borderBottom: '1px solid #eee',
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0 }}>{menu.name}</h3>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      className="btn-small btn-primary"
                      onClick={() => handleLoadMenu(menu.id)}
                    >
                      Load
                    </button>
                    
                    <button
                      className="btn-small btn-danger"
                      onClick={() => handleDeleteMenu(menu.id)}
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
      
      {/* Menu Display */}
      {currentMenu && !showMenuForm && !showSavedMenus && (
        <>
          <div className="menu-header" style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2>{currentMenu.name} {selectedMenuId !== null && `(ID: ${selectedMenuId})`}</h2>
            <div>
              {!selectedMenuId && (
                <button
                  className="btn-primary"
                  onClick={handleSaveMenu}
                  style={{ marginRight: '10px' }}
                >
                  Save Menu
                </button>
              )}
              <button
                className="btn-secondary"
                onClick={handleNewMenu}
              >
                Create New Menu
              </button>
            </div>
          </div>
          
          <div className="weekly-menu">
            {currentMenu.days.map((day, dayIndex) => (
              <div key={day.date} className="day-menu">
                <h2>{formatDateForDisplay(day.date)}</h2>
                
                {/* Breakfast */}
                <div className="meals">
                  <h3>Breakfast</h3>
                  {day.breakfast.meals.length > 0 ? (
                    day.breakfast.meals.map((meal, mealIndex) => (
                      <div key={`breakfast-${mealIndex}`} className="meal-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <p className="meal-name">
                            {meal.recipe_name}
                            {meal.recipe_id !== undefined && (
                              <span style={{ fontSize: '0.7em', color: '#888', marginLeft: '5px' }}>
                                (ID: {meal.recipe_id})
                              </span>
                            )}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <button
                                onClick={() => handleServingChange(dayIndex, 'breakfast', mealIndex, Math.max(1, meal.people_count - 1))}
                                style={{ background: 'none', border: '1px solid #ddd', borderRadius: '4px', width: '30px', height: '30px', cursor: 'pointer' }}
                              >
                                -
                              </button>
                              <span style={{ margin: '0 10px' }}>{meal.people_count}</span>
                              <button
                                onClick={() => handleServingChange(dayIndex, 'breakfast', mealIndex, meal.people_count + 1)}
                                style={{ background: 'none', border: '1px solid #ddd', borderRadius: '4px', width: '30px', height: '30px', cursor: 'pointer' }}
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => handleRemoveMeal(dayIndex, 'breakfast', mealIndex)}
                              style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="meal-card">
                      <p>No breakfast planned</p>
                    </div>
                  )}
                  {/* Add meal dropdown */}
                  {availableRecipesByType['petit déjeuner'] && (
                    <div style={{ marginTop: '10px' }}>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddMeal(dayIndex, 'breakfast', e.target.value);
                            e.target.value = '';
                          }
                        }}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', width: '100%' }}
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
                <div className="meals">
                  <h3>Lunch</h3>
                  {day.lunch.meals.length > 0 ? (
                    day.lunch.meals.map((meal, mealIndex) => (
                      <div key={`lunch-${mealIndex}`} className="meal-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <p className="meal-name">
                            {meal.recipe_name}
                            {meal.recipe_id !== undefined && (
                              <span style={{ fontSize: '0.7em', color: '#888', marginLeft: '5px' }}>
                                (ID: {meal.recipe_id})
                              </span>
                            )}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <button
                                onClick={() => handleServingChange(dayIndex, 'lunch', mealIndex, Math.max(1, meal.people_count - 1))}
                                style={{ background: 'none', border: '1px solid #ddd', borderRadius: '4px', width: '30px', height: '30px', cursor: 'pointer' }}
                              >
                                -
                              </button>
                              <span style={{ margin: '0 10px' }}>{meal.people_count}</span>
                              <button
                                onClick={() => handleServingChange(dayIndex, 'lunch', mealIndex, meal.people_count + 1)}
                                style={{ background: 'none', border: '1px solid #ddd', borderRadius: '4px', width: '30px', height: '30px', cursor: 'pointer' }}
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => handleRemoveMeal(dayIndex, 'lunch', mealIndex)}
                              style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="meal-card">
                      <p>No lunch planned</p>
                    </div>
                  )}
                  {/* Add meal dropdown */}
                  {availableRecipesByType['déjeuner'] && (
                    <div style={{ marginTop: '10px' }}>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddMeal(dayIndex, 'lunch', e.target.value);
                            e.target.value = '';
                          }
                        }}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', width: '100%' }}
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
                <div className="meals">
                  <h3>Dinner</h3>
                  {day.dinner.meals.length > 0 ? (
                    day.dinner.meals.map((meal, mealIndex) => (
                      <div key={`dinner-${mealIndex}`} className="meal-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <p className="meal-name">
                            {meal.recipe_name}
                            {meal.recipe_id !== undefined && (
                              <span style={{ fontSize: '0.7em', color: '#888', marginLeft: '5px' }}>
                                (ID: {meal.recipe_id})
                              </span>
                            )}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <button
                                onClick={() => handleServingChange(dayIndex, 'dinner', mealIndex, Math.max(1, meal.people_count - 1))}
                                style={{ background: 'none', border: '1px solid #ddd', borderRadius: '4px', width: '30px', height: '30px', cursor: 'pointer' }}
                              >
                                -
                              </button>
                              <span style={{ margin: '0 10px' }}>{meal.people_count}</span>
                              <button
                                onClick={() => handleServingChange(dayIndex, 'dinner', mealIndex, meal.people_count + 1)}
                                style={{ background: 'none', border: '1px solid #ddd', borderRadius: '4px', width: '30px', height: '30px', cursor: 'pointer' }}
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => handleRemoveMeal(dayIndex, 'dinner', mealIndex)}
                              style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="meal-card">
                      <p>No dinner planned</p>
                    </div>
                  )}
                  {/* Add meal dropdown */}
                  {availableRecipesByType['dîner'] && (
                    <div style={{ marginTop: '10px' }}>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddMeal(dayIndex, 'dinner', e.target.value);
                            e.target.value = '';
                          }
                        }}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', width: '100%' }}
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
            ))}
          </div>
          
          {/* Save button at bottom */}
          <div className="menu-actions">
            <button
              className="btn-primary"
              onClick={handleSaveMenu}
            >
              Save Menu
            </button>
          </div>
        </>
      )}
      
      {/* Empty state when no menu is selected or created */}
      {!currentMenu && !showMenuForm && !showSavedMenus && (
        <div className="empty-state">
          <p>Create a new menu or load a saved menu to get started.</p>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button
              className="btn-primary"
              onClick={handleNewMenu}
            >
              Create New Menu
            </button>
            <button
              className="btn-secondary"
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
