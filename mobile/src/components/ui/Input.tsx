import React from 'react';
import { TextInput, TextInputProps, StyleSheet } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../../theme';

interface InputProps extends TextInputProps {
  error?: boolean;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  ({ error, style, ...props }, ref) => {
    const theme = useTheme<Theme>();

    const styles = StyleSheet.create({
      input: {
        height: 48,
        paddingHorizontal: theme.spacing.m,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: error ? theme.colors.error : theme.colors.border,
        borderRadius: theme.borderRadii.m,
        fontSize: 16,
        color: theme.colors.text,
      },
    });

    return (
      <TextInput
        ref={ref}
        style={[styles.input, style]}
        placeholderTextColor={theme.colors.textMuted}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';