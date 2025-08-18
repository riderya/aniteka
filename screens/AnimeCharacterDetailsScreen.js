import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, FlatList, TouchableOpacity, Linking, View, Text } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import styled from 'styled-components/native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { BlurView } from 'expo-blur';
import Entypo from '@expo/vector-icons/Entypo';
import Markdown from 'react-native-markdown-display';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import avatarFallback from '../assets/image/image404.png';
import HeaderTitleBar from '../components/Header/HeaderTitleBar';

const Container = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Spacer = styled.View`
  width: 12px;
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

const BlockBorder = styled.View`
  padding: 10px;
  background-color: ${({ theme }) => theme.colors.card};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  margin-bottom: 12px;
  margin-left: 12px;
  margin-right: 12px;
`;

const Content = styled.ScrollView`
  padding-top: ${({ headerHeight }) => headerHeight}px;
  width: 100%;
`;

const CharacterImageWrapper = styled.View`
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-bottom: 12px;
`;

const CharacterImage = styled.Image`
  width: 210px;
  height: 300px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.card};
`;

const Name = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const SubName = styled.Text`
  color: ${({ theme }) => theme.colors.placeholder};
  font-size: 16px;
`;

const Stat = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  margin-top: 12px;
`;

const TitleLine = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 5px;
`;

const TitleLineSlider = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 12px;
  margin-left: 12px;
`;

const SpoilerToggle = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.border};
  padding: 6px 16px;
  border-radius: 999px;
  align-self: flex-start;
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const SpoilerText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  font-weight: 500;
`;

const SpoilerContentWrapper = styled.View`
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.borderInput};
  padding: 10px;
  border-radius: 16px;
  margin-top: 6px;
`;

const StyledIcon = styled(Entypo)`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 16px;
`;

const StyledIconRole = styled(MaterialIcons)`
  color: ${({ theme }) => theme.colors.success};
  font-size: 12px;
`;

const Column = styled.View`
  flex-direction: column;
  gap: 20px;
  margin-top: 8px;
`;

const AnimeCard = styled.View`
  width: 115px;
`;

const AnimeImage = styled.Image`
  width: 100%;
  height: 150px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.card};
`;

const AnimeImageAbsolute = styled.Image`
  position: absolute;
  width: 45px;
  height: 60px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.card};
  bottom: 5px;
  right: 5px;
`;

const AnimeInfo = styled.View`
  margin-top: 8px;
`;

const AnimeTitle = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const AnimeScore = styled.Text`
  flex-direction: row;
  align-items: center;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.placeholder};
  margin-top: 2px;
