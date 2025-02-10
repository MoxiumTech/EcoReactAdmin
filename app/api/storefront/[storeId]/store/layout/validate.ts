interface CategoriesConfig {
  title?: string;
  categoryIds: string[];
  displayStyle?: "grid" | "list" | "carousel";
  itemsPerRow?: number;
}

export function validateCategoriesConfig(config: any): config is CategoriesConfig {
  if (!config || typeof config !== 'object') {
    console.error('Categories config is not an object:', config);
    return false;
  }

  if (!Array.isArray(config.categoryIds)) {
    console.error('Categories config missing categoryIds array:', config);
    return false;
  }

  if (config.categoryIds.length === 0) {
    console.error('Categories config has empty categoryIds array');
    return false;
  }

  if (config.title && typeof config.title !== 'string') {
    console.error('Categories config title is not a string:', config.title);
    return false;
  }

  if (config.displayStyle && 
      !['grid', 'list', 'carousel'].includes(config.displayStyle)) {
    console.error('Invalid display style:', config.displayStyle);
    return false;
  }

  if (config.itemsPerRow && 
      (typeof config.itemsPerRow !== 'number' || 
       config.itemsPerRow < 1 || 
       config.itemsPerRow > 6)) {
    console.error('Invalid itemsPerRow:', config.itemsPerRow);
    return false;
  }

  return true;
}
