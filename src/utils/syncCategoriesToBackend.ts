import { categoryManagementService } from '@/services/categoryManagementService';
import api from '@/services/api';
import { Category } from '@/types';

interface BackendCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id: string | null;
  icon?: string;
  order: number;
}

/**
 * Sync all frontend categories to backend
 * Creates categories that don't exist in backend, maintaining parent-child relationships
 */
export async function syncCategoriesToBackend(): Promise<{
  success: boolean;
  created: number;
  skipped: number;
  errors: string[];
}> {
  const result = {
    success: true,
    created: 0,
    skipped: 0,
    errors: [] as string[],
  };

  try {
    // Get all frontend categories
    const frontendCategories = await categoryManagementService.getAllCategories();

    // Get all backend categories
    const backendResponse = await api.get<{ success: boolean; data: BackendCategory[] }>('/categories');
    const backendCategories = backendResponse.data.success ? backendResponse.data.data : [];

    // Create a map of backend categories by slug for quick lookup
    const backendCategoryMap = new Map<string, BackendCategory>();
    backendCategories.forEach((bc) => {
      backendCategoryMap.set(bc.slug.toLowerCase(), bc);
    });

    // Create a map to track frontend ID -> backend UUID mapping
    const frontendToBackendMap = new Map<string, string>();

    // First pass: Create root categories (no parent)
    const rootCategories = frontendCategories.filter((cat) => !cat.parentId);

    for (const frontendCat of rootCategories) {
      const backendSlug = frontendCat.slug.toLowerCase();
      const existingBackend = backendCategoryMap.get(backendSlug);

      if (existingBackend) {
        frontendToBackendMap.set(frontendCat.id, existingBackend.id);
        result.skipped++;
      } else {
        try {
          const response = await api.post<{ success: boolean; data: BackendCategory }>('/categories', {
            name: frontendCat.name,
            slug: frontendCat.slug,
            description: frontendCat.description && frontendCat.description.trim() ? frontendCat.description.trim() : null,
            parent_id: null,
            icon: frontendCat.icon && frontendCat.icon.trim() ? frontendCat.icon.trim() : null,
            order: frontendCat.order || 0,
          });

          if (response.data.success && response.data.data) {
            const createdCategory = response.data.data;
            frontendToBackendMap.set(frontendCat.id, createdCategory.id);
            backendCategoryMap.set(backendSlug, createdCategory);
            result.created++;
          } else {
            throw new Error('Invalid response from backend');
          }
        } catch (error: any) {
          const errorMsg = `Failed to create "${frontendCat.name}": ${error.response?.data?.message || error.message}`;
          console.error(`❌ ${errorMsg}`);
          result.errors.push(errorMsg);
          // Don't set success = false here, continue with other categories
          // result.success = false;
        }
      }
    }

    // Second pass: Create categories with parents (process by depth)
    const categoriesWithParents = frontendCategories.filter((cat) => cat.parentId);
    let remainingCategories = [...categoriesWithParents];
    let maxIterations = 100; // Prevent infinite loops
    let iteration = 0;

    while (remainingCategories.length > 0 && iteration < maxIterations) {
      iteration++;
      const processedInThisIteration: string[] = [];

      for (const frontendCat of remainingCategories) {
        // Check if parent has been mapped to backend
        const parentBackendId = frontendToBackendMap.get(frontendCat.parentId!);
        if (!parentBackendId) {
          // Parent not yet processed, skip for now
          continue;
        }

        const backendSlug = frontendCat.slug.toLowerCase();
        const existingBackend = backendCategoryMap.get(backendSlug);

        if (existingBackend) {
          frontendToBackendMap.set(frontendCat.id, existingBackend.id);
          result.skipped++;
          processedInThisIteration.push(frontendCat.id);
        } else {
          try {
            const response = await api.post<{ success: boolean; data: BackendCategory }>('/categories', {
              name: frontendCat.name,
              slug: frontendCat.slug,
              description: frontendCat.description && frontendCat.description.trim() ? frontendCat.description.trim() : null,
              parent_id: parentBackendId,
              icon: frontendCat.icon && frontendCat.icon.trim() ? frontendCat.icon.trim() : null,
              order: frontendCat.order || 0,
            });

            if (response.data.success && response.data.data) {
              const createdCategory = response.data.data;
              frontendToBackendMap.set(frontendCat.id, createdCategory.id);
              backendCategoryMap.set(backendSlug, createdCategory);
              result.created++;
              processedInThisIteration.push(frontendCat.id);
            } else {
              throw new Error('Invalid response from backend');
            }
          } catch (error: any) {
            const errorMsg = `Failed to create "${frontendCat.name}": ${error.response?.data?.message || error.message}`;
            console.error(`❌ ${errorMsg}`);
            result.errors.push(errorMsg);
            // Don't set success = false here, continue with other categories
            // result.success = false;
            processedInThisIteration.push(frontendCat.id); // Mark as processed to avoid infinite loop
          }
        }
      }

      // Remove processed categories
      remainingCategories = remainingCategories.filter((cat) => !processedInThisIteration.includes(cat.id));

      if (processedInThisIteration.length === 0 && remainingCategories.length > 0) {
        // No progress made, there might be circular dependencies or missing parents
        console.warn(`⚠️  Warning: ${remainingCategories.length} categories could not be processed. Possible circular dependencies or missing parents.`);
        for (const cat of remainingCategories) {
          const parent = await categoryManagementService.getCategoryById(cat.parentId!);
          const errorMsg = `Could not create "${cat.name}": Parent "${parent?.name || cat.parentId}" not found in backend`;
          console.error(`❌ ${errorMsg}`);
          result.errors.push(errorMsg);
        }
        break;
      }
    }

    // Only mark as unsuccessful if no categories were created and there were errors
    if (result.created === 0 && result.errors.length > 0) {
      result.success = false;
    } else if (result.errors.length > 0) {
      // Some categories were created but there were errors - partial success
      result.success = true;
    }

    return result;
  } catch (error: any) {
    const errorMsg = `Sync failed: ${error.message}`;
    console.error(`❌ ${errorMsg}`);
    result.errors.push(errorMsg);
    // Only mark as unsuccessful if nothing was created
    if (result.created === 0) {
      result.success = false;
    }
    return result;
  }
}

