import React from 'react';
import { FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { Box, Text, Image } from './themed';
import { Theme } from '../theme';
import { Taxonomy, Taxon } from '../types/api';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export interface CategoryGridProps {
  taxonomies: Taxonomy[];
  title?: string;
  subtitle?: string;
  displayStyle?: 'grid' | 'horizontal';
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ 
  taxonomies,
  title = "Shop by Category",
  subtitle,
  displayStyle = 'horizontal'
}) => {
  const theme = useTheme<Theme>();
  const navigation = useNavigation<NavigationProp>();

  // Flatten taxonomies to get all taxons
  const categories = taxonomies.reduce((acc: Taxon[], taxonomy) => {
    if (!taxonomy.taxons) return acc;
    return [...acc, ...taxonomy.taxons];
  }, []);

  if (!categories.length) return null;

  return (
    <Box paddingHorizontal="m">
      <Text variant="subheader" marginBottom="s">{title}</Text>
      {subtitle && (
        <Text variant="body" color="textMuted" marginBottom="m">
          {subtitle}
        </Text>
      )}
      <FlatList
        data={categories}
        horizontal={displayStyle === 'horizontal'}
        numColumns={displayStyle === 'grid' ? 2 : undefined}
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <Box width={theme.spacing.s} height={theme.spacing.s} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('Category', { slug: item.slug })}
            style={[
              styles.categoryItem,
              displayStyle === 'grid' && styles.gridItem
            ]}
          >
            <Box
              backgroundColor="cardBackground"
              borderRadius="m"
              padding="m"
              alignItems="center"
              style={styles.categoryBox}
            >
              {(item.thumbnailUrl || item.bannerUrl) && (
                <Image
                  source={{ uri: item.thumbnailUrl || item.bannerUrl }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: theme.borderRadii.s,
                  }}
                  resizeMode="cover"
                />
              )}
              <Text 
                variant="body" 
                marginTop="s" 
                textAlign="center"
                numberOfLines={2}
              >
                {item.name}
              </Text>
              {item.products && (
                <Text
                  variant="caption"
                  color="textMuted"
                  marginTop="xs"
                >
                  {item.products.length} items
                </Text>
              )}
            </Box>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
      />
    </Box>
  );
};

const styles = StyleSheet.create({
  categoryItem: {
    width: 120,
    marginBottom: 12,
  },
  gridItem: {
    flex: 1,
    marginHorizontal: 6,
  },
  categoryBox: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
});