import React, { useEffect, useRef, createContext, useContext, useState } from 'react';
import { Animated, StyleSheet, Dimensions, Platform } from 'react-native';
import { Box, Text } from './themed';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (props: ToastProps) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const Toast: React.FC<ToastProps & { onHide?: () => void }> = ({
  message,
  type = 'info',
  duration = 3000,
  onHide,
}) => {
  const theme = useTheme<Theme>();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const getToastColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle-outline';
      case 'error':
        return 'alert-circle-outline';
      default:
        return 'information-circle-outline';
    }
  };

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(duration),
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onHide?.();
    });
  }, [duration, onHide]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Box
        flexDirection="row"
        alignItems="center"
        padding="m"
        backgroundColor="mainBackground"
        borderRadius="m"
        style={[
          styles.toast,
          { borderLeftColor: getToastColor(), borderLeftWidth: 4 },
        ]}
      >
        <Ionicons name={getIcon()} size={24} color={getToastColor()} />
        <Text variant="body" marginLeft="s" style={{ flex: 1 }}>
          {message}
        </Text>
      </Box>
    </Animated.View>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toast, setToast] = useState<ToastProps | null>(null);

  const showToast = (props: ToastProps) => {
    setToast(props);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          {...toast}
          onHide={() => setToast(null)}
        />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  toast: {
    width: width - 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});