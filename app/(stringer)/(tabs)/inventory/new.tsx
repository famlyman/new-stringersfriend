import { Stack, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../../src/contexts/AuthContext';
import { supabase } from '../../../../src/lib/supabase';
import SearchableDropdown from '../../../components/SearchableDropdown';
import { Card } from '../../../../src/components/ui/Card';
import { Text as UI_KIT_Text } from '../../../../src/components/ui/Text';
import { Button } from '../../../../src/components/ui/Button';
import { UI_KIT } from '../../../../src/styles/uiKit';
import { SafeAreaView } from 'react-native-safe-area-context';

// ...rest of the code from app/(stringer)/inventory/new.tsx, unchanged except for import paths... 