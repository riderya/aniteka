import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { Modal, TouchableWithoutFeedback, ScrollView, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { useWatchStatus } from '../../context/WatchStatusContext';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import ModernAlert from '../Custom/ModernAlert';

const DetailedEpisodesModal = ({ 
  isVisible, 
  onClose, 
  slug, 
  episodes_total,
  currentEpisodes,
  currentStatus,
  animeTitle,
  onUpdate 
}) => {
    const { authToken, fetchAnimeStatus, updateAnimeScore, removeAnimeFromList } = useWatchStatus();
  const { theme } = useTheme();
  
  // Стан форми
  const [formData, setFormData] = useState({
    status: 'watching',
    score: 0,
    episodes: 0,
    rewatches: 0,
    note: ''
  });
  
  const [loading, setLoading] = useState(false);

  // Стан для ModernAlert
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: []
  });

  // Функція для показу кастомного alert'у
  const showAlert = (title, message, buttons = [{ text: 'OK', onPress: () => {} }]) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  // Мепінг статусів
  const statusMapping = {
    'Дивлюсь': 'watching',
    'В планах': 'planned',
    'Переглянуто': 'completed',
    'Відкладено': 'on_hold',
    'Закинуто': 'dropped',
    'Не дивлюсь': null,
  };

  const reverseStatusMapping = {
    'watching': 'Дивлюсь',
    'planned': 'В планах',
    'completed': 'Переглянуто',
    'on_hold': 'Відкладено',
    'dropped': 'Закинуто',
  };

  // Ініціалізація даних при відкритті модалки
  useEffect(() => {
    if (isVisible && slug) {
      loadCurrentData();
    }
  }, [isVisible, slug, currentStatus, currentEpisodes]);

  const loadCurrentData = async () => {
    try {
      const res = await fetch(`https://api.hikka.io/watch/${slug}`, {
        headers: { auth: authToken },
      });

      if (res.ok) {
        const data = await res.json();
        setFormData({
          status: data.status || statusMapping[currentStatus] || 'watching',
          score: data.score || 0,
          episodes: data.episodes || currentEpisodes || 0,
          rewatches: data.rewatches || 0,
          note: data.note || ''
        });
      } else {
        // Якщо немає даних, використовуємо дефолтні значення
        setFormData({
          status: statusMapping[currentStatus] || 'watching',
          score: 0,
          episodes: currentEpisodes || 0,
          rewatches: 0,
          note: ''
        });
      }
    } catch (error) {
      console.error('Error loading watch data:', error);
      setFormData({
        status: statusMapping[currentStatus] || 'watching',
        score: 0,
        episodes: currentEpisodes || 0,
        rewatches: 0,
        note: ''
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.hikka.io/watch/${slug}`, {
        method: 'PUT',
        headers: { 
          auth: authToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          episodes: parseInt(formData.episodes) || 0,
          rewatches: parseInt(formData.rewatches) || 0,
          score: parseInt(formData.score) || 0,
          status: formData.status,
          note: formData.note || null,
        }),
      });

      if (res.ok) {
        // Оновлюємо кеш статусу
        await fetchAnimeStatus(slug);
        // Оновлюємо глобальну оцінку в контексті
        updateAnimeScore(slug, parseInt(formData.score) || 0);
        // Викликаємо callback для оновлення батьківського компонента
        if (onUpdate) {
          onUpdate(parseInt(formData.episodes) || 0);
        }
        onClose();
      } else {
        showAlert('Помилка', 'Не вдалося зберегти зміни');
      }
    } catch (error) {
      console.error('Error saving watch data:', error);
      showAlert('Помилка', 'Сталася помилка при збереженні');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const resetProgress = async () => {
      setLoading(true);
      try {
        // Оновлюємо аніме, скидаючи епізоди та оцінку до 0
        const res = await fetch(`https://api.hikka.io/watch/${slug}`, {
          method: 'PUT',
          headers: { 
            auth: authToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            episodes: 0,
            rewatches: 0,
            score: 0,
            status: statusMapping[currentStatus],
            note: '',
          }),
        });

        if (res.ok) {
          await fetchAnimeStatus(slug);
          // Оновлюємо оцінку в контексті
          updateAnimeScore(slug, 0);
          // Оновлюємо локальні дані
          setFormData(prev => ({ 
            ...prev, 
            episodes: 0, 
            score: 0, 
            rewatches: 0, 
            note: '' 
          }));
          if (onUpdate) {
            onUpdate(0);
          }
          onClose();
        } else {
          showAlert('Помилка', 'Не вдалося скинути прогрес перегляду');
        }
      } catch (error) {
        console.error('Error resetting watch progress:', error);
        showAlert('Помилка', 'Сталася помилка при скиданні прогресу');
      } finally {
        setLoading(false);
      }
    };

    showAlert(
      'Підтвердження',
      'Ви впевнені, що хочете скинути весь прогрес (епізоди, оцінку, нотатки)?',
      [
        { text: 'Скасувати', style: 'cancel', onPress: () => {} },
        { text: 'Скинути', style: 'destructive', onPress: resetProgress }
      ]
    );
  };

  const updateFormField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <Overlay>
            <TouchableWithoutFeedback onPress={() => {}}>
              <ModalContainer>
                <ModalHeader>
                  <ModalTitle numberOfLines={1}>{animeTitle || 'Аніме'}</ModalTitle>
                  <CloseButton onPress={onClose}>
                    <Ionicons name="close" size={24} color="#666666" />
                  </CloseButton>
                </ModalHeader>

                <ScrollView 
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ flexGrow: 1 }}
                >
                  {/* Оцінка та Епізоди в одному ряду */}
                  <TwoColumnContainer>
                    <FieldContainerHalf>
                      <FieldLabel>Оцінка</FieldLabel>
                      <ScoreInput
                        value={formData.score > 0 ? String(formData.score) : ''}
                        onChangeText={(text) => {
                          const value = parseInt(text) || 0;
                          updateFormField('score', Math.max(0, Math.min(10, value)));
                        }}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#888888"
                      />
                    </FieldContainerHalf>

                    <FieldContainerHalf>
                      <FieldLabel>Епізоди</FieldLabel>
                      <EpisodesInput
                        value={formData.episodes > 0 ? String(formData.episodes) : ''}
                        onChangeText={(text) => {
                          const value = parseInt(text) || 0;
                          const maxValue = episodes_total || 999;
                          updateFormField('episodes', Math.max(0, Math.min(maxValue, value)));
                        }}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#888888"
                      />
                    </FieldContainerHalf>
                  </TwoColumnContainer>

                  {/* Повторні перегляди */}
                  <FieldContainer>
                    <FieldLabel>Повторні перегляди</FieldLabel>
                    <RewatchesInput
                      value={formData.rewatches > 0 ? String(formData.rewatches) : ''}
                      onChangeText={(text) => {
                        const value = parseInt(text) || 0;
                        updateFormField('rewatches', Math.max(0, value));
                      }}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#888888"
                    />
                  </FieldContainer>

                  {/* Нотатки */}
                  <FieldContainer>
                    <FieldLabel>Нотатки</FieldLabel>
                    <NotesInput
                      value={formData.note}
                      onChangeText={(text) => updateFormField('note', text)}
                      placeholder="Залишите нотатку"
                      placeholderTextColor="#888888"
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </FieldContainer>
                </ScrollView>

                {/* Кнопки */}
                <ButtonsContainer>
                  <DeleteButton onPress={handleDelete} disabled={loading}>
                    <DeleteButtonContent>
                      <DeleteButtonText>Скинути</DeleteButtonText>
                    </DeleteButtonContent>
                  </DeleteButton>
                  <SaveButton onPress={handleSave} disabled={loading}>
                    <SaveButtonContent>
                      <SaveButtonText>
                        {loading ? 'Збереження...' : 'Зберегти'}
                      </SaveButtonText>
                    </SaveButtonContent>
                  </SaveButton>
                </ButtonsContainer>
              </ModalContainer>
            </TouchableWithoutFeedback>
          </Overlay>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <ModernAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={hideAlert}
        theme={theme}
      />
    </Modal>
  );
};

