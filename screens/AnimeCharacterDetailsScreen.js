import { useEffect, useState, useRef, useCallback } from 'react';
import { ActivityIndicator, ScrollView, FlatList, TouchableOpacity, Linking, View, Text } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import styled from 'styled-components/native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { useWatchStatus } from '../context/WatchStatusContext';
import Toast from 'react-native-toast-message';
import { BlurView } from 'expo-blur';
import Entypo from '@expo/vector-icons/Entypo';
import Markdown from '../components/Custom/MarkdownText';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';
import avatarFallback from '../assets/image/image404.png';
import BackButton from '../components/DetailsAnime/BackButton';
import LikeCharacterButton from '../components/DetailsAnime/LikeCharacterButton';

const Container = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Spacer = styled.View`
  width: 12px;
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
  width: 100%;
`;

const CharacterImageWrapper = styled.View`
  position: relative;
  align-items: center;
  justify-content: center;
  width: 210px;
  margin: 0 auto;
  margin-bottom: 12px;
`;

const CharacterImage = styled.Image`
  width: 210px;
  height: 300px;
  border-radius: 32px;
  background-color: ${({ theme }) => theme.colors.card};
`;

const TitleRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
`;

const TitleLineWithLike = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 22px;
  font-weight: bold;
  flex: 1;
`;

const LikeButtonInline = styled.TouchableOpacity`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
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
  margin-top: 12px;
  margin-bottom: 12px;
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
  margin-bottom: 12px;
`;

const StyledIcon = styled(Entypo)`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 16px;
`;

const StyledIconRole = styled(MaterialIcons)`
  color: ${({ theme }) => theme.colors.success};
  font-size: 12px;
`;

const RowBetween = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
`;

const RowLeft = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const Label = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 15px;
  font-weight: bold;
`;

const Value = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 15px;
  text-align: right;
  font-weight: 600;
  flex: 1;
`;

const GrayIcon = styled(Ionicons)`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 16px;
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

const LikeButtonOnPoster = styled.TouchableOpacity`
  position: absolute;
  bottom: 10px;
  right: 10px;
  padding: 6px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => `${theme.colors.background}70`};
  border-radius: 999px;
`;

