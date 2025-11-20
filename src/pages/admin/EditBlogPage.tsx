import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { SEO } from '@/components/SEO';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { routes } from '@/config';
import { useBlogStore } from '@/store/blogStore';
import { blogService } from '@/services/blogService';
import { uploadService } from '@/services/uploadService';
import { BlogPost } from '@/types';

export const EditBlogPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentBlog, fetchBlogById, updateBlog, isLoading } = useBlogStore();
  const [allBlogs, setAllBlogs] = useState<BlogPost[]>([]);
  const [selectedRecommendedPosts, setSelectedRecommendedPosts] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Partial<BlogPost>>();

  useEffect(() => {
    if (id) {
      fetchBlogById(id);
    }
  }, [id, fetchBlogById]);

  // Load all blogs for recommended posts selection
  useEffect(() => {
    const loadAllBlogs = async () => {
      try {
        const response = await blogService.getBlogs({}, 1);
        // Get all pages if needed
        let allData = [...response.data];
        if (response.totalPages > 1) {
          for (let page = 2; page <= response.totalPages; page++) {
            const pageResponse = await blogService.getBlogs({}, page);
            allData = [...allData, ...pageResponse.data];
          }
        }
        setAllBlogs(allData);
      } catch (error) {
        console.error('Failed to load blogs for recommendations:', error);
      }
    };
    loadAllBlogs();
  }, []);

  useEffect(() => {
    if (currentBlog) {
      reset(currentBlog);
      setCurrentImageUrl(currentBlog.image || '');
      setImageFile(null);
      // Load recommended posts
      if (currentBlog.recommendedPosts && currentBlog.recommendedPosts.length > 0) {
        setSelectedRecommendedPosts(currentBlog.recommendedPosts);
      } else {
        setSelectedRecommendedPosts([]);
      }
    }
  }, [currentBlog, reset]);

  const onSubmit = async (data: Partial<BlogPost>) => {
    if (!id) return;
    try {
      let finalImageUrl = currentImageUrl;

      // Upload new image if a file is selected
      if (imageFile) {
        setUploadingImage(true);
        try {
          const uploadedFile = await uploadService.uploadImage(imageFile);
          finalImageUrl = uploadService.getFileUrl(uploadedFile.path);
        } catch (error) {
          console.error('Failed to upload image:', error);
          alert('Resim yüklenirken hata oluştu. Lütfen tekrar deneyin.');
          setUploadingImage(false);
          return;
        } finally {
          setUploadingImage(false);
        }
      }

      await updateBlog(id, {
        ...data,
        image: finalImageUrl || data.image,
        recommendedPosts: selectedRecommendedPosts.length > 0 ? selectedRecommendedPosts : undefined,
      });
      navigate(routes.adminBlogs);
    } catch (error) {
      alert('Blog güncellenemedi');
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  if (isLoading && !currentBlog) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <SEO title="Blog Düzenle" description="Blog yazısını düzenleyin" />
      <AdminLayout>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Blog Düzenle
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <Input
              label="Başlık"
              {...register('title', { required: 'Başlık gereklidir' })}
              error={errors.title?.message}
            />

            <Input
              label="Özet"
              {...register('excerpt', { required: 'Özet gereklidir' })}
              error={errors.excerpt?.message}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                İçerik
              </label>
              <textarea
                {...register('content', { required: 'İçerik gereklidir' })}
                rows={10}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.content ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content.message}</p>
              )}
            </div>

            <Input
              label="Yazar"
              {...register('author', { required: 'Yazar gereklidir' })}
              error={errors.author?.message}
            />

            <Input
              label="Kategori"
              {...register('category', { required: 'Kategori gereklidir' })}
              error={errors.category?.message}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Resim
              </label>

              {/* Mevcut Resim */}
              {currentImageUrl && !imageFile && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mevcut Resim:
                  </p>
                  <div className="relative group max-w-md">
                    <img
                      src={currentImageUrl}
                      alt="Blog resmi"
                      className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Yeni Dosya Yükleme */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {currentImageUrl ? 'Yeni Resim Yükle' : 'Resim Yükle'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-500 file:text-white hover:file:bg-primary-600"
                />
                {imageFile && (
                  <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Seçilen: {imageFile.name} ({(imageFile.size / 1024).toFixed(2)} KB)
                    </span>
                  </div>
                )}
              </div>

              {/* URL Ekleme (İsteğe Bağlı) */}
              <details className="mb-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Veya URL ile güncelle (İsteğe Bağlı)
                </summary>
                <div className="mt-2">
                  <Input
                    label="Resim URL"
                    type="url"
                    value={currentImageUrl}
                    onChange={(e) => setCurrentImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </details>
            </div>

            <Input
              label="Okuma Süresi (dakika)"
              type="number"
              {...register('readTime', { required: 'Okuma süresi gereklidir', valueAsNumber: true })}
              error={errors.readTime?.message}
            />

            <Input
              label="Yayın Tarihi"
              type="date"
              {...register('publishedAt', { 
                required: 'Yayın tarihi gereklidir',
                valueAsDate: false
              })}
              error={errors.publishedAt?.message}
            />

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register('featured')}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Öne Çıkar
              </label>
            </div>

            {/* Recommended Posts */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Önerilen Blog Yazıları (En fazla 4 blog seçebilirsiniz)
              </label>
              <div className="max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700">
                {allBlogs.filter(b => b.id !== id).length > 0 ? (
                  allBlogs.filter(b => b.id !== id).map((blog) => (
                    <div key={blog.id} className="flex items-center space-x-2 py-2">
                      <input
                        type="checkbox"
                        checked={selectedRecommendedPosts.includes(blog.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            if (selectedRecommendedPosts.length < 4) {
                              setSelectedRecommendedPosts([...selectedRecommendedPosts, blog.id]);
                            } else {
                              alert('En fazla 4 blog seçebilirsiniz!');
                            }
                          } else {
                            setSelectedRecommendedPosts(selectedRecommendedPosts.filter(postId => postId !== blog.id));
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        disabled={!selectedRecommendedPosts.includes(blog.id) && selectedRecommendedPosts.length >= 4}
                      />
                      <label className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                        {blog.title}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Henüz başka blog yazısı bulunmuyor</p>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Seçilen: {selectedRecommendedPosts.length} / 4 blog
              </p>
            </div>

            <div className="flex space-x-4">
              <Button type="submit" variant="primary" isLoading={isLoading || uploadingImage}>
                {uploadingImage ? 'Resim Yükleniyor...' : 'Güncelle'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(routes.adminBlogs)}
              >
                İptal
              </Button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </>
  );
};