export default DetailedEpisodesModal;

// Стилі
const Overlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.7);
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const ModalContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 32px;
  width: 100%;
  max-height: 85%;
  min-height: 60%;
  overflow: hidden;
`;

const ModalHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

const ModalTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  width: 85%;
`;

const CloseButton = styled.TouchableOpacity`
  width: 24px;
  height: 24px;
  border-radius: 16px;
  justify-content: center;
  align-items: center;
`;

const FieldContainer = styled.View`
  padding: 20px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

const TwoColumnContainer = styled.View`
  flex-direction: row;
  gap: 12px;
  padding: 20px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

const FieldContainerHalf = styled.View`
  flex: 1;
`;

const FieldLabel = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 12px;
`;

const RewatchesInput = styled.TextInput`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  padding: 12px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

const ScoreInput = styled.TextInput`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  padding: 12px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  text-align: left;
`;

const EpisodesInput = styled.TextInput`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  padding: 12px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  text-align: left;
`;

const NotesInput = styled.TextInput`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  padding: 12px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  min-height: 80px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

const ButtonsContainer = styled.View`
  flex-direction: row;
  padding: 20px;
  gap: 12px;
`;

const DeleteButton = styled.TouchableOpacity`
  flex: 1;
  background-color: ${({ theme }) => `${theme.colors.error}20`};
  border: 1px solid ${({ theme }) => theme.colors.error}40;
  padding: 14px;
  border-radius: 12px;
  justify-content: center;
  align-items: center;
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};
  border-radius: 999px;
`;

const DeleteButtonContent = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const DeleteButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.error};
  font-weight: 500;
  font-size: 16px;
`;

const SaveButton = styled.TouchableOpacity`
  flex: 1;
  background-color: ${({ theme }) => `${theme.colors.success}20`};
  border: 1px solid ${({ theme }) => theme.colors.success}40;
  padding: 14px;
  border-radius: 12px;
  justify-content: center;
  align-items: center;
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};
  border-radius: 999px;
`;

const SaveButtonContent = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const SaveButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.success};
  font-weight: 500;
  font-size: 16px;
`;