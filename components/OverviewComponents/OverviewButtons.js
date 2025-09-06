import React, { useCallback } from 'react';
import styled, { useTheme } from 'styled-components/native';
import { AntDesign, MaterialIcons, Entypo, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { Alert } from 'react-native';

const buttonsData = [
  { key: 'popular', label: 'Популярні', iconName: 'star', iconLib: AntDesign },
  { key: 'schedule', label: 'Розклад', iconName: 'schedule', iconLib: MaterialIcons },
  { key: 'collections', label: 'Колекції', iconName: 'folder', iconLib: Entypo },
  { key: 'filter', label: 'Фільтр', iconName: 'filter', iconLib: Ionicons },
  { key: 'random', label: 'Рандом', iconName: 'reload1', iconLib: AntDesign },
  { key: 'articles', label: 'Статті', iconName: 'article', iconLib: MaterialIcons },
];

const OverviewButtons = React.memo(() => {
  const theme = useTheme();
  const navigation = useNavigation();

  const handlePress = useCallback(async (key) => {
    const rootNav = navigation.getParent ? navigation.getParent() : navigation;
    if (key === 'popular') {
      rootNav.navigate('PopularAnimeScreen');
    } else if (key === 'filter') {
      rootNav.navigate('AnimeFilterScreen');
    } else if (key === 'schedule') {
      rootNav.navigate('AnimeScheduleScreen');
    } else if (key === 'collections') {
      rootNav.navigate('AnimeCollectionsScreen');
    } else if (key === 'articles') {
      rootNav.navigate('AnimeAllArticlesScreen');
    } else if (key === 'random') {
        const maxPages = 1000;
        const randomPage = Math.floor(Math.random() * maxPages) + 1;
        const response = await axios.post(`https://api.hikka.io/anime?page=${randomPage}&size=1`, {
        });
        const animeList = response.data.list;
        const randomAnime = animeList[0];
        rootNav.navigate('AnimeDetails', { slug: randomAnime.slug });
    }
  }, [navigation]);

  return (
    <Container>
      {buttonsData.map(({ key, label, iconName, iconLib: Icon }) => (
        <Button key={key} activeOpacity={0.7} onPress={() => handlePress(key)}>
          <IconWrapper>
            <Icon name={iconName} size={20} color={theme.colors.text} />
          </IconWrapper>
          <ButtonText>{label}</ButtonText>
        </Button>
      ))}
    </Container>
  );
});

OverviewButtons.displayName = 'OverviewButtons';

export default OverviewButtons;

const Container = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 0px 12px;
  margin-top: 20px;
`;

const Button = styled.TouchableOpacity`
  width: 48%;
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0px 24px;
  height: 50px;
  margin: 6px 0px;
  border-radius: 999px;
  flex-direction: row;
  align-items: center;
`;

const IconWrapper = styled.View`
  margin-right: 10px;
`;

const ButtonText = styled.Text`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;
