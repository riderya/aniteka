import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const UpdateModal = ({ 
  visible, 
  onUpdate, 
  onDismiss, 
  isDownloading = false,
  updateInfo = null 
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modal: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 24,
      width: width - 40,
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    icon: {
      marginRight: 12,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      flex: 1,
    },
    description: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      lineHeight: 24,
      marginBottom: 24,
    },
    versionInfo: {
      backgroundColor: theme.colors.background,
      padding: 12,
      borderRadius: 8,
      marginBottom: 24,
    },
    versionText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 4,
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
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
    },
    secondaryButton: {
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    primaryButtonText: {
      color: '#FFFFFF',
    },
    secondaryButtonText: {
      color: theme.colors.text,
    },
    downloadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    downloadingText: {
      marginLeft: 8,
      fontSize: 16,
      color: '#FFFFFF',
    },
  });

  if (isDownloading) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.header}>
              <Ionicons 
                name="download" 
                size={24} 
                color={theme.colors.primary} 
                style={styles.icon}
              />
              <Text style={styles.title}>Завантаження оновлення</Text>
            </View>
            
            <Text style={styles.description}>
              Оновлення завантажується. Додаток перезапуститься автоматично після завершення.
            </Text>

            <View style={[styles.button, styles.primaryButton]}>
              <View style={styles.downloadingContainer}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.downloadingText}>Завантаження...</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Ionicons 
              name="refresh-circle" 
              size={24} 
              color={theme.colors.primary} 
              style={styles.icon}
            />
            <Text style={styles.title}>Доступне оновлення</Text>
          </View>
          
          <Text style={styles.description}>
            Доступна нова версія додатку з покращеннями та виправленнями помилок. 
            Оновлення відбудеться автоматично без втрати ваших даних.
          </Text>

          {updateInfo && (
            <View style={styles.versionInfo}>
              <Text style={styles.versionText}>
                Нова версія: {updateInfo.manifest?.version || 'Невідомо'}
              </Text>
              <Text style={styles.versionText}>
                Розмір: {updateInfo.manifest?.bundleSize ? 
                  `${(updateInfo.manifest.bundleSize / 1024 / 1024).toFixed(1)} MB` : 
                  'Невідомо'}
              </Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]}
              onPress={onDismiss}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                Пізніше
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]}
              onPress={onUpdate}
            >
              <Text style={[styles.buttonText, styles.primaryButtonText]}>
                Оновити зараз
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default UpdateModal;
