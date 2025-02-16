import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Box, Text, TouchableOpacity } from '../../components/themed';
import { Theme } from '../../theme';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingOverlay } from '../../components/LoadingScreen';
import { TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const theme = useTheme<Theme>();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigation.replace('Main', { screen: 'HomeTab' });
    } catch (error) {
      // Error is handled in the auth context
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box flex={1} backgroundColor="mainBackground">
      {loading && <LoadingOverlay message="Signing in..." />}
      <Box padding="m" justifyContent="center" flex={1}>
        <Box
          backgroundColor="cardBackground"
          padding="l"
          borderRadius="m"
          style={styles.loginCard}
        >
          <Box alignItems="center" marginBottom="l">
            <Box
              width={60}
              height={60}
              borderRadius="l"
              backgroundColor="primary"
              alignItems="center"
              justifyContent="center"
              marginBottom="m"
            >
              <Ionicons name="person" size={30} color={theme.colors.white} />
            </Box>
            <Text variant="header">Welcome Back</Text>
            <Text variant="body" color="textMuted" marginTop="s">
              Sign in to your account
            </Text>
          </Box>

          <Box marginBottom="m">
            <Text variant="body" color="textMuted" marginBottom="xs">
              Email
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.colors.mainBackground,
                  borderColor: theme.colors.border,
                  color: theme.colors.text
                }
              ]}
              placeholderTextColor={theme.colors.textMuted}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </Box>

          <Box marginBottom="l">
            <Text variant="body" color="textMuted" marginBottom="xs">
              Password
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.colors.mainBackground,
                  borderColor: theme.colors.border,
                  color: theme.colors.text
                }
              ]}
              placeholderTextColor={theme.colors.textMuted}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </Box>

          <TouchableOpacity onPress={handleLogin}>
            <Box
              backgroundColor="primary"
              padding="m"
              borderRadius="m"
              alignItems="center"
            >
              <Text variant="body" color="white">Sign In</Text>
            </Box>
          </TouchableOpacity>

          <Box flexDirection="row" justifyContent="center" marginTop="m">
            <Text variant="body" color="textMuted">Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text variant="body" color="primary">Sign Up</Text>
            </TouchableOpacity>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  loginCard: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
});

export default LoginScreen;