const CommentButtonOnPoster = styled.TouchableOpacity`
  position: absolute;
  bottom: 10px;
  left: 10px;
  padding: 6px 10px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => `${theme.colors.background}70`};
  border-radius: 999px;
  flex-direction: row;
  gap: 4px;
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
   const headerHeight = insets.top + 30;
  const [animeList, setAnimeList] = useState([]);
  const [mangaList, setMangaList] = useState([]);
  const [novelList, setNovelList] = useState([]);
  const [voicesList, setVoicesList] = useState([]);
  const [isUpdatingLike, setIsUpdatingLike] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Ref для debounce
  const scrollTimeoutRef = useRef(null);

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

  // Логіка для кнопки лайка
  const {
    authToken,
    isAuthChecked,
    getCharacterFavourite,
    fetchCharacterFavourite,
    updateCharacterFavourite,
  } = useWatchStatus();

  const liked = getCharacterFavourite(slug);

  const toggleFavourite = async () => {
    if (!authToken) {
      Toast.show({
        type: 'info',
        text1: 'Авторизуйтеся, будь ласка',
        text2: 'Щоб додавати персонажів у улюблене, потрібно увійти в акаунт.',
        position: 'bottom',
        visibilityTime: 4000,
        autoHide: true,
      });
      return;
    }

    if (isUpdatingLike) return;
    
    setIsUpdatingLike(true);
  
    try {
      const endpoint = `https://api.hikka.io/favourite/character/${slug}`;
      
      if (liked === true) {
        await fetch(endpoint, {
          method: 'DELETE',
          headers: { auth: authToken },
        });
        updateCharacterFavourite(slug, false);
        Toast.show({
          type: 'success',
          text1: '💔 Видалено з улюблене',
          position: 'bottom',
        });
      } else {
        await fetch(endpoint, {
          method: 'PUT',
          headers: { auth: authToken, 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        updateCharacterFavourite(slug, true);
        Toast.show({
          type: 'success',
          text1: '❤️ Додано в улюблене',
          position: 'bottom',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Помилка',
        text2: 'Не вдалося змінити вподобання',
        position: 'bottom',
      });
    } finally {
      setIsUpdatingLike(false);
    }
  };

  // Обробник скролу для показу/приховування кнопки з debounce
  const handleScroll = useCallback((event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const threshold = 450; // Поріг скролу в пікселях
    
    // Очищуємо попередній таймаут
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Додаємо невелику затримку для уникнення занадто частих оновлень
    scrollTimeoutRef.current = setTimeout(() => {
      if (scrollY > threshold && !isScrolled) {
        setIsScrolled(true);
      } else if (scrollY <= threshold && isScrolled) {
        setIsScrolled(false);
      }
    }, 50); // 50ms затримка
  }, [isScrolled]);

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
        <BackButton top={12}/>
        <LikeCharacterButton slug={slug} top={12} isVisible={isScrolled}/>

      <Content 
        contentContainerStyle={{
          paddingBottom: insets.bottom + 20,
          paddingTop: insets.top + 12,
        }}
        onScroll={handleScroll}
        scrollEventThrottle={8}
        showsVerticalScrollIndicator={false}
      >
        <CharacterImageWrapper>
          <CharacterImage 
            source={

              character?.image?.trim()
                ? { uri: character.image }
                : avatarFallback
            }
          />
          {/* Кнопка коментаря зліва */}
          <CommentButtonOnPoster
            onPress={() =>
              navigation.navigate('CommentsDetailsScreen', {
                slug: character.slug,
                title: character.name_ua || character.name_en || character.name_ja || '?',
                commentsCount: character.comments_count || 0,
                contentType: 'character'
              })
            }
          >
            <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>{character.comments_count}</Text>
          </CommentButtonOnPoster>
          {/* Кнопка вподобання справа */}
          <LikeButtonOnPoster 
            onPress={isUpdatingLike ? null : toggleFavourite}
            disabled={isUpdatingLike}
          >
            {isUpdatingLike ? (
              <ActivityIndicator size={24} color="#fff" />
            ) : (
              <Ionicons
                name={liked === true ? 'heart' : 'heart-outline'}
                size={24}
                color={liked === true ? theme.colors.favourite : '#fff'}
              />
            )}
          </LikeButtonOnPoster>
        </CharacterImageWrapper>

        <BlockBorder>
          <RowBetween>
            <RowLeft>
              <GrayIcon name="text" />
              <Label>Ім'я укр.</Label>
            </RowLeft>
            <Value numberOfLines={1}>{character.name_ua || '?'}</Value>
          </RowBetween>
          {character.name_en ? (
            <RowBetween>
              <RowLeft>
                <GrayIcon name="globe-outline" />
                <Label>Ім'я англ.</Label>
              </RowLeft>
              <Value numberOfLines={1}>{character.name_en}</Value>
            </RowBetween>
          ) : null}
          {character.name_ja ? (
            <RowBetween>
              <RowLeft>
                <GrayIcon name="language" />
                <Label>Ім'я оригіналу.</Label>
              </RowLeft>
              <Value numberOfLines={1}>{character.name_ja}</Value>
            </RowBetween>
          ) : null}
          {character.synonyms?.length > 0 && (
            <RowBetween>
              <RowLeft>
                <GrayIcon name="list" />
                <Label>Синоніми</Label>
              </RowLeft>
              <Value>{character.synonyms.join(', ')}</Value>
            </RowBetween>
          )}
        </BlockBorder>

        <BlockBorder>
  <TitleRow>
    <TitleLineWithLike>Опис</TitleLineWithLike>
  </TitleRow>

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

        </BlockBorder>

        <BlockBorder>
          <TitleRow>
            <TitleLineWithLike>Інформація</TitleLineWithLike>
          </TitleRow>
          <RowBetween>
            <RowLeft>
              <GrayIcon name="mic-outline" />
              <Label>Озвучувань:</Label>
            </RowLeft>
            <Value>{character.voices_count}</Value>
          </RowBetween>
          <RowBetween>
            <RowLeft>
              <GrayIcon name="play-circle" />
              <Label>Аніме:</Label>
            </RowLeft>
            <Value>{character.anime_count}</Value>
          </RowBetween>
          <RowBetween>
            <RowLeft>
              <GrayIcon name="book" />
              <Label>Манґа:</Label>
            </RowLeft>
            <Value>{character.manga_count}</Value>
          </RowBetween>
          <RowBetween>
            <RowLeft>
              <GrayIcon name="library" />
              <Label>Ранобе:</Label>
            </RowLeft>
            <Value>{character.novel_count}</Value>
          </RowBetween>
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
    <TitleLineSlider>Манґа</TitleLineSlider>
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

const InfoTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 12px;
  margin-top: 15px;
`;

const InfoRow = styled.View`
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
`;

const InfoText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 15px;
  text-align: right;
  font-weight: 600;
  flex: 1;
`;

const InfoBold = styled.Text`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.gray};
`;

const InfoIcon = styled(Ionicons)`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 16px;
  margin-right: 4px;
`;

const NameContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
  justify-content: space-between;
`;

const NameType = styled.View`
  min-width: 100px;
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const NameTypeText = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 15px;
  font-weight: bold;
`;

