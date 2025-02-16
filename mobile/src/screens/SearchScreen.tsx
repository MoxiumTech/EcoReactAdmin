import React, { useState, useEffect } from 'react';
import { StyleSheet, ActivityIndicator, FlatList, TextInput, Animated } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { Box, Text, TouchableOpacity, Image } from '../components/themed';
import { Theme } from '../theme';
import { Product } from '../types/api';
import { searchProducts } from '../utils/api';
import { formatMoney } from '../utils/formatters';
import { useDebounce } from '../hooks/useDebounce';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Ionicons } from '@expo/vector-icons';
import { handleApiError } from '../utils/error-handler';
import { LoadingScreen } from '../components/LoadingScreen';

type SearchScreenProps = NativeStackScreenProps<RootStackParamList, 'Search'>;

export default function SearchScreen({ route, navigation }: SearchScreenProps) {
  const theme = useTheme<Theme>();
  const [query, setQuery] = useState(route.params?.initialQuery || '');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const debouncedSearch = useDebounce(query, 500);

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    const searchForProducts = async () => {
      if (!debouncedSearch.trim()) {
        setProducts([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await searchProducts(debouncedSearch);
        setProducts(response.data.products);
        startAnimations();
      } catch (err) {
        console.error('Error searching products:', err);
        setError(err as Error);
        handleApiError(err, 'Failed to search products');
      } finally {
        setLoading(false);
      }
    };

    searchForProducts();
  }, [debouncedSearch]);

  const renderItem = ({ item, index }: { item: Product; index: number }) => {
    const animationDelay = index * 100;

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50 + animationDelay, 0],
              }),
            },
          ],
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('Product', { 
            slug: item.slug,
            name: item.name 
          })}
        >
          <Box
            flexDirection="row"
            padding="m"
            backgroundColor="cardBackground"
            borderRadius="m"
            marginBottom="s"
            style={styles.productCard}
          >
            <Image
              source={{ uri: item.images[0]?.url }}
              style={styles.productImage}
            />
            <Box flex={1} marginLeft="m">
              <Text variant="body" numberOfLines={2}>{item.name}</Text>
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
          </Box>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (error) {
    return (
      <LoadingScreen
        error
        errorMessage="Failed to search products. Please try again."
        onRetry={() => setQuery(query)}
      />
    );
  }

  return (
    <Box flex={1} backgroundColor="mainBackground">
      <Box 
        paddingHorizontal="m" 
        paddingVertical="s"
        backgroundColor="cardBackground"
        borderBottomWidth={1}
        borderBottomColor="border"
        flexDirection="row"
        alignItems="center"
      >
        <Box 
          flex={1}
          flexDirection="row"
          alignItems="center"
          backgroundColor="mainBackground"
          borderRadius="m"
          paddingHorizontal="s"
        >
          <Ionicons 
            name="search-outline" 
            size={20} 
            color={theme.colors.textMuted} 
          />
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            placeholder="Search products..."
            placeholderTextColor={theme.colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons 
                name="close-circle" 
                size={20} 
                color={theme.colors.textMuted} 
              />
            </TouchableOpacity>
          )}
        </Box>
      </Box>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: theme.spacing.m }}
        ListEmptyComponent={
          <Box flex={1} justifyContent="center" alignItems="center" marginTop="xl">
            {loading ? (
              <ActivityIndicator size="large" color={theme.colors.primary} />
            ) : (
              <Text variant="body" color="textMuted" textAlign="center">
                {query ? 'No products found' : 'Start typing to search...'}
              </Text>
            )}
          </Box>
        }
        renderItem={renderItem}
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  productCard: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
});