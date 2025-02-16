import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Box, Text, TouchableOpacity, Image } from '../components/themed';
import { Theme } from '../theme';
import { Product } from '../types/api';
import { RootStackParamList } from '../types/navigation';
import { getTaxonProducts } from '../utils/api';
import { formatMoney, formatProducts } from '../utils/formatters';
import { handleApiError } from '../utils/error-handler';

type CategoryScreenProps = NativeStackScreenProps<RootStackParamList, 'Category'>;

const CategoryScreen = ({ route, navigation }: CategoryScreenProps) => {
  const theme = useTheme<Theme>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getTaxonProducts(route.params.slug);
        const formattedProducts = formatProducts(response.data.data);
        setProducts(formattedProducts);
      } catch (error) {
        console.error('Error fetching category products:', error);
        handleApiError(error, 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [route.params.slug]);

  if (loading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </Box>
    );
  }

  if (!products.length) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" padding="m">
        <Text variant="body" textAlign="center" color="textMuted">
          No products found in this category.
        </Text>
      </Box>
    );
  }

  return (
    <Box flex={1} backgroundColor="mainBackground">
      <FlatList
        data={products}
        numColumns={2}
        contentContainerStyle={{ padding: theme.spacing.m }}
        columnWrapperStyle={{ gap: theme.spacing.s }}
        ItemSeparatorComponent={() => <Box height={theme.spacing.s} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('Product', { slug: item.slug })}
            style={{
              flex: 1,
              backgroundColor: theme.colors.cardBackground,
              borderRadius: theme.borderRadii.m,
              padding: theme.spacing.s,
            }}
          >
            <Image
              source={{ uri: item.images[0]?.url }}
              style={{
                width: '100%',
                height: 150,
                borderRadius: theme.borderRadii.s,
              }}
              resizeMode="cover"
            />
            <Text variant="body" marginTop="s" numberOfLines={2}>{item.name}</Text>
            <Text variant="caption" color="primary" marginTop="xs">
              ${formatMoney(item.price)}
            </Text>
            {item.compareAtPrice && item.compareAtPrice > item.price && (
              <Text 
                variant="caption" 
                color="textMuted" 
                style={{ textDecorationLine: 'line-through' }}
              >
                ${formatMoney(item.compareAtPrice)}
              </Text>
            )}
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
      />
    </Box>
  );
};

export default CategoryScreen;