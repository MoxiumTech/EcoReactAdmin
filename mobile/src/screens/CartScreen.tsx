import React, { useEffect, useState } from 'react';
import { ScrollView, Animated, StyleSheet } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Box, Text, TouchableOpacity, Image } from '../components/themed';
import { Theme } from '../theme';
import { RootStackParamList, TabParamList } from '../types/navigation';
import { CartItem } from '../types/api';
import { getCart, removeFromCart, updateCartItem } from '../utils/api';
import { formatMoney } from '../utils/formatters';
import { handleApiError, showSuccess } from '../utils/error-handler';
import { LoadingScreen } from '../components/LoadingScreen';
import { LoadingOverlay } from '../components/LoadingScreen';
import { useStore } from '../contexts/StoreContext';
import { Ionicons } from '@expo/vector-icons';

type CartScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'CartTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

const CartScreen = ({ navigation }: CartScreenProps) => {
  const theme = useTheme<Theme>();
  const { refreshStore } = useStore();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await getCart();
      setCartItems(response.data.data || []); // Ensure we always have an array
      setError(null);
      startAnimations();
      await refreshStore(); // Update store context with latest cart data
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err as Error);
      handleApiError(err, 'Failed to load cart items');
      setCartItems([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (id: string, quantity: number, productName: string) => {
    if (quantity < 1) {
      handleRemoveItem(id, productName);
      return;
    }

    setUpdating(true);
    try {
      await updateCartItem(id, quantity);
      await fetchCart();
      showSuccess(`Updated quantity of ${productName}`);
    } catch (error) {
      handleApiError(error, 'Failed to update quantity');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveItem = async (id: string, productName: string) => {
    setUpdating(true);
    try {
      await removeFromCart(id);
      await fetchCart();
      showSuccess(`Removed ${productName} from cart`);
    } catch (error) {
      handleApiError(error, 'Failed to remove item');
    } finally {
      setUpdating(false);
    }
  };

  const calculateTotal = () => {
    if (!cartItems?.length) return 0;
    return cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  if (loading) {
    return <LoadingScreen message="Loading cart..." />;
  }

  if (error) {
    return (
      <LoadingScreen
        error
        errorMessage="Unable to load cart. Please try again."
        onRetry={fetchCart}
      />
    );
  }

  const AnimatedBox = Animated.createAnimatedComponent(Box);

  return (
    <Box flex={1} backgroundColor="mainBackground">
      {updating && <LoadingOverlay message="Updating cart..." />}
      <ScrollView>
        <AnimatedBox 
          padding="m"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {!cartItems?.length ? (
            <Box marginTop="l" alignItems="center">
              <Ionicons 
                name="cart-outline" 
                size={48} 
                color={theme.colors.textMuted} 
              />
              <Text variant="body" color="textMuted" marginTop="m" textAlign="center">
                Your cart is empty
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Main', { screen: 'HomeTab' })}
                style={styles.continueButton}
              >
                <Text variant="body" color="primary">Continue Shopping</Text>
              </TouchableOpacity>
            </Box>
          ) : (
            <>
              {cartItems.map((item, index) => (
                <Animated.View
                  key={item.id}
                  style={{
                    opacity: fadeAnim,
                    transform: [{
                      translateX: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50 * (index + 1), 0],
                      }),
                    }],
                  }}
                >
                  <Box
                    padding="m"
                    marginTop="m"
                    backgroundColor="cardBackground"
                    borderRadius="m"
                    style={styles.cartItem}
                  >
                    <Box flexDirection="row">
                      {item.product.images[0]?.url && (
                        <Image
                          source={{ uri: item.product.images[0].url }}
                          style={styles.productImage}
                        />
                      )}
                      <Box marginLeft="m" flex={1}>
                        <Text variant="body">{item.product.name}</Text>
                        <Text variant="caption" marginTop="xs">
                          ${formatMoney(item.product.price)}
                        </Text>
                        <Box
                          flexDirection="row"
                          alignItems="center"
                          marginTop="s"
                        >
                          <TouchableOpacity
                            onPress={() => handleUpdateQuantity(item.id, item.quantity - 1, item.product.name)}
                            disabled={updating}
                            style={styles.quantityButton}
                          >
                            <Text fontSize={20}>-</Text>
                          </TouchableOpacity>
                          <Text marginHorizontal="m">{item.quantity}</Text>
                          <TouchableOpacity
                            onPress={() => handleUpdateQuantity(item.id, item.quantity + 1, item.product.name)}
                            disabled={updating}
                            style={styles.quantityButton}
                          >
                            <Text fontSize={20}>+</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleRemoveItem(item.id, item.product.name)}
                            disabled={updating}
                            style={styles.removeButton}
                          >
                            <Text color="error">Remove</Text>
                          </TouchableOpacity>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Animated.View>
              ))}
              <Box
                marginTop="l"
                padding="m"
                backgroundColor="cardBackground"
                borderRadius="m"
                style={styles.summaryCard}
              >
                <Text variant="subheader">Order Summary</Text>
                <Box
                  flexDirection="row"
                  justifyContent="space-between"
                  marginTop="m"
                >
                  <Text variant="body">Total</Text>
                  <Text variant="body">${formatMoney(calculateTotal())}</Text>
                </Box>
              </Box>
              <TouchableOpacity
                style={[styles.checkoutButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => navigation.navigate('Checkout')}
                disabled={updating}
              >
                <Text style={styles.checkoutButtonText}>
                  Proceed to Checkout
                </Text>
              </TouchableOpacity>
            </>
          )}
        </AnimatedBox>
      </ScrollView>
    </Box>
  );
};

const styles = StyleSheet.create({
  cartItem: {
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
  quantityButton: {
    padding: 8,
  },
  removeButton: {
    marginLeft: 'auto',
    padding: 8,
  },
  summaryCard: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  checkoutButton: {
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    marginBottom: 32,
  },
  checkoutButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    marginTop: 16,
    padding: 8,
  },
});

export default CartScreen;