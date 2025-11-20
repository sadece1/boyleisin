import { Gear } from '@/types';
import { BlogPost } from '@/types';
import { mockBlogPosts } from './blogService';
import { mockGear } from './gearService';
import { categoryService } from './categoryService';

export interface SearchResult {
  blogs: Array<{
    id: string;
    title: string;
    excerpt: string;
    image: string;
    category: string;
  }>;
  gear: Gear[];
}

export const searchService = {
  search(query: string): SearchResult {
    const lowerQuery = query.toLowerCase().trim();

    if (lowerQuery.length < 2) {
      return { blogs: [], gear: [] };
    }

    // Search blogs
    const blogResults = mockBlogPosts
      .filter((blog) => {
        return (
          blog.title.toLowerCase().includes(lowerQuery) ||
          blog.excerpt.toLowerCase().includes(lowerQuery) ||
          blog.category.toLowerCase().includes(lowerQuery) ||
          blog.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
        );
      })
      .map((blog) => ({
        id: blog.id,
        title: blog.title,
        excerpt: blog.excerpt,
        image: blog.image,
        category: blog.category,
      }))
      .slice(0, 10); // Limit to 10 results

    // Search gear
    const allCategoryGear: Gear[] = [];
    try {
      categoryService.getAllCategorySlugs().forEach((slug) => {
        const categoryData = categoryService.getCategoryGear(slug);
        allCategoryGear.push(...categoryData.gear);
      });
    } catch (error) {
      // Category service might not be available, continue with mockGear only
    }

    const allGear = [...mockGear, ...allCategoryGear];
    const gearResults = allGear
      .filter((item) => {
        return (
          item.name.toLowerCase().includes(lowerQuery) ||
          item.description.toLowerCase().includes(lowerQuery) ||
          item.category.toLowerCase().includes(lowerQuery)
        );
      })
      .slice(0, 10); // Limit to 10 results

    return {
      blogs: blogResults,
      gear: gearResults,
    };
  },
};
