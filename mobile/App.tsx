import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider } from '@shopify/restyle';
import { theme } from './src/theme';
import { RootStackParamList } from './src/types/navigation';
import { StoreProvider } from './src/contexts/StoreContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { TabNavigator } from './src/navigation/TabNavigator';
import { ToastProvider, useToast } from './src/components/Toast';
import { initializeErrorHandler } from './src/utils/error-handler';

// Screens
import ProductScreen from './src/screens/ProductScreen';
import SearchScreen from './src/screens/SearchScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import CategoryScreen from './src/screens/CategoryScreen';
import OrderDetailsScreen from './src/screens/orders/OrderDetailsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Initialize error handler with toast
const AppContent = () => {
  const { showToast } = useToast();

  useEffect(() => {
    initializeErrorHandler(showToast);
  }, [showToast]);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerBackTitle: 'Back',
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Product" 
          component={ProductScreen}
          options={({ route }) => ({ 
            title: route.params.name || 'Product Details'
          })}
        />
        <Stack.Screen 
          name="Category" 
          component={CategoryScreen}
          options={({ route }) => ({ 
            title: route.params.name || 'Category'
          })}
        />
        <Stack.Screen 
          name="Search" 
          component={SearchScreen}
          options={{ 
            title: 'Search',
            presentation: 'modal',
            animation: 'slide_from_bottom'
          }}
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ 
            headerShown: false,
            presentation: 'modal' 
          }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen}
          options={{ 
            headerShown: false,
            presentation: 'modal' 
          }}
        />
        <Stack.Screen 
          name="Order" 
          component={OrderDetailsScreen}
          options={({ route }) => ({ 
            title: route.params.orderNumber 
              ? `Order #${route.params.orderNumber}`
              : 'Order Details'
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <StoreProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </StoreProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
