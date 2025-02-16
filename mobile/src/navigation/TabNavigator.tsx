import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../theme';
import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
import OrdersScreen from '../screens/orders/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { TabParamList } from '../types/navigation';
import { HeaderSearchBar } from '../components/HeaderSearchBar';
import { useStore } from '../contexts/StoreContext';
import { StyleSheet, Platform } from 'react-native';
import { HeaderCartButton } from '../components/HeaderCartButton';

const Tab = createBottomTabNavigator<TabParamList>();

export const TabNavigator = () => {
  const theme = useTheme<Theme>();
  const { store } = useStore();

  // Calculate cart items for badge
  const cartItemCount = store?.cart?.items?.reduce(
    (total: number, item) => total + item.quantity,
    0
  ) || 0;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          ...styles.tabBar,
          borderTopColor: theme.colors.border,
        },
        headerStyle: {
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: theme.colors.text,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
          header: () => <HeaderSearchBar />
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
          tabBarBadge: cartItemCount || undefined,
          tabBarBadgeStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerRight: () => <HeaderCartButton />,
          headerRightContainerStyle: {
            paddingRight: 16,
          }
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersScreen}
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 60,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    paddingTop: 8,
    backgroundColor: 'white',
  },
});