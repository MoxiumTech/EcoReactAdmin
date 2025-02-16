import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert, Image } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Box, Text, TouchableOpacity } from '../components/themed';
import { Theme } from '../theme';
import { RootStackParamList, TabParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LoadingOverlay } from '../components/LoadingScreen';

type ProfileScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'ProfileTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
  const theme = useTheme<Theme>();
  const { user, loading: authLoading, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // No need to manually show success message as it's handled in auth context
            } catch (error) {
              // Error handling is done in auth context
            }
          }
        }
      ]
    );
  };

  if (!user) {
    return (
      <Box flex={1} backgroundColor="mainBackground" padding="m">
        <Box
          backgroundColor="cardBackground"
          borderRadius="m"
          padding="m"
          style={styles.profileHeader}
        >
          <Box
            width={80}
            height={80}
            borderRadius="l"
            backgroundColor="primary"
            alignItems="center"
            justifyContent="center"
          >
            <Ionicons name="person" size={40} color={theme.colors.white} />
          </Box>
          <Text variant="header" marginTop="m">
            Welcome
          </Text>
          <Text variant="body" color="textMuted" marginTop="s" textAlign="center">
            Sign in to view your profile, orders, and more
          </Text>
          
          <Box marginTop="l" width="100%">
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
            >
              <Box
                backgroundColor="primary"
                padding="m"
                borderRadius="m"
                alignItems="center"
                marginBottom="m"
              >
                <Text variant="body" color="white">Sign In</Text>
              </Box>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
            >
              <Box
                backgroundColor="cardBackground"
                padding="m"
                borderRadius="m"
                alignItems="center"
                borderWidth={1}
                borderColor="border"
              >
                <Text variant="body" color="text">Create Account</Text>
              </Box>
            </TouchableOpacity>
          </Box>
        </Box>
      </Box>
    );
  }

  const menuItems = [
    {
      icon: 'person-outline',
      title: 'Personal Information',
      onPress: () => {
        Alert.alert('Coming Soon', 'This feature is under development');
      }
    },
    {
      icon: 'list-outline',
      title: 'Orders',
      onPress: () => navigation.navigate('Main', { screen: 'OrdersTab' })
    },
    {
      icon: 'heart-outline',
      title: 'Wishlist',
      onPress: () => {
        Alert.alert('Coming Soon', 'This feature is under development');
      }
    },
    {
      icon: 'settings-outline',
      title: 'Settings',
      onPress: () => {
        Alert.alert('Coming Soon', 'This feature is under development');
      }
    },
    {
      icon: 'log-out-outline',
      title: 'Logout',
      onPress: handleLogout
    }
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.mainBackground }}>
      {authLoading && <LoadingOverlay message="Please wait..." />}
      <Box padding="m">
        <Box
          backgroundColor="cardBackground"
          borderRadius="m"
          padding="m"
          style={styles.profileHeader}
        >
          <Box
            width={80}
            height={80}
            borderRadius="l"
            backgroundColor="primary"
            alignItems="center"
            justifyContent="center"
          >
            {user.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={{ width: 80, height: 80, borderRadius: theme.borderRadii.l }}
              />
            ) : (
              <Ionicons name="person" size={40} color={theme.colors.white} />
            )}
          </Box>
          <Text variant="header" marginTop="m">
            {user.name}
          </Text>
          <Text variant="body" color="textMuted" marginTop="s">
            {user.email}
          </Text>
        </Box>

        <Box marginTop="l">
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.title}
              onPress={item.onPress}
            >
              <Box
                flexDirection="row"
                alignItems="center"
                backgroundColor="cardBackground"
                padding="m"
                borderRadius="m"
                marginBottom="s"
                style={styles.menuItem}
              >
                <Box
                  backgroundColor={item.title === 'Logout' ? 'error' : 'primary'}
                  padding="s"
                  borderRadius="m"
                  opacity={0.1}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={24}
                    color={theme.colors[item.title === 'Logout' ? 'error' : 'primary']}
                  />
                </Box>
                <Text
                  variant="body"
                  marginLeft="m"
                  color={item.title === 'Logout' ? 'error' : 'text'}
                >
                  {item.title}
                </Text>
                <Ionicons 
                  name="chevron-forward" 
                  size={24} 
                  color={theme.colors.textMuted} 
                  style={styles.chevron}
                />
              </Box>
            </TouchableOpacity>
          ))}
        </Box>
      </Box>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  menuItem: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  chevron: {
    marginLeft: 'auto',
  }
});

export default ProfileScreen;