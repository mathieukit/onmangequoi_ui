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

export interface ApiResponse<T> {
  message: string;
  [key: string]: any;
}
