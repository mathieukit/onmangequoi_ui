import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout, ProtectedRoute } from './components';
import Home from './pages/Home';
import { Login, Register } from './pages/Auth';
import { RecipeList, AddRecipe, RecipeDetail } from './pages/Recipes';
import { WeeklyMenu, GroceryList } from './pages/Menu';
import './App.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public routes */}
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="recipes" element={<RecipeList />} />
              <Route path="recipes/add" element={<AddRecipe />} />
              <Route path="recipes/:id" element={<RecipeDetail />} />
              <Route path="weekly-menu" element={<WeeklyMenu />} />
              <Route path="grocery-list" element={<GroceryList />} />
            </Route>
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
