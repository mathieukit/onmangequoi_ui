'use client';

import { useState, useEffect } from 'react';
import { generateWeeklyMenu } from '@/services/api';
import WeeklyMenu from '@/components/WeeklyMenu';
import GroceryList from '@/components/GroceryList';
import LoadingSpinner from '@/components/LoadingSpinner';
import { WeeklyMenuResponse } from '@/types';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [menuData, setMenuData] = useState<WeeklyMenuResponse | null>(null);
  const [includeGroceryList, setIncludeGroceryList] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateMenu = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await generateWeeklyMenu(includeGroceryList);
      setMenuData(data);
    } catch (err) {
      setError('Échec de la génération du menu. Veuillez réessayer plus tard.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <section className="mb-12 text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-[var(--primary)]">OnMangeQuoi</h1>
          <p className="text-xl mb-6">Générez votre menu hebdomadaire et liste de courses facilement</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                id="includeGroceryList"
                checked={includeGroceryList}
                onChange={(e) => setIncludeGroceryList(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="includeGroceryList">Inclure la liste de courses</label>
            </div>
            
            <button
              onClick={handleGenerateMenu}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <LoadingSpinner size="small" />
                  <span className="ml-2">Génération en cours...</span>
                </span>
              ) : (
                'Générer Menu Hebdomadaire'
              )}
            </button>
          </div>
          
          {error && (
            <div className="text-red-500 mb-4">{error}</div>
          )}
        </div>
        
        {loading && !menuData && (
          <div className="py-12">
            <LoadingSpinner size="large" />
          </div>
        )}
        
        {!menuData && !loading && (
          <div className="card p-8 text-center">
            <p className="text-lg mb-4">Bienvenue sur OnMangeQuoi !</p>
            <p>Cliquez sur le bouton ci-dessus pour générer votre menu hebdomadaire.</p>
          </div>
        )}
      </section>
      
      {menuData && (
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-center">Votre Menu Hebdomadaire</h2>
            <WeeklyMenu menu={menuData.menu} />
          </section>
          
          {menuData.grocery_list && (
            <section>
              <h2 className="text-2xl font-semibold mb-6 text-center">Liste de Courses</h2>
              <GroceryList ingredients={menuData.grocery_list} />
            </section>
          )}
        </div>
      )}
    </div>
  );
}
