import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { Box, Text } from './themed';
import { Theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';

interface LoadingScreenProps {
  message?: string;
  error?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
  error = false,
  errorMessage = 'Something went wrong',
  onRetry
}) => {
  const theme = useTheme<Theme>();

  if (error) {
    return (
      <Box 
        flex={1} 
        justifyContent="center" 
        alignItems="center" 
        backgroundColor="mainBackground"
        padding="m"
      >
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={theme.colors.error}
        />
        <Text 
          variant="body" 
          color="error" 
          marginTop="m" 
          textAlign="center"
        >
          {errorMessage}
        </Text>
        {onRetry && (
          <Box
            marginTop="l"
            backgroundColor="primary"
            paddingHorizontal="m"
            paddingVertical="s"
            borderRadius="m"
          >
            <Text variant="body" color="white" onPress={onRetry}>
              Try Again
            </Text>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box 
      flex={1} 
      justifyContent="center" 
      alignItems="center"
      backgroundColor="mainBackground"
    >
      <Box style={styles.loadingContainer}>
        <ActivityIndicator 
          size="large" 
          color={theme.colors.primary} 
        />
        <Text
          variant="body"
          color="textMuted"
          marginTop="m"
          textAlign="center"
        >
          {message}
        </Text>
      </Box>
    </Box>
  );
};

export const LoadingOverlay: React.FC<{ message?: string }> = ({ message }) => {
  const theme = useTheme<Theme>();

  return (
    <Box 
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      backgroundColor="mainBackground"
      opacity={0.9}
      justifyContent="center"
      alignItems="center"
      zIndex={1000}
    >
      <Box style={styles.overlayContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        {message && (
          <Text
            variant="body"
            color="textMuted"
            marginTop="m"
            textAlign="center"
          >
            {message}
          </Text>
        )}
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  overlayContainer: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});