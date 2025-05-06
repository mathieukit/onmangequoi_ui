export interface Ingredient {
  item: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  name: string;
  mealType: string;
  ingredients: Ingredient[];
}

export interface DailyMenu {
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
}

export interface WeeklyMenu {
  Monday: DailyMenu;
  Tuesday: DailyMenu;
  Wednesday: DailyMenu;
  Thursday: DailyMenu;
  Friday: DailyMenu;
  Saturday: DailyMenu;
  Sunday: DailyMenu;
}

export interface WeeklyMenuResponse {
  message: string;
  menu: WeeklyMenu;
  grocery_list?: Ingredient[];
}

export interface RecipesResponse {
  message: string;
  recipes: Recipe[];
}

export interface GroceryListResponse {
  message: string;
  ingredients: Ingredient[];
}
