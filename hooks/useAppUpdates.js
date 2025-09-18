import { useState, useEffect, useCallback } from 'react';
import UpdateService from '../services/UpdateService';

export const useAppUpdates = () => {
  const [isCheckingForUpdate, setIsCheckingForUpdate] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [versionInfo, setVersionInfo] = useState(null);

  // Check for updates manually
  const checkForUpdates = useCallback(async () => {
    setIsCheckingForUpdate(true);
    try {
      const update = await UpdateService.checkForUpdates(true);
      setUpdateAvailable(!!update);
      return update;
    } catch (error) {
      console.error('Error checking for updates:', error);
      return null;
    } finally {
      setIsCheckingForUpdate(false);
    }
  }, []);

  // Download and install update
  const downloadAndInstall = useCallback(async () => {
    setIsDownloading(true);
    try {
      await UpdateService.downloadAndInstallUpdate();
      return true;
    } catch (error) {
      console.error('Error downloading update:', error);
      return false;
    } finally {
      setIsDownloading(false);
    }
  }, []);

  // Get version information
  const getVersionInfo = useCallback(async () => {
    try {
      const info = await UpdateService.getVersionInfo();
      setVersionInfo(info);
      return info;
    } catch (error) {
      console.error('Error getting version info:', error);
      return null;
    }
  }, []);

  // Reset update state
  const resetUpdateState = useCallback(async () => {
    await UpdateService.resetUpdateState();
    setUpdateAvailable(false);
    setIsCheckingForUpdate(false);
    setIsDownloading(false);
  }, []);

  // Load version info on mount
  useEffect(() => {
    getVersionInfo();
  }, [getVersionInfo]);

  return {
    isCheckingForUpdate,
    updateAvailable,
    isDownloading,
    versionInfo,
    checkForUpdates,
    downloadAndInstall,
    getVersionInfo,
    resetUpdateState
  };
};
