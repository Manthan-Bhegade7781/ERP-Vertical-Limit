import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type AuthInputProps = {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
};

const AuthInput: React.FC<AuthInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  icon = 'person-outline',
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = secureTextEntry;

  return (
    <View style={styles.container}>
      {/* Label */}
      {label && (
        <Text style={styles.label}>
          {label}
        </Text>
      )}

      {/* Input Container */}
      <View
        style={[
          styles.inputContainer,
          error && styles.inputContainerError,
        ]}
      >
        {/* Left Icon */}
        <Ionicons
          name={icon}
          size={21}
          color="#A5A9B8"
          style={styles.leftIcon}
        />

        {/* Text Input */}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#A5A9B8"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={
            isPassword && !showPassword
          }
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          selectionColor="#5A2EC4"
        />

        {/* Password Show / Hide */}
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() =>
              setShowPassword(
                (previous) => !previous
              )
            }
            activeOpacity={0.7}
          >
            <Ionicons
              name={
                showPassword
                  ? 'eye-outline'
                  : 'eye-off-outline'
              }
              size={22}
              color="#9DA2B1"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 18,
  },

  /* Label */
  label: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
    color: '#171724',
    marginBottom: 9,
  },

  /* Input Box */
  inputContainer: {
    width: '100%',
    height: 55,

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#DCDCE5',

    borderRadius: 12,

    paddingHorizontal: 16,
  },

  /* Error Border */
  inputContainerError: {
    borderColor: '#D93025',
  },

  /* Left Icon */
  leftIcon: {
    marginRight: 13,
  },

  /* Text Input */
  input: {
    flex: 1,
    height: '100%',

    fontFamily: 'PoppinsRegular',
    fontSize: 14,

    color: '#252538',

    paddingVertical: 0,
  },

  /* Password Eye Button */
  eyeButton: {
    width: 40,
    height: 55,

    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Error Text */
  errorText: {
    marginTop: 6,
    marginLeft: 4,

    fontFamily: 'PoppinsRegular',
    fontSize: 12,

    color: '#D93025',
  },
});

export default AuthInput;