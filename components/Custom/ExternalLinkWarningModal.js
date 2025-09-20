import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const ExternalLinkWarningModal = ({ 
  visible, 
  onClose, 
  url, 
  linkText = '',
  onConfirm,
  showRememberChoice = false
}) => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    modalContainer: {
      backgroundColor: theme.colors.card,
      borderRadius: 32,
      padding: 24,
      width: '100%',
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    messageContainer: {
      marginBottom: 20,
    },
    message: {
      fontSize: 16,
      color: theme.colors.text,
      lineHeight: 24,
      textAlign: 'center',
      marginBottom: 12,
    },
    urlContainer: {
      backgroundColor: theme.colors.inputBackground,
      padding: 12,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    urlText: {
      fontSize: 14,
      color: theme.colors.primary,
      fontFamily: 'monospace',
      textAlign: 'center',
    },
    linkTextContainer: {
      marginBottom: 8,
    },
    linkTextLabel: {
      fontSize: 14,
      color: theme.colors.gray,
      textAlign: 'center',
      marginBottom: 4,
    },
    linkText: {
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: '500',
      textAlign: 'center',
    },
    warningText: {
      fontSize: 14,
      color: theme.colors.gray,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 999,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: theme.colors.inputBackground,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    confirmButton: {
      backgroundColor: `${theme.colors.primary}20`,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}40`,
    },
    disabledButton: {
      backgroundColor: theme.colors.gray,
      opacity: 0.6,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: theme.colors.text,
    },
    confirmButtonText: {
      color: theme.colors.primary,
    },
    icon: {
      fontSize: 24,
      textAlign: 'center',
      marginBottom: 12,
    },
  });

  const handleConfirm = async () => {
    setIsLoading(true);
    
    try {
      if (onConfirm) {
        await onConfirm();
      } else {
        // Якщо немає onConfirm, спробуємо відкрити безпосередньо
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          Alert.alert('Помилка', 'Не вдалося відкрити посилання');
        }
      }
    } catch (error) {
      Alert.alert('Помилка', `Не вдалося відкрити посилання: ${error.message}`);
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.icon}>🔗</Text>
          
          <Text style={styles.title}>Відкрити посилання?</Text>
          
          <View style={styles.messageContainer}>
            {linkText && (
              <View style={styles.linkTextContainer}>
                <Text style={styles.linkTextLabel}>Текст посилання:</Text>
                <Text style={styles.linkText} numberOfLines={2}>
                  {linkText}
                </Text>
              </View>
            )}
            
            <View style={styles.urlContainer}>
              <Text style={styles.urlText} numberOfLines={3}>
                {url}
              </Text>
            </View>
            
            <Text style={styles.message}>
              Це посилання буде відкрито у вашому браузері за замовчуванням.
            </Text>
            
            <Text style={styles.warningText}>
              Переконайтеся, що ви довіряєте цьому посиланню перед відкриттям.
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                Скасувати
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.confirmButton, isLoading && styles.disabledButton]}
              onPress={handleConfirm}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <Text style={[styles.buttonText, styles.confirmButtonText]}>
                {isLoading ? 'Відкриваю...' : 'Відкрити'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ExternalLinkWarningModal;