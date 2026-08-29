import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type UserRole = 'Admin' | 'Teacher' | 'Student';

type RoleSelectorProps = {
  value: UserRole;
  onChange: (role: UserRole) => void;
};

const roles: Array<{ label: UserRole; icon: keyof typeof MaterialCommunityIcons.glyphMap }> = [
  { label: 'Admin', icon: 'account' },
  { label: 'Teacher', icon: 'human-male-board' },
  { label: 'Student', icon: 'book-open-page-variant' },
];

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Login As</Text>
      <View style={styles.rolesRow}>
        {roles.map((role, index) => {
          const selected = role.label === value;
          return (
            <React.Fragment key={role.label}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.role, selected && styles.roleSelected]}
                onPress={() => onChange(role.label)}>
                <MaterialCommunityIcons
                  name={role.icon}
                  size={28}
                  color={selected ? '#5A2EC4' : '#4F535C'}
                />
                <Text style={[styles.roleText, selected && styles.roleTextSelected]}>
                  {role.label}
                </Text>
              </TouchableOpacity>
              {index < roles.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 108,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEF2',
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#2D2050',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  label: {
    width: 76,
    fontSize: 15,
    fontWeight: '700',
    color: '#33343A',
  },
  rolesRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  role: {
    flex: 1,
    minHeight: 84,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
  },
  roleSelected: {
    borderWidth: 1.5,
    borderColor: '#8465CC',
    backgroundColor: '#F5F0FF',
  },
  divider: {
    width: 1,
    marginVertical: 13,
    backgroundColor: '#ECECF0',
  },
  roleText: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#4B4C52',
  },
  roleTextSelected: {
    color: '#5A2EC4',
  },
});
