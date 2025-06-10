import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * Defines the props interface for the CustomAlert component.
 */
interface CustomAlertProps {
  visible: boolean;
  message: string;
  onClose: () => void;
  title?: string; // Optional title prop
}

/**
 * A custom alert modal component for displaying messages to the user.
 * This replaces the native Alert.alert to provide a consistent UI and better control.
 *
 * @param {CustomAlertProps} props - The component props.
 * @param {boolean} props.visible - Controls the visibility of the modal.
 * @param {string} props.message - The message to be displayed in the alert.
 * @param {function} props.onClose - Function to call when the alert is closed.
 * @param {string} [props.title="Alert"] - The title of the alert modal.
 */
const CustomAlert = ({ visible, message, onClose, title = "Alert" }: CustomAlertProps) => {
  return (
    <Modal
      transparent={true}
      animationType="fade" // Smooth fade in/out animation for the modal
      visible={visible}
      onRequestClose={onClose} // Handles closing the modal via hardware back button on Android
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.alertContainer}>
          <Text style={modalStyles.alertTitle}>{title}</Text>
          <Text style={modalStyles.alertMessage}>{message}</Text>
          <TouchableOpacity onPress={onClose} style={modalStyles.alertButton}>
            <Text style={modalStyles.alertButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Styles for the CustomAlert component
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
  },
  alertContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // Shadow for Android
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  alertMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  alertButton: {
    backgroundColor: '#007AFF', // iOS blue
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  alertButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomAlert;
