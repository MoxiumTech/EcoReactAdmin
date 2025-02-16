import { createBox, createText } from '@shopify/restyle';
import { Theme } from '../theme';

// Basic themed components using restyle
export const Box = createBox<Theme>();
export const Text = createText<Theme>();

// Re-export commonly used React Native components
export { TouchableOpacity } from 'react-native';
export { Image } from 'react-native';

// Add themed props to Box component
Box.defaultProps = {
  backgroundColor: 'mainBackground',
};

// Add themed props to Text component
Text.defaultProps = {
  color: 'text',
};