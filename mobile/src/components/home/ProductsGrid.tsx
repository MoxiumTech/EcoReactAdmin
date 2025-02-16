import React from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Box, Text, TouchableOpacity, Image } from '../themed';
import { Theme } from '../../theme';
import { Product } from '../../types/api';
import { RootStackParamList } from '../../types/navigation';
import { formatMoney } from '../../utils/formatters';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ProductsGridProps {
  title?: string;
  subtitle?: string;
  products: Product[];
  columns?: number;
}

export const ProductsGrid: React.FC<ProductsGridProps> = ({
  title,
  subtitle,
  products,
  columns = 2
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
      <Box 
        flexDirection="row" 
        flexWrap="wrap" 
        paddingHorizontal="m" 
        style={styles.gridContainer}
      >
        {products.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => navigation.navigate('Product', { slug: item.slug })}
            style={[
              styles.productItem,
              {
                width: `${100 / columns - 2}%`,
                marginBottom: theme.spacing.m,
              }
            ]}
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
        ))}
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    gap: 8,
  },
  productItem: {
    marginHorizontal: '1%',
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