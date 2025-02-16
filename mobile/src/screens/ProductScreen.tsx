import React, { useEffect, useState } from 'react';
import { ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Box, Text, TouchableOpacity, Image } from '../components/themed';
import { Theme } from '../theme';
import { RootStackParamList } from '../types/navigation';
import { getProduct, addToCart } from '../utils/api';
import { Product } from '../types/api';

type ProductScreenProps = NativeStackScreenProps<RootStackParamList, 'Product'>;

const ProductScreen = ({ route, navigation }: ProductScreenProps) => {
  const theme = useTheme<Theme>();
  const { slug } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await getProduct(slug);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
        Alert.alert('Error', 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      await addToCart(product.id);
      Alert.alert('Success', 'Product added to cart');
      navigation.navigate('Cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add product to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </Box>
    );
  }

  if (!product) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Text variant="body">Product not found</Text>
      </Box>
    );
  }

  return (
    <Box flex={1} backgroundColor="mainBackground">
      <ScrollView>
        <Box padding="m">
          {product.images[0]?.url && (
            <Image
              source={{ uri: product.images[0].url }}
              style={{
                width: '100%',
                height: 300,
                borderRadius: theme.borderRadii.m,
              }}
              resizeMode="cover"
            />
          )}
          <Box marginTop="m">
            <Text variant="header">{product.name}</Text>
            <Text variant="body" marginTop="s" color="textMuted">
              ${product.price.toFixed(2)}
            </Text>
            <Text variant="body" marginTop="m">
              {product.description}
            </Text>
          </Box>
          <TouchableOpacity
            onPress={handleAddToCart}
            disabled={addingToCart}
            style={{
              backgroundColor: theme.colors.primary,
              padding: theme.spacing.m,
              borderRadius: theme.borderRadii.m,
              marginTop: theme.spacing.l,
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center' }}>
              {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
            </Text>
          </TouchableOpacity>
        </Box>
      </ScrollView>
    </Box>
  );
};

export default ProductScreen;