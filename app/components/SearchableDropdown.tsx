import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type DropdownItem = {
  id: string;
  label: string;
  [key: string]: any;
};

interface SearchableDropdownProps {
  label: string;
  items: Array<{
    id: string;
    label: string;
    [key: string]: any;
  }>;
  value: string;
  onChange: (value: string) => void;
  searchFields: string[];
  placeholder: string;
  required?: boolean;
}

export default function SearchableDropdown({
  label,
  items,
  value,
  onChange,
  searchFields,
  placeholder,
  required = false
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter(item => {
    if (!searchQuery) return true;
    return searchFields.some(field => {
      const fieldValue = item[field];
      return fieldValue?.toString().toLowerCase().includes(searchQuery.toLowerCase());
    });
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TouchableOpacity
        style={[styles.dropdown, isOpen && styles.dropdownOpen]}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={[styles.selectedText, !value && styles.placeholder]}>
          {value ? items.find(item => item.id === value)?.label : placeholder}
        </Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#666"
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownList}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <ScrollView style={styles.scrollView}>
            {filteredItems.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.dropdownItem,
                  value === item.id && styles.selectedItem
                ]}
                onPress={() => {
                  onChange(item.id);
                  setIsOpen(false);
                  setSearchQuery('');
                }}
              >
                <Text style={[
                  styles.dropdownItemText,
                  value === item.id && styles.selectedItemText
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: 'red',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownOpen: {
    borderColor: '#007bff',
  },
  selectedText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholder: {
    color: '#999',
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  searchInput: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    fontSize: 16,
  },
  scrollView: {
    maxHeight: '80%',
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedItem: {
    backgroundColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedItemText: {
    fontWeight: 'bold',
  },
}); 