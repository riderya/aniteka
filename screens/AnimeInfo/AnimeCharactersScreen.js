import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
} from 'react-native';
import styled from 'styled-components/native';
import axios from 'axios';
import HeaderTitleBar from '../../components/Header/HeaderTitleBar';
import { useTheme } from '../../context/ThemeContext';
import { useRoute } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CharacterCardItem from '../../components/Cards/CharacterCardItem';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const CenteredContainer = styled(Container)`
  align-items: center;
  justify-content: center;
`;

const BlurOverlay = styled(BlurView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  border-bottom-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

const AnimeCharactersScreen = () => {
  const route = useRoute();
  const { slug, title } = route.params;

  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);

  const headerHeight = insets.top + 60;

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          `https://api.hikka.io/anime/${slug}/characters?page=1&size=100`
        );
        setCharacters(data.list);
      } catch (error) {
        console.error('Error fetching characters:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return (
      <CenteredContainer>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </CenteredContainer>
    );
  }

  return (
    <Container>
      <BlurOverlay intensity={100} tint={isDark ? 'dark' : 'light'}>
        <HeaderTitleBar title={`Всі персонажі: ${title}`} />
      </BlurOverlay>

      <FlatList
        data={characters}
        keyExtractor={(item) => item.character.slug}
        contentContainerStyle={{
          paddingTop: headerHeight,
          paddingBottom: 20 + insets.bottom,
        }}
        renderItem={({ item }) => (
          <CharacterCardItem character={item.character} />
        )}
      />
    </Container>
  );
};

export default AnimeCharactersScreen;
