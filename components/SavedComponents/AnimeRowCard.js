import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { useTheme } from '../../context/ThemeContext';

import Octicons from '@expo/vector-icons/Octicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const TOKEN_KEY = 'hikka_token';
import * as SecureStore from 'expo-secure-store';

const AnimeRowCard = ({ anime }) => {
  const navigation = useNavigation();
  const [isFavourite, setIsFavourite] = useState(false);
  const [userStatus, setUserStatus] = useState(null);
  const { theme, isDark } = useTheme();

  // Перевірка фаворитів (як було)
  useEffect(() => {
    const checkFavourite = async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!token) return;

        const res = await fetch(`https://api.hikka.io/favourite/anime/${anime.slug}`, {
          headers: { auth: token }
        });
        setIsFavourite(res.status === 200);
      } catch {
        setIsFavourite(false);
      }
    };

    checkFavourite();
  }, [anime.slug]);

  // Новий useEffect для статусу користувача з /watch/{slug}
  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!token) {
          setUserStatus(null);
          return;
        }

        const res = await fetch(`https://api.hikka.io/watch/${anime.slug}`, {
          headers: { auth: token }
        });

        if (!res.ok) {
          setUserStatus(null);
          return;
        }

        const data = await res.json();
        setUserStatus(data.status || null);
      } catch {
        setUserStatus(null);
      }
    };

    fetchUserStatus();
  }, [anime.slug]);

  const renderWatchStatus = (status) => {
    switch (status) {
      case 'watching':
        return 'Дивлюсь';
      case 'planned':
        return 'Заплановано';
      case 'dropped':
        return 'Закинуто';
      case 'on_hold':
        return 'Відкладено';
      case 'completed':
        return 'Переглянуто';
      case 'favourite':
        return 'Улюблене';
      default:
        return '';
    }
  };

  const handlePress = () => {
    navigation.navigate('AnimeDetails', { slug: anime.slug });
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Card>
        <ImageWrapper>
          <AnimeImage source={{ uri: anime.image }} resizeMode="cover" />
          {userStatus && (
            <StatusText status={userStatus}>
              {renderWatchStatus(userStatus)}
            </StatusText>
          )}
        </ImageWrapper>
        <Info>
          <TitleRow>
            <AnimeTitle>{anime.title_ua || anime.title_en || 'Без назви'}</AnimeTitle>
          </TitleRow>
          <Row>
            <EpisodesText>{anime.episodes_released || '?'} / {anime.episodes_total || '?'} еп</EpisodesText>
            <FontAwesome name="circle" size={6} color={theme.colors.gray} />
            <ScoreText>{anime.score || '—'}</ScoreText>
            <Octicons style={{ marginLeft: -6 }} name="star-fill" size={12} color={theme.colors.gray} />
            {isFavourite && <FavouriteMark name="heart-fill" size={24} color={theme.colors.error} />}
          </Row>

          <DescriptionText numberOfLines={3}>
            {anime.synopsis_ua || anime.synopsis_en || 'Опис відсутній'}
          </DescriptionText>
        </Info>
      </Card>
    </TouchableOpacity>
  );
};

export default AnimeRowCard;

// ... стилі залишаються без змін


const Card = styled.View`
  flex-direction: row;
  margin-bottom: 20px;
  align-items: flex-start;
`;

const ImageWrapper = styled.View`
  position: relative;
  width: 90px;
  margin-right: 15px;
`;

const AnimeImage = styled.Image`
  width: 90px;
  height: 120px;
  border-radius: 12px;
`;

const Info = styled.View`
  flex: 1;
  justify-content: flex-start;
`;

const TitleRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const AnimeTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 6px;
`;

const StatusText = styled.Text`
  position: absolute;
  text-align: center;
  bottom: 0px;
  padding: 3px;
  font-size: 12px;
  font-weight: 500;
  width: 100%;
  color: #fff;
  border-radius: 0px 0px 12px 12px;
  background-color: ${({ status }) => {
    switch (status) {
      case 'watching':
        return 'rgba(76, 175, 80, 0.7)';     // #4caf50
      case 'planned':
        return 'rgba(33, 150, 243, 0.7)';    // #2196f3
      case 'dropped':
        return 'rgba(244, 67, 54, 0.7)';     // #f44336
      case 'on_hold':
        return 'rgba(255, 152, 0, 0.7)';     // #ff9800
      case 'completed':
        return 'rgba(156, 39, 176, 0.7)';    // #9c27b0
      case 'favourite':
        return 'rgba(244, 67, 54, 0.7)';    // #e83e8c
      default:
        return 'rgba(51, 51, 51, 0.7)';      // #333
    }
  }};
`;



const Row = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const EpisodesText = styled.Text`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.gray};
`;

const ScoreText = styled.Text`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.gray};
`;

const FavouriteMark = styled(Octicons)`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.error};
  margin-left: 8px;
`;

const DescriptionText = styled.Text`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.gray};
`;
