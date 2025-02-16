import React from 'react';
import { HomeLayoutComponent } from '../../types/layout';
import { Box } from '../themed';
import { ProductsCarousel } from './ProductsCarousel';
import { ProductsGrid } from './ProductsGrid';
import { CategoryGrid } from '../CategoryGrid';

interface LayoutComponentProps {
  component: HomeLayoutComponent;
}

export const LayoutComponent: React.FC<LayoutComponentProps> = ({ component }) => {
  const { type, config } = component;

  if (!component.isVisible) {
    return null;
  }

  switch (type) {
    case 'products-carousel':
    case 'featured-products':
      return (
        <Box marginVertical="m">
          <ProductsCarousel
            title={config.title}
            subtitle={config.subtitle}
            products={config.products || []}
          />
        </Box>
      );

    case 'products-grid':
      return (
        <Box marginVertical="m">
          <ProductsGrid
            title={config.title}
            subtitle={config.subtitle}
            products={config.products || []}
            columns={2}
          />
        </Box>
      );

    case 'categories':
      if (!config.taxonomies?.length) {
        return null;
      }
      return (
        <Box marginVertical="m">
          <CategoryGrid
            taxonomies={config.taxonomies}
            title={config.title}
            subtitle={config.subtitle}
            displayStyle={config.displayStyle as 'grid' | 'horizontal'}
          />
        </Box>
      );

    default:
      console.warn(`Unsupported layout component type: ${type}`);
      return null;
  }
};

export const LayoutSection: React.FC<{
  components: HomeLayoutComponent[];
}> = ({ components }) => {
  return (
    <Box>
      {components.map((component) => (
        <LayoutComponent key={component.id} component={component} />
      ))}
    </Box>
  );
};