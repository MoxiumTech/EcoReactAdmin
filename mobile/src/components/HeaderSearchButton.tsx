import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from './themed';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HeaderSearchButton = () => {
  const navigation = useNavigation<NavigationProp>();
  const theme = useTheme<Theme>();

  return (
    <TouchableOpacity 
      onPress={() => navigation.navigate('Search')}
      style={{ marginRight: 15 }}
    >
      <Text style={{ fontSize: 20 }}>🔍</Text>
    </TouchableOpacity>
  );
};