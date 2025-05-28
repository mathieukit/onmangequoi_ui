export interface Ingredient {
  item: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id?: number;
  name: string;
  mealType: string;
  ingredients: Ingredient[];
}

export interface User {
  username: string;
  token?: string;
}

export interface GroceryItem {
  item: string;
  quantity: number;
  unit: string;
}

export interface MealServing {
  recipe_name: string;
  recipe_id?: number; // Add recipe_id field
  people_count: number;
}

export interface MealTimeSlot {
  meals: MealServing[];
}

export interface MenuDay {
  date: string;
  breakfast: MealTimeSlot;
  lunch: MealTimeSlot;
  dinner: MealTimeSlot;
}

export interface Menu {
  id?: number;
  name: string;
  days: MenuDay[];
}

// Legacy interface for backward compatibility
export interface WeeklyMenu {
  [day: string]: {
    breakfast: {
      name: string;
      mealType: string;
    };
    lunch: {
      name: string;
      mealType: string;
    };
    dinner: {
      name: string;
      mealType: string;
    };
  };
}

export interface MenuSummary {
  id: number;
  name: string;
}

export interface ApiResponse<T> {
  message: string;
  [key: string]: any;
}
