import * as Updates from 'expo-updates';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const UPDATE_CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes
const LAST_UPDATE_CHECK_KEY = 'lastUpdateCheck';
const UPDATE_DISMISSED_KEY = 'updateDismissed';

class UpdateService {
  constructor() {
    this.isChecking = false;
    this.updateAvailable = false;
    this.updateInfo = null;
  }

  // Check if updates are enabled and app is running in production
  isUpdateAvailable() {
    return Updates.isEnabled && !__DEV__;
  }

  // Check for updates automatically
  async checkForUpdates(force = false) {
    if (!this.isUpdateAvailable() || this.isChecking) {
      return null;
    }

    try {
      this.isChecking = true;

      // Check if we should skip based on time interval (unless forced)
      if (!force) {
        const lastCheck = await AsyncStorage.getItem(LAST_UPDATE_CHECK_KEY);
        if (lastCheck) {
          const timeSinceLastCheck = Date.now() - parseInt(lastCheck);
          if (timeSinceLastCheck < UPDATE_CHECK_INTERVAL) {
            return null;
          }
        }
      }

      // Check for updates
      const update = await Updates.checkForUpdateAsync();
      
      // Store last check time
      await AsyncStorage.setItem(LAST_UPDATE_CHECK_KEY, Date.now().toString());

      if (update.isAvailable) {
        this.updateAvailable = true;
        this.updateInfo = update;
        return update;
      }

      return null;
    } catch (error) {
      console.error('Error checking for updates:', error);
      return null;
    } finally {
      this.isChecking = false;
    }
  }

  // Download and install update
  async downloadAndInstallUpdate(onProgress = null) {
    if (!this.updateAvailable || !this.updateInfo) {
      throw new Error('No update available');
    }

    try {
      const result = await Updates.fetchUpdateAsync();
      
      if (result.isNew) {
        // Clear the dismissed flag since we're installing
        await AsyncStorage.removeItem(UPDATE_DISMISSED_KEY);
        
        // Restart the app to apply the update
        await Updates.reloadAsync();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error downloading update:', error);
      throw error;
    }
  }

  // Show update dialog
  async showUpdateDialog(updateInfo, onUpdate, onDismiss) {
    const dismissed = await AsyncStorage.getItem(UPDATE_DISMISSED_KEY);
    
    // Don't show if user dismissed this version
    if (dismissed === updateInfo.manifest?.id) {
      return;
    }

    Alert.alert(
      'Доступне оновлення',
      'Доступна нова версія додатку з покращеннями та виправленнями помилок. Бажаєте оновити зараз?',
      [
        {
          text: 'Пізніше',
          style: 'cancel',
          onPress: async () => {
            // Mark this version as dismissed
            await AsyncStorage.setItem(UPDATE_DISMISSED_KEY, updateInfo.manifest?.id || 'unknown');
            onDismiss?.();
          }
        },
        {
          text: 'Оновити',
          onPress: onUpdate
        }
      ]
    );
  }

  // Force check and show dialog if update available
  async checkAndPromptForUpdate() {
    try {
      const update = await this.checkForUpdates(true);
      
      if (update) {
        await this.showUpdateDialog(
          update,
          async () => {
            try {
              Alert.alert(
                'Завантаження оновлення',
                'Оновлення завантажується. Додаток перезапуститься автоматично.',
                [{ text: 'OK' }]
              );
              
              await this.downloadAndInstallUpdate();
            } catch (error) {
              Alert.alert(
                'Помилка оновлення',
                'Не вдалося завантажити оновлення. Спробуйте пізніше.',
                [{ text: 'OK' }]
              );
            }
          },
          () => {
            console.log('Update dismissed by user');
          }
        );
      }
    } catch (error) {
      console.error('Error in checkAndPromptForUpdate:', error);
    }
  }

  // Start automatic update checking (disabled)
  startAutomaticChecking() {
    // Automatic checking is disabled
    // Users can manually check for updates in Settings
    console.log('📱 Automatic update checking is disabled. Use manual check in Settings.');
  }

  // Get current app version info
  async getVersionInfo() {
    try {
      const update = Updates.updateId ? { updateId: Updates.updateId } : null;
      return {
        currentVersion: Updates.manifest?.version || Updates.createdAt || 'Unknown',
        updateId: update?.updateId || Updates.updateId || 'Unknown',
        channel: Updates.channel || 'default',
        runtimeVersion: Updates.runtimeVersion || 'Unknown'
      };
    } catch (error) {
      console.error('Error getting version info:', error);
      return {
        currentVersion: 'Unknown',
        updateId: 'Unknown',
        channel: 'Unknown',
        runtimeVersion: 'Unknown'
      };
    }
  }

}

export default new UpdateService();
