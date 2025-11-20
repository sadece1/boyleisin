import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useGearStore } from '@/store/gearStore';
import { SEO } from '@/components/SEO';
import { GearCard } from '@/components/GearCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/Button';
import { routes } from '@/config';

export const FavoritesPage = () => {
  const { favorites } = useFavoritesStore();
  const { gear, fetchGear, isLoading } = useGearStore();
  const [favoriteGear, setFavoriteGear] = useState<any[]>([]);

  useEffect(() => {
    // Fetch all gear to filter favorites - use high limit to get all items
    fetchGear({}, 1, 10000);
  }, [fetchGear]);

  useEffect(() => {
    // Update favorite gear when favorites or gear changes
    const favoriteItems = gear.filter((item) => favorites.includes(item.id));
    setFavoriteGear(favoriteItems);
  }, [favorites, gear]);

  return (
    <>
      <SEO title="Favorilerim" description="Favori ürünleriniz" />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Favorilerim
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {favoriteGear.length > 0
                ? `${favoriteGear.length} ürün favorilerinizde`
                : 'Henüz favori ürününüz yok'}
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : favoriteGear.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {favoriteGear.map((item) => (
                <GearCard key={item.id} gear={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">❤️</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Favori listeniz boş
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Beğendiğiniz ürünleri favorilere ekleyerek daha sonra kolayca bulabilirsiniz.
              </p>
              <Link to={routes.gear}>
                <Button variant="primary" size="lg">
                  Ürünlere Gözat
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

