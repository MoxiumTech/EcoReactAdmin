import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from './themed';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HeaderProfileButton = () => {
  const navigation = useNavigation<NavigationProp>();
  const theme = useTheme<Theme>();

  return (
    <TouchableOpacity 
      onPress={() => navigation.navigate('Profile')}
      style={{ marginLeft: 15 }}
    >
      <Text style={{ fontSize: 24 }}>👤</Text>
    </TouchableOpacity>
  );
};