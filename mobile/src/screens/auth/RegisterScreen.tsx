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

type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
  const theme = useTheme<Theme>();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      navigation.replace('Main', { screen: 'HomeTab' });
    } catch (error) {
      // Error is handled in the auth context
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box flex={1} backgroundColor="mainBackground">
      {loading && <LoadingOverlay message="Creating account..." />}
      <Box padding="m" justifyContent="center" flex={1}>
        <Box
          backgroundColor="cardBackground"
          padding="l"
          borderRadius="m"
          style={styles.registerCard}
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
              <Ionicons name="person-add" size={30} color={theme.colors.white} />
            </Box>
            <Text variant="header">Create Account</Text>
            <Text variant="body" color="textMuted" marginTop="s">
              Sign up to get started
            </Text>
          </Box>

          <Box marginBottom="m">
            <Text variant="body" color="textMuted" marginBottom="xs">
              Name
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
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
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
              placeholder="Choose a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </Box>

          <TouchableOpacity onPress={handleRegister}>
            <Box
              backgroundColor="primary"
              padding="m"
              borderRadius="m"
              alignItems="center"
            >
              <Text variant="body" color="white">Create Account</Text>
            </Box>
          </TouchableOpacity>

          <Box flexDirection="row" justifyContent="center" marginTop="m">
            <Text variant="body" color="textMuted">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text variant="body" color="primary">Sign In</Text>
            </TouchableOpacity>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  registerCard: {
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

export default RegisterScreen;