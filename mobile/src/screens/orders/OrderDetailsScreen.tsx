import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Box, Text, Image } from '../../components/themed';
import { Theme } from '../../theme';
import { RootStackParamList } from '../../types/navigation';
import { Order, ORDER_STATUSES } from '../../types/api';
import { getOrder } from '../../utils/api';
import { handleApiError } from '../../utils/error-handler';
import { formatMoney } from '../../utils/formatters';
import { LoadingScreen } from '../../components/LoadingScreen';

type OrderDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'Order'>;

const OrderDetailsScreen = ({ route }: OrderDetailsScreenProps) => {
  const theme = useTheme<Theme>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await getOrder(route.params.id);
        setOrder(response.data.data);
        setError(null);
        startAnimations();
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err as Error);
        handleApiError(err, 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [route.params.id]);

  if (loading) {
    return <LoadingScreen message="Loading order details..." />;
  }

  if (error || !order) {
    return (
      <LoadingScreen
        error
        errorMessage="Unable to load order details. Please try again."
        onRetry={() => {
          setLoading(true);
          getOrder(route.params.id)
            .then(response => {
              setOrder(response.data.data);
              setError(null);
              startAnimations();
            })
            .catch(err => {
              setError(err as Error);
              handleApiError(err, 'Failed to load order details');
            })
            .finally(() => setLoading(false));
        }}
      />
    );
  }

  const status = ORDER_STATUSES[order.state as keyof typeof ORDER_STATUSES];

  const AnimatedBox = Animated.createAnimatedComponent(Box);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.mainBackground }}>
      <AnimatedBox
        padding="m"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* Order Status */}
        <Box
          backgroundColor="cardBackground"
          borderRadius="m"
          padding="m"
          style={styles.card}
        >
          <Box flexDirection="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Text variant="caption" color="textMuted">Order Number</Text>
              <Text variant="subheader" marginTop="xs">#{order.number}</Text>
            </Box>
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
          </Box>
          <Box marginTop="m">
            <Text variant="caption" color="textMuted">Order Date</Text>
            <Text variant="body" marginTop="xs">
              {new Date(order.createdAt).toLocaleDateString()}
            </Text>
          </Box>
        </Box>

        {/* Order Items */}
        <Box marginTop="m">
          <Text variant="subheader" marginBottom="m">Order Items</Text>
          {order.items.map((item, index) => (
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
                backgroundColor="cardBackground"
                borderRadius="m"
                padding="m"
                marginBottom="s"
                style={styles.card}
              >
                <Box flexDirection="row">
                  <Image
                    source={{ uri: item.product.images[0]?.url }}
                    style={styles.productImage}
                  />
                  <Box flex={1} marginLeft="m">
                    <Text variant="body" numberOfLines={2}>{item.product.name}</Text>
                    <Text variant="caption" color="textMuted" marginTop="xs">
                      Quantity: {item.quantity}
                    </Text>
                    <Text variant="body" color="primary" marginTop="xs">
                      ${formatMoney(item.product.price * item.quantity)}
                    </Text>
                  </Box>
                </Box>
              </Box>
            </Animated.View>
          ))}
        </Box>

        {/* Order Summary */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Box
            backgroundColor="cardBackground"
            borderRadius="m"
            padding="m"
            marginTop="m"
            style={styles.card}
          >
            <Text variant="subheader" marginBottom="m">Order Summary</Text>
            <Box flexDirection="row" justifyContent="space-between" marginBottom="s">
              <Text variant="body" color="textMuted">Subtotal</Text>
              <Text variant="body">${formatMoney(order.total)}</Text>
            </Box>
            <Box flexDirection="row" justifyContent="space-between" marginTop="m">
              <Text variant="subheader">Total</Text>
              <Text variant="subheader" color="primary">
                ${formatMoney(order.total)}
              </Text>
            </Box>
          </Box>
        </Animated.View>
      </AnimatedBox>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
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

export default OrderDetailsScreen;