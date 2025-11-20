import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCampsiteStore } from '@/store/campsiteStore';
import { SEO } from '@/components/SEO';
import { OptimizedImage } from '@/components/OptimizedImage';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/Button';
import { formatPrice, formatDate } from '@/utils/validation';

export const CampsiteDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { currentCampsite, fetchCampsiteById, isLoading } = useCampsiteStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (id) {
      fetchCampsiteById(id);
    }
  }, [id, fetchCampsiteById]);

  if (isLoading || !currentCampsite) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const handleReservation = () => {
    // Reservation logic here
    alert('Rezervasyon özelliği yakında eklenecek!');
  };

  return (
    <>
      <SEO
        title={currentCampsite.name}
        description={currentCampsite.description}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            <Link to="/" className="hover:text-primary-600">Ana Sayfa</Link>
            {' > '}
            <Link to="/campsites" className="hover:text-primary-600">Kamp Alanları</Link>
            {' > '}
            <span>{currentCampsite.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Image Gallery */}
              <div className="mb-6">
                <div className="relative h-96 rounded-lg overflow-hidden mb-4">
                  <OptimizedImage
                    src={currentCampsite.images[selectedImage] || '/placeholder-image.jpg'}
                    alt={currentCampsite.name}
                    className="w-full h-full"
                  />
                </div>
                {currentCampsite.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {currentCampsite.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative h-20 rounded-lg overflow-hidden ${
                          selectedImage === index ? 'ring-2 ring-primary-600' : ''
                        }`}
                      >
                        <OptimizedImage
                          src={image}
                          alt={`${currentCampsite.name} ${index + 1}`}
                          className="w-full h-full"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {currentCampsite.name}
                </h1>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  📍 {currentCampsite.location.address}, {currentCampsite.location.city}, {currentCampsite.location.region}
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {currentCampsite.description}
                </p>
              </div>

              {/* Amenities */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Olanaklar
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {currentCampsite.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 text-gray-700 dark:text-gray-300"
                    >
                      <span>✓</span>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rules */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Kurallar
                </h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                  {currentCampsite.rules.map((rule, index) => (
                    <li key={index}>{rule}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Reservation Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-4">
                <div className="mb-6">
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                    {formatPrice(currentCampsite.pricePerNight)}
                    <span className="text-lg font-normal text-gray-500">/gece</span>
                  </div>
                  {currentCampsite.rating && (
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <span>⭐ {currentCampsite.rating.toFixed(1)}</span>
                      {currentCampsite.reviewCount && (
                        <span>({currentCampsite.reviewCount} değerlendirme)</span>
                      )}
                    </div>
                  )}
                </div>

                {!currentCampsite.available && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
                    Bu tarihte müsait değil
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Giriş Tarihi
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Çıkış Tarihi
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleReservation}
                  disabled={!currentCampsite.available || !startDate || !endDate}
                >
                  Rezervasyon Yap
                </Button>

                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                  Kapasite: {currentCampsite.capacity} kişi
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

