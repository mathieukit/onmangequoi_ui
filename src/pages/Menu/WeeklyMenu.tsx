import React, { useState } from 'react';
import { useMenu } from '../../hooks/useMenu';
import { Link } from 'react-router-dom';

const WeeklyMenu: React.FC = () => {
  const { weeklyMenu, loading, error, generateWeeklyMenu } = useMenu();
  const [includeGroceryList, setIncludeGroceryList] = useState(false);

  const handleGenerateMenu = async () => {
    await generateWeeklyMenu(includeGroceryList);
  };

  const mealTypeTranslation: Record<string, string> = {
    'petit déjeuner': 'Breakfast',
    'déjeuner': 'Lunch',
    'dîner': 'Dinner'
  };

  if (loading) {
    return <div className="loading">Generating your weekly menu...</div>;
  }

  return (
    <div className="weekly-menu-container">
      <h1>Weekly Menu</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="menu-controls">
        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="include-grocery"
            checked={includeGroceryList}
            onChange={(e) => setIncludeGroceryList(e.target.checked)}
          />
          <label htmlFor="include-grocery">Include grocery list</label>
        </div>
        
        <button 
          className="btn-primary"
          onClick={handleGenerateMenu}
          disabled={loading}
        >
          Generate Weekly Menu
        </button>
      </div>
      
      {weeklyMenu ? (
        <div className="weekly-menu">
          {Object.entries(weeklyMenu).map(([day, meals]) => (
            <div key={day} className="day-menu">
              <h2>{day}</h2>
              <div className="meals">
                {Object.entries(meals).map(([mealSlot, meal]) => (
                  <div key={mealSlot} className="meal-card">
                    <h3>{mealTypeTranslation[meal.mealType] || mealSlot}</h3>
                    <p className="meal-name">{meal.name}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {includeGroceryList && (
            <div className="menu-actions">
              <Link to="/grocery-list" className="btn-secondary">
                View Grocery List
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">
          <p>Generate a weekly menu to see your meal plan for the week.</p>
        </div>
      )}
    </div>
  );
};

export default WeeklyMenu;
