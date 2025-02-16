import React from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Box, Text } from './themed';
import { Theme } from '../theme';
import { RootStackParamList } from '../types/navigation';
import { useStore } from '../contexts/StoreContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HeaderCartButton = () => {
  const theme = useTheme<Theme>();
  const navigation = useNavigation<NavigationProp>();
  const { store } = useStore();

  // Create animated value for badge pulse effect
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  // Calculate total items in cart, safely handling undefined values
  const cartItemCount = React.useMemo(() => {
    if (!store?.cart?.items) return 0;
    return store.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [store?.cart?.items]);

  // Pulse animation when cart count changes
  React.useEffect(() => {
    if (cartItemCount > 0) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [cartItemCount]);

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Main', { screen: 'CartTab' })}
      style={styles.container}
      accessibilityLabel={`Shopping cart with ${cartItemCount} items`}
      accessibilityRole="button"
    >
      <Ionicons
        name="cart-outline"
        size={24}
        color={theme.colors.text}
      />
      {cartItemCount > 0 && (
        <Animated.View
          style={[
            styles.badge,
            {
              backgroundColor: theme.colors.primary,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Text
            variant="caption"
            color="white"
            style={styles.badgeText}
          >
            {cartItemCount > 99 ? '99+' : cartItemCount}
          </Text>
        </Animated.View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});