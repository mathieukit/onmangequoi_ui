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
  'petit déjeuner': 'Petit déjeuner',
  'déjeuner': 'Déjeuner',
  'dîner': 'Dîner'
};

const WeeklyMenu: React.FC<WeeklyMenuProps> = ({ menu }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
      {Object.entries(menu).map(([day, dailyMenu]) => {
        // Translate day names to French
        const frenchDay = translateDayName(day);
        
        return (
          <div key={day} className="card">
            <h3 className="text-lg font-semibold mb-3 text-[var(--primary)]">{frenchDay}</h3>
            <div className="space-y-3">
              {(Object.entries(dailyMenu) as [string, MealInfo][]).map(([mealTime, meal]) => (
                <div key={mealTime} className="border-b border-[var(--border)] pb-2 last:border-0">
                  <p className="text-sm font-medium text-[var(--secondary)]">
                    {mealTime === 'breakfast' 
                      ? 'Petit déjeuner' 
                      : mealTime === 'lunch' 
                        ? 'Déjeuner' 
                        : 'Dîner'}
                  </p>
                  <p className="text-base">{meal.name}</p>
                  <p className="text-xs opacity-70">
                    {mealTypeTranslations[meal.mealType] || meal.mealType}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Helper function to translate day names
function translateDayName(englishDay: string): string {
  const dayTranslations: Record<string, string> = {
    'Monday': 'Lundi',
    'Tuesday': 'Mardi',
    'Wednesday': 'Mercredi',
    'Thursday': 'Jeudi',
    'Friday': 'Vendredi',
    'Saturday': 'Samedi',
    'Sunday': 'Dimanche'
  };
  
  return dayTranslations[englishDay] || englishDay;
}

export default WeeklyMenu;
