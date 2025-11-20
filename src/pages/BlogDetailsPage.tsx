import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SEO } from '@/components/SEO';
import { OptimizedImage } from '@/components/OptimizedImage';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatDate } from '@/utils/validation';
import { routes } from '@/config';
import { useBlogStore } from '@/store/blogStore';
import { BlogPost } from '@/types';

gsap.registerPlugin(ScrollTrigger);

export const BlogDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { currentBlog, fetchBlogById, blogs, fetchBlogs, isLoading } = useBlogStore();
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  // Fetch blog by id
  useEffect(() => {
    if (id) {
      fetchBlogById(id);
    }
  }, [id, fetchBlogById]);

  // Load all blogs for related posts
  useEffect(() => {
    if (blogs.length === 0) {
      fetchBlogs({}, 1);
    }
  }, [blogs.length, fetchBlogs]);

  // Set related posts
  useEffect(() => {
    if (currentBlog && blogs.length > 0) {
      // If recommendedPosts exist, use them; otherwise use same category posts
      if (currentBlog.recommendedPosts && currentBlog.recommendedPosts.length > 0) {
        const recommended = currentBlog.recommendedPosts
          .map(postId => blogs.find(blog => blog.id === postId))
          .filter((blog): blog is BlogPost => blog !== undefined && blog.id !== currentBlog.id)
          .slice(0, 4);
        setRelatedPosts(recommended);
      } else {
        // Get same category posts as related (fallback)
        const related = blogs
          .filter(blog => blog.id !== currentBlog.id && blog.category === currentBlog.category)
          .slice(0, 4);
        setRelatedPosts(related);
      }
    }
  }, [currentBlog, blogs]);

  useEffect(() => {
    if (contentRef.current && currentBlog) {
      const timer = setTimeout(() => {
        // Animate content on scroll
        const elements = contentRef.current?.querySelectorAll('h2, h3, p, ul, ol');
        if (elements && elements.length > 0) {
          gsap.set(elements, { opacity: 0, y: 30 });
          
          gsap.to(elements, {
            scrollTrigger: {
              trigger: contentRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
              once: true,
            },
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
          });
        }

        ScrollTrigger.refresh();
      }, 100);

      return () => {
        clearTimeout(timer);
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      };
    }
  }, [currentBlog]);

  const handleShare = (platform: string) => {
    if (!currentBlog) return;
    const url = window.location.href;
    const text = currentBlog.title || '';
    
    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };
    
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  if (isLoading && !currentBlog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentBlog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Blog yazısı bulunamadı
          </h2>
          <Link 
            to={routes.blog} 
            className="text-primary-600 dark:text-primary-400 hover:underline font-semibold"
          >
            ← Bloga Dön
          </Link>
        </div>
      </div>
    );
  }

  const post = currentBlog;

  return (
    <>
      <SEO 
        title={`${post.title} - WeCamp Blog | Kamp Rehberi ve İpuçları`} 
        description={post.excerpt || post.content?.substring(0, 160).replace(/<[^>]*>/g, '') || post.title}
        keywords={`${post.tags?.join(', ') || ''}, kamp, kamp rehberi, outdoor, doğa, ${post.category}`}
      />

      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Hero Image */}
        <section className="relative h-[400px] md:h-[500px] overflow-hidden">
          <OptimizedImage
            src={post.image || ''}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute top-4 left-4">
            <span className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-full">
              {post.category}
            </span>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
          {/* Main Content */}
          <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <header className="p-8 md:p-12 border-b border-gray-200 dark:border-gray-700">
              <div className="mb-4">
                <Link
                  to={routes.blog}
                  className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:underline mb-4 text-sm font-medium"
                >
                  <span className="mr-2">←</span>
                  Bloga Dön
                </Link>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <span className="mr-2">👤</span>
                  <span className="font-medium">{post.author}</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📅</span>
                  <span>{formatDate(post.publishedAt)}</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📖</span>
                  <span>{post.readTime} dakika okuma</span>
                </div>
                {post.views && (
                  <div className="flex items-center">
                    <span className="mr-2">👁️</span>
                    <span>{post.views.toLocaleString('tr-TR')} görüntülenme</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Social Share */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Paylaş:</span>
                <button
                  onClick={() => handleShare('twitter')}
                  className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  aria-label="Twitter'da paylaş"
                >
                  🐦
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="p-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors"
                  aria-label="Facebook'ta paylaş"
                >
                  📘
                </button>
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  aria-label="WhatsApp'ta paylaş"
                >
                  💬
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  aria-label="LinkedIn'de paylaş"
                >
                  💼
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                  className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  aria-label="Linki kopyala"
                >
                  🔗
                </button>
              </div>
            </header>

            {/* Content */}
            <div 
              ref={contentRef}
              className="prose prose-lg dark:prose-invert max-w-none p-8 md:p-12 text-gray-700 dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: post.content || '' }}
              style={{
                '--tw-prose-headings': '#1f2937',
                '--tw-prose-body': '#4b5563',
                '--tw-prose-links': '#059669',
                '--tw-prose-bold': '#1f2937',
              } as React.CSSProperties}
            />

            {/* Author Bio - if available */}
            {post.author && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-8 md:p-12 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-2xl text-white font-bold flex-shrink-0">
                    {post.author.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {post.author}
                    </h3>
                  </div>
                </div>
              </div>
            )}
          </article>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="mt-12 mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                İlgili Yazılar
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    to={`/blog/${relatedPost.id}`}
                    className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="relative h-40 overflow-hidden">
                      <OptimizedImage
                        src={relatedPost.image || ''}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <span className="inline-block px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs rounded-full mb-2">
                        {relatedPost.category}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {relatedPost.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <span className="mr-3">📖 {relatedPost.readTime} dk</span>
                        {relatedPost.views && (
                          <span>👁️ {relatedPost.views}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Back to Blog */}
          <div className="mb-12 text-center">
            <Link
              to={routes.blog}
              className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
            >
              <span className="mr-2">←</span>
              Tüm Yazıları Gör
            </Link>
          </div>
        </div>

        {/* Add custom styles for prose content */}
        <style>{`
          .prose {
            color: #4b5563;
          }
          .dark .prose {
            color: #d1d5db;
          }
          .prose p {
            color: #4b5563;
            margin-bottom: 1.25rem;
            line-height: 1.75;
          }
          .dark .prose p {
            color: #d1d5db;
          }
          .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
            font-weight: 700;
            margin-top: 2rem;
            margin-bottom: 1rem;
            color: #1f2937;
            line-height: 1.2;
          }
          .dark .prose h1, .dark .prose h2, .dark .prose h3, .dark .prose h4, .dark .prose h5, .dark .prose h6 {
            color: #f9fafb;
          }
          .prose h2 {
            font-size: 1.875rem;
          }
          .dark .prose h2 {
            color: #f9fafb;
          }
          .prose h3 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #374151;
          }
          .dark .prose h3 {
            color: #e5e7eb;
          }
          .prose .lead {
            font-size: 1.25rem;
            font-weight: 500;
            color: #4b5563;
            margin-bottom: 2rem;
          }
          .dark .prose .lead {
            color: #9ca3af;
          }
          .prose ul, .prose ol {
            margin: 1rem 0;
            padding-left: 1.5rem;
            color: #4b5563;
          }
          .dark .prose ul, .dark .prose ol {
            color: #d1d5db;
          }
          .prose li {
            margin: 0.5rem 0;
            line-height: 1.75;
            color: #4b5563;
          }
          .dark .prose li {
            color: #d1d5db;
          }
          .prose strong {
            font-weight: 600;
            color: #1f2937;
          }
          .dark .prose strong {
            color: #f9fafb;
          }
          .prose a {
            color: #059669;
            text-decoration: underline;
          }
          .dark .prose a {
            color: #10b981;
          }
          .prose code {
            color: #1f2937;
            background-color: #f3f4f6;
            padding: 0.125rem 0.375rem;
            border-radius: 0.25rem;
            font-size: 0.875em;
          }
          .dark .prose code {
            color: #f9fafb;
            background-color: #374151;
          }
          .prose blockquote {
            border-left: 4px solid #e5e7eb;
            padding-left: 1rem;
            color: #6b7280;
            font-style: italic;
          }
          .dark .prose blockquote {
            border-left-color: #4b5563;
            color: #9ca3af;
          }
          .prose table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
          }
          .prose th, .prose td {
            border: 1px solid #e5e7eb;
            padding: 0.5rem;
            text-align: left;
            color: #4b5563;
          }
          .dark .prose th, .dark .prose td {
            border-color: #4b5563;
            color: #d1d5db;
          }
          .prose th {
            background-color: #f9fafb;
            font-weight: 600;
            color: #1f2937;
          }
          .dark .prose th {
            background-color: #374151;
            color: #f9fafb;
          }
        `}</style>
      </div>
    </>
  );
};