`;




// --- Функція для розбору тексту з спойлерами ---
function parseDescriptionWithSpoilers(text) {
  // Регекс для пошуку :::spoiler ... :::
  const regex = /:::spoiler\s*([\s\S]*?)\s*:::/gi;

  let lastIndex = 0;
  const result = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    const beforeText = text.slice(lastIndex, match.index);
    if (beforeText.trim()) {
      result.push({ type: 'text', content: beforeText });
    }

    const spoilerContent = match[1];
    result.push({ type: 'spoiler', content: spoilerContent });

    lastIndex = regex.lastIndex;
  }

  // Додати залишок тексту після останнього спойлера
  const remainingText = text.slice(lastIndex);
  if (remainingText.trim()) {
    result.push({ type: 'text', content: remainingText });
  }

  return result;
}

const AnimeCharacterDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { slug } = route.params;
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [spoilerOpen, setSpoilerOpen] = useState({});
   const headerHeight = insets.top + 65;
  const [animeList, setAnimeList] = useState([]);
  const [mangaList, setMangaList] = useState([]);
  const [novelList, setNovelList] = useState([]);
  const [voicesList, setVoicesList] = useState([]);

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const response = await axios.get(`https://api.hikka.io/characters/${slug}`);
        setCharacter(response.data);
      } catch (error) {

      } finally {
        setLoading(false);
      }
    };
  
    const fetchCharacterAnime = async () => {
      try {
        const response = await axios.get(`https://api.hikka.io/characters/${slug}/anime?page=1&size=100`);
        setAnimeList(response.data.list || []);
      } catch (error) {

      }
    };
  
    const fetchCharacterManga = async () => {
      try {
        const response = await axios.get(`https://api.hikka.io/characters/${slug}/manga?page=1&size=100`);
        setMangaList(response.data.list || []);
      } catch (error) {
        
      }
    };

    const fetchCharacterNovel = async () => {
        try {
          const response = await axios.get(`https://api.hikka.io/characters/${slug}/novel?page=1&size=100`);
          setNovelList(response.data.list || []);
        } catch (error) {
          
        }
      };

    const fetchCharacterVoices = async () => {
        try {
          const response = await axios.get(`https://api.hikka.io/characters/${slug}/voices?page=1&size=100`);
          setVoicesList(response.data.list || []);
        } catch (error) {
          
        }
      };
  
    fetchCharacter();
    fetchCharacterAnime();
    fetchCharacterManga();
    fetchCharacterNovel();
    fetchCharacterVoices();
  }, [slug]);
  

  if (loading || !character) {
    return (
      <Container>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </Container>
    );
  }

  // Розбираємо опис на текст і спойлери
  const parsedDescription = parseDescriptionWithSpoilers(character.description_ua || '');

  return (
    <Container>

      <BlurOverlay experimentalBlurMethod="dimezisBlurView" intensity={100} tint={isDark ? 'dark' : 'light'}>
        <HeaderTitleBar title={`${character.name_ua || character.name_en || character.name_ja}`} />
      </BlurOverlay>

      <Content
              headerHeight={headerHeight}
              contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
              >
        <CharacterImageWrapper>
          <CharacterImage 
  source={
    character?.image?.trim()
      ? { uri: character.image }
      : avatarFallback
  }
          />
        </CharacterImageWrapper>

        <BlockBorder>
          <Name>{character.name_ua}</Name>
          {character.name_en && <SubName>{character.name_en}</SubName>}
          {character.name_ja && <SubName>{character.name_ja}</SubName>}
          {character.synonyms?.length > 0 && (
            <SubName>Синоніми: {character.synonyms.join(', ')}</SubName>
          )}
        </BlockBorder>

        <BlockBorder>
  <TitleLine>Опис</TitleLine>

  {parsedDescription.length === 0 ? (
    <Markdown
      style={{
        body: {
          color: theme.colors.gray,
          fontSize: 14,
          lineHeight: 20,
        },
      }}
    >
      Опис відсутній.
    </Markdown>
  ) : (
    parsedDescription.map((block, idx) => {
      if (block.type === 'text') {
        return (
          <Markdown
            key={`text-${idx}`}
            style={{
              body: {
                color: theme.colors.gray,
                lineHeight: 20,
              },
              link: {
                color: theme.colors.primary,
              },
            }}
          >
            {block.content || 'cdsv'}
          </Markdown>
        );
      } else if (block.type === 'spoiler') {
        const isOpen = spoilerOpen[idx] || false;

        return (
          <View key={`spoiler-${idx}`}>
            <SpoilerToggle
              onPress={() => {
                setSpoilerOpen((prev) => ({ ...prev, [idx]: !prev[idx] }));
              }}
            >
              <SpoilerText>
                {isOpen ? 'Приховати спойлер' : 'Показати спойлер'}
              </SpoilerText>
              <StyledIcon name="select-arrows" />
            </SpoilerToggle>
            {isOpen && (
              <SpoilerContentWrapper>
                <Markdown
                  style={{
                    body: {
                      color: isDark ? '#ccc' : '#333',
                      fontSize: 14,
                      lineHeight: 20,
                    },
                    link: {
                      color: theme.colors.primary,
                    },
                  }}
                >
                  {block.content}
                </Markdown>
              </SpoilerContentWrapper>
            )}
          </View>
        );
      }

      return null;
    })
  )}

  <Stat>🎙️ Озвучувань: {character.voices_count}</Stat>
  <Stat>📺 Аніме: {character.anime_count}</Stat>
  <Stat>📚 Манґа: {character.manga_count}</Stat>
  <Stat>📖 Ранобе: {character.novel_count}</Stat>
</BlockBorder>



        <Column>
        {animeList.length > 0 && (
  <View>
    <TitleLineSlider>Аніме</TitleLineSlider>
    <FlatList
      data={animeList}
      keyExtractor={(_, index) => `anime-${index}`}
      horizontal
      showsHorizontalScrollIndicator={false}
      ListHeaderComponent={<Spacer />}
      ListFooterComponent={<Spacer />}
      ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
      renderItem={({ item }) => {
        const { anime, main } = item;

        return (
<TouchableOpacity
  onPress={() => navigation.navigate('AnimeDetails', { slug: anime.slug })}
>
  <AnimeCard>
    <AnimeImage source={{ uri: anime.image }} />
    <AnimeInfo>
      <AnimeTitle numberOfLines={2}>
        {anime.title_ua || anime.title_en || anime.title_ja || '?'}
      </AnimeTitle>
      {main && (
        <AnimeScore>
          <StyledIconRole name="verified-user" /> Головна роль
        </AnimeScore>
      )}
    </AnimeInfo>
  </AnimeCard>
</TouchableOpacity>

        );
      }}
    />
  </View>
)}


{mangaList.length > 0 && (
  <View>
    <TitleLineSlider>Манга</TitleLineSlider>
    <FlatList
      data={mangaList}
      keyExtractor={(_, index) => `manga-${index}`}
      horizontal
      showsHorizontalScrollIndicator={false}
      ListHeaderComponent={<Spacer />}
      ListFooterComponent={<Spacer />}
      ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
      renderItem={({ item }) => {
        const { manga, main } = item;

        return (
          <TouchableOpacity
          onPress={() => WebBrowser.openBrowserAsync(`https://hikka.io/manga/${manga.slug}`)}
        >
          <AnimeCard>
            <AnimeImage source={{ uri: manga.image }} />
            <AnimeInfo>
              <AnimeTitle numberOfLines={2}>
                {manga.title_ua || manga.title_en || manga.title_ja || '?'}
              </AnimeTitle>
              {main && (
                <AnimeScore>
                  <StyledIconRole name="verified-user" /> Головна роль
                </AnimeScore>
              )}
            </AnimeInfo>
          </AnimeCard>
        </TouchableOpacity>
        );
      }}
    />
  </View>
)}



{novelList.length > 0 && (
  <View>
    <TitleLineSlider>Ранобе</TitleLineSlider>
    <FlatList
      data={novelList}
      keyExtractor={(_, index) => `novel-${index}`}
      horizontal
      showsHorizontalScrollIndicator={false}
      ListHeaderComponent={<Spacer />}
      ListFooterComponent={<Spacer />}
      ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
      renderItem={({ item }) => {
        const { novel, main } = item;

        return (
          <TouchableOpacity
          onPress={() => WebBrowser.openBrowserAsync(`https://hikka.io/novel/${novel.slug}`)}
        >
          <AnimeCard>
            <AnimeImage source={{ uri: novel.image }} />
            <AnimeInfo>
              <AnimeTitle numberOfLines={2}>
                {novel.title_ua || novel.title_en || novel.title_ja || '?  '}
              </AnimeTitle>
              {main && <AnimeScore><StyledIconRole name="verified-user" /> Головна роль</AnimeScore>}
            </AnimeInfo>
          </AnimeCard>
          </TouchableOpacity>
        );
      }}
    />
  </View>
)}



{voicesList.length > 0 && (
  <View>
    <TitleLineSlider>Сейю</TitleLineSlider>
    <FlatList
      data={voicesList}
      keyExtractor={(_, index) => `voice-${index}`}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 6, marginBottom: 12 }}
      ListHeaderComponent={<Spacer />}
      ListFooterComponent={<Spacer />}
      ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
      renderItem={({ item }) => {
        const { person, anime, language } = item;

        return (
          <TouchableOpacity
          onPress={() => navigation.navigate('AnimePeopleDetailsScreen', { slug: person.slug })}>
          <AnimeCard>
            <View>
            <AnimeImage source={{ uri: person.image }} />
            <AnimeImageAbsolute source={{ uri: anime.image }} />
            </View>
            <AnimeInfo>
            <AnimeScore style={{ marginBottom: 4 }} numberOfLines={1}>{anime.title_ua || anime.title_en || anime.title_ja}</AnimeScore>
              <AnimeTitle numberOfLines={2}>
                {person.name_ua || person.name_en || person.name_native || '?'}
              </AnimeTitle>
              <AnimeScore>{language?.toUpperCase()}</AnimeScore>
            </AnimeInfo>
          </AnimeCard>
          </TouchableOpacity>
        );
      }}
    />
  </View>
)}

</Column>


      </Content>
    </Container>
  );
};

export default AnimeCharacterDetailsScreen;
