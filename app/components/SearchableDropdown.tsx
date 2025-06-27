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
  value?: string;
  [key: string]: any;
};

interface SearchableDropdownProps {
  label: string;
  items: Array<{
    id: string;
    label: string;
    value?: string;
    [key: string]: any;
  }>;
  value: string;
  onChange: (value: string) => void;
  searchFields: string[];
  placeholder: string;
  required?: boolean;
  disabled?: boolean;
}

export default function SearchableDropdown({
  label,
  items = [],
  value,
  onChange,
  searchFields,
  placeholder,
  required = false,
  disabled = false
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedItem = items.find(item => item.id === value);

  const filteredItems = items.filter(item => {
    if (!searchQuery) return true;
    return searchFields.some(field => {
      const fieldValue = item[field];
      return fieldValue?.toString().toLowerCase().includes(searchQuery.toLowerCase());
    });
  });

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.required}>*</Text>}
      </View>
      <TouchableOpacity
        style={[
          styles.dropdown,
          isOpen && styles.dropdownOpen,
          disabled && styles.dropdownDisabled
        ]}
        onPress={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <Text style={[
          styles.selectedText,
          !value && styles.placeholder,
          disabled && styles.textDisabled
        ]}>
          {selectedItem?.label || placeholder}
        </Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={disabled ? '#ccc' : '#666'}
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsOpen(false)}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
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
                  <View style={styles.dropdownItemContent}>
                    <Text style={[
                      styles.dropdownItemText,
                      value === item.id && styles.selectedItemText
                    ]}>
                      {item.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
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
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    fontSize: 16,
  },
  scrollView: {
    maxHeight: 200,
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
  dropdownDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
  },
  textDisabled: {
    color: '#999',
  },
  dropdownItemContent: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    minWidth: 260,
    maxWidth: 340,
    maxHeight: 320,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
}); 