import React from 'react';
import { WeeklyMenu as WeeklyMenuType, DailyMenu } from '@/types';

interface WeeklyMenuProps {
  menu: WeeklyMenuType;
}

interface MealInfo {
  name: string;
  mealType: string;
}

const mealTypeTranslations: Record<string, string> = {
  'petit déjeuner': 'Breakfast',
  'déjeuner': 'Lunch',
  'dîner': 'Dinner'
};

const WeeklyMenu: React.FC<WeeklyMenuProps> = ({ menu }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
      {Object.entries(menu).map(([day, dailyMenu]) => (
        <div key={day} className="card">
          <h3 className="text-lg font-semibold mb-3 text-[var(--primary)]">{day}</h3>
          <div className="space-y-3">
            {(Object.entries(dailyMenu) as [string, MealInfo][]).map(([mealTime, meal]) => (
              <div key={mealTime} className="border-b border-[var(--border)] pb-2 last:border-0">
                <p className="text-sm font-medium text-[var(--secondary)]">
                  {mealTime === 'breakfast' 
                    ? 'Breakfast' 
                    : mealTime === 'lunch' 
                      ? 'Lunch' 
                      : 'Dinner'}
                </p>
                <p className="text-base">{meal.name}</p>
                <p className="text-xs opacity-70">
                  {mealTypeTranslations[meal.mealType] || meal.mealType}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WeeklyMenu;
