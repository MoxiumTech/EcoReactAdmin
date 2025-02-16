import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { Box } from './themed';
import { Theme } from '../theme';
import { RootStackParamList } from '../types/navigation';
import { HeaderCartButton } from './HeaderCartButton';
import { useStore } from '../contexts/StoreContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HeaderSearchBar = () => {
  const theme = useTheme<Theme>();
  const navigation = useNavigation<NavigationProp>();
  const { store } = useStore();
  const [isExpanded, setIsExpanded] = useState(false);

  // Animation value for search bar expansion
  const expandAnim = React.useRef(new Animated.Value(0)).current;

  const handleExpand = () => {
    setIsExpanded(true);
    Animated.spring(expandAnim, {
      toValue: 1,
      useNativeDriver: false,
    }).start();
  };

  const handleCollapse = () => {
    Animated.spring(expandAnim, {
      toValue: 0,
      useNativeDriver: false,
    }).start(() => setIsExpanded(false));
  };

  const searchWidth = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['15%', '85%'],
  });

  return (
    <Box
      paddingHorizontal="m"
      paddingVertical="s"
      backgroundColor="mainBackground"
      borderBottomWidth={1}
      borderBottomColor="border"
    >
      <Box flexDirection="row" alignItems="center" justifyContent="space-between">
        {store?.logoUrl && !isExpanded ? (
          <Box height={32} width={100}>
            <Animated.Image
              source={{ uri: store.logoUrl }}
              style={[
                styles.logo,
                {
                  opacity: expandAnim.interpolate({
                    inputRange: [0, 0.5],
                    outputRange: [1, 0],
                  }),
                },
              ]}
              resizeMode="contain"
            />
          </Box>
        ) : (
          <Box width={100} />
        )}

        <Animated.View
          style={[
            styles.searchContainer,
            {
              width: searchWidth,
            },
          ]}
        >
          {isExpanded ? (
            <Box 
              flex={1} 
              flexDirection="row" 
              alignItems="center"
              backgroundColor="cardBackground"
              borderRadius="m"
              padding="s"
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
                autoFocus
                onBlur={handleCollapse}
                onSubmitEditing={({ nativeEvent: { text }}) => {
                  handleCollapse();
                  navigation.navigate('Search', { initialQuery: text });
                }}
              />
            </Box>
          ) : (
            <TouchableOpacity onPress={handleExpand} style={styles.searchButton}>
              <Ionicons
                name="search-outline"
                size={24}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          )}
        </Animated.View>

        <HeaderCartButton />
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  logo: {
    width: '100%',
    height: '100%',
  },
  searchContainer: {
    height: 40,
    justifyContent: 'center',
  },
  searchButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    padding: 0,
  },
});