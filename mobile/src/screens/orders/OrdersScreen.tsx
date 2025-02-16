import React, { useEffect, useState, useLayoutEffect } from 'react';
import { FlatList, StyleSheet, RefreshControl, Animated } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Box, Text, TouchableOpacity } from '../../components/themed';
import { Theme } from '../../theme';
import { RootStackParamList, TabParamList } from '../../types/navigation';
import { Order, ORDER_STATUSES } from '../../types/api';
import { useAuth } from '../../contexts/AuthContext';
import { getOrders } from '../../utils/api';
import { handleApiError } from '../../utils/error-handler';
import { formatMoney } from '../../utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { LoadingScreen } from '../../components/LoadingScreen';

type OrdersScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'OrdersTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

const OrdersScreen = ({ navigation }: OrdersScreenProps) => {
  const theme = useTheme<Theme>();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Animation value for fade-in effect
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const fetchOrders = async () => {
    try {
      const response = await getOrders();
      setOrders(response.data.data);
      setError(null);
      // Start fade-in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err as Error);
      handleApiError(err, 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      navigation.navigate('ProfileTab');
    }
  }, [user, navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const renderOrderStatus = (state: string) => {
    const status = ORDER_STATUSES[state as keyof typeof ORDER_STATUSES];
    if (!status) return null;

    return (
      <Box
        paddingVertical="xs"
        paddingHorizontal="s"
        borderRadius="s"
        style={{ backgroundColor: status.color + '20' }}
      >
        <Text
          variant="caption"
          style={{ color: status.color, fontWeight: '600' }}
        >
          {status.label}
        </Text>
      </Box>
    );
  };

  if (loading) {
    return <LoadingScreen message="Loading orders..." />;
  }

  if (error) {
    return (
      <LoadingScreen
        error
        errorMessage={error.message === "No refresh token available"
          ? "Please sign in to view your orders"
          : "Unable to load orders. Please try again."}
        onRetry={error.message === "No refresh token available"
          ? () => navigation.navigate('ProfileTab')
          : fetchOrders}
      />
    );
  }

  return (
    <Box flex={1} backgroundColor="mainBackground">
      <Animated.FlatList
        data={orders}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ padding: theme.spacing.m }}
        ListEmptyComponent={() => (
          <Box flex={1} justifyContent="center" alignItems="center" padding="xl">
            <Ionicons 
              name="receipt-outline" 
              size={48} 
              color={theme.colors.textMuted} 
            />
            <Text variant="body" color="textMuted" marginTop="m" textAlign="center">
              No orders yet
            </Text>
          </Box>
        )}
        ItemSeparatorComponent={() => <Box height={theme.spacing.s} />}
        renderItem={({ item: order, index }) => (
          <Animated.View
            style={[
              styles.orderCard,
              {
                opacity: fadeAnim,
                transform: [{
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                }],
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => navigation.navigate('Order', { 
                id: order.id,
                orderNumber: order.number
              })}
            >
              <Box
                backgroundColor="cardBackground"
                borderRadius="m"
                padding="m"
              >
                <Box flexDirection="row" justifyContent="space-between" marginBottom="s">
                  <Text variant="body" fontWeight="bold">
                    Order #{order.number}
                  </Text>
                  {renderOrderStatus(order.state)}
                </Box>

                <Box flexDirection="row" justifyContent="space-between" marginTop="s">
                  <Text variant="caption" color="textMuted">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Text>
                  <Text variant="body" color="primary">
                    ${formatMoney(order.total)}
                  </Text>
                </Box>

                <Box marginTop="m">
                  <Text variant="caption" color="textMuted">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </Text>
                </Box>
              </Box>
            </TouchableOpacity>
          </Animated.View>
        )}
      />
    </Box>
  );
};

const styles = StyleSheet.create({
  orderCard: {
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

export default OrdersScreen;