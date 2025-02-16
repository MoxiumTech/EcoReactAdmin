import React from 'react';
import { FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Box, Text, Image } from '../themed';
import { Theme } from '../../theme';
import { Product } from '../../types/api';
import { RootStackParamList } from '../../types/navigation';
import { formatMoney } from '../../utils/formatters';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ProductsCarouselProps {
  title?: string;
  subtitle?: string;
  products: Product[];
}

export const ProductsCarousel: React.FC<ProductsCarouselProps> = ({
  title,
  subtitle,
  products
}) => {
  const theme = useTheme<Theme>();
  const navigation = useNavigation<NavigationProp>();

  if (!products.length) return null;

  return (
    <Box>
      {title && <Text variant="subheader" marginBottom="s" paddingHorizontal="m">{title}</Text>}
      {subtitle && (
        <Text variant="body" color="textMuted" marginBottom="m" paddingHorizontal="m">
          {subtitle}
        </Text>
      )}
      <FlatList
        data={products}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: theme.spacing.m }}
        ItemSeparatorComponent={() => <Box width={theme.spacing.s} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('Product', { slug: item.slug })}
            style={styles.productItem}
          >
            <Box
              backgroundColor="cardBackground"
              borderRadius="m"
              padding="s"
              style={styles.productBox}
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
            </Box>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
      />
    </Box>
  );
};

const styles = StyleSheet.create({
  productItem: {
    width: 180,
  },
  productBox: {
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