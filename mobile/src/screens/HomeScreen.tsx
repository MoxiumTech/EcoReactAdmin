import React, { useState } from 'react';
import { ScrollView, RefreshControl, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { Box } from '../components/themed';
import { Theme } from '../theme';
import { useStore } from '../contexts/StoreContext';
import { handleApiError } from '../utils/error-handler';
import { LayoutSection } from '../components/home/LayoutComponent';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, TabParamList } from '../types/navigation';
import { LoadingScreen } from '../components/LoadingScreen';

type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'HomeTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

const HomeScreen = () => {
  const theme = useTheme<Theme>();
  const { store, layout, loading, error, refreshStore } = useStore();
  const [refreshing, setRefreshing] = useState(false);

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    if (!loading && layout) {
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
    }
  }, [loading, layout]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshStore();
    } catch (error) {
      console.error('Error refreshing store:', error);
      handleApiError(error, 'Failed to refresh store data');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading store..." />;
  }

  if (error || !store || !layout) {
    return (
      <LoadingScreen
        error
        errorMessage="Unable to load store data. Please check your connection and try again."
        onRetry={refreshStore}
      />
    );
  }

  const AnimatedBox = Animated.createAnimatedComponent(Box);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.mainBackground }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Layout Components */}
      <AnimatedBox 
        flex={1}
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <LayoutSection components={layout.components} />
      </AnimatedBox>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default HomeScreen;