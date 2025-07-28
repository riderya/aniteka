import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import styled from 'styled-components/native';
import axios from 'axios';
import HeaderTitleBar from '../../components/Header/HeaderTitleBar';
import avatarFallback from '../../assets/image/image404.png';
import { useTheme } from '../../context/ThemeContext';
import { useRoute, useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

const CharacterCard = styled.View`
  flex-direction: row;
  margin: 6px 12px;
`;

const CharacterImage = styled.Image`
  width: 80px;
  height: 100px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.card};
`;

const Info = styled.View`
  padding-left: 12px;
  width: 78%;
`;

const Name = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  font-weight: bold;
`;

const AltName = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 14px;
  margin-top: 4px;
`;

const AnimeCharactersScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
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
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('AnimeCharacterDetailsScreen', {
                slug: item.character.slug,
              })
            }
          >
            <CharacterCard>
              <CharacterImage
                source={
                  item?.character?.image?.trim()
                    ? { uri: item.character.image }
                    : avatarFallback
                }
              />
              <Info>
                <Name numberOfLines={1}>
                  {item.character.name_ua || '?'}
                </Name>
                <AltName>{item.character.name_en || '?'}</AltName>
                <AltName>{item.character.name_ja || '?'}</AltName>
              </Info>
            </CharacterCard>
          </TouchableOpacity>
        )}
      />
    </Container>
  );
};

export default AnimeCharactersScreen;
