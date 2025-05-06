'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addRecipe } from '@/services/api';
import RecipeForm from '@/components/RecipeForm';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Recipe } from '@/types';

export default function AddRecipePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (recipe: Recipe) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const result = await addRecipe(recipe);
      
      if (result) {
        setSuccess(true);
        // Reset success message after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        setError('Failed to add recipe. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while adding the recipe.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <section className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4 text-[var(--primary)]">Add New Recipe</h1>
        <p className="mb-6">Create a new recipe to add to your collection</p>
        
        {error && (
          <div className="text-red-500 mb-4 p-3 bg-red-50 rounded-md">{error}</div>
        )}
        
        {success && (
          <div className="text-green-600 mb-4 p-3 bg-green-50 rounded-md">
            Recipe added successfully!
          </div>
        )}
      </section>
      
      {loading ? (
        <div className="card p-8 text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4">Adding recipe...</p>
        </div>
      ) : (
        <div className="card">
          <RecipeForm onSubmit={handleSubmit} />
        </div>
      )}
      
      <div className="mt-6 text-center">
        <button
          onClick={() => router.push('/recipes')}
          className="text-[var(--secondary)] hover:text-[var(--secondary-hover)] transition-colors"
        >
          View all recipes
        </button>
      </div>
    </div>
  );
}
