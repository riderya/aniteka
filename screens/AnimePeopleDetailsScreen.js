import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Linking,
  View,
  Text,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import styled from 'styled-components/native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import Entypo from '@expo/vector-icons/Entypo';
import Markdown from '../components/Custom/MarkdownText';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import avatarFallback from '../assets/image/image404.png';
import BackButton from '../components/DetailsAnime/BackButton';
import { Ionicons } from '@expo/vector-icons';
import AnimeColumnCard from '../components/Cards/AnimeColumnCard';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const CenteredContainer = styled(Container)`
  align-items: center;
  justify-content: center;
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
  margin: 0 12px 12px;
`;

const Content = styled.ScrollView`
  padding-top: ${({ headerHeight }) => headerHeight}px;
  width: 100%;
`;

const PeopleImageWrapper = styled.View`
  align-items: center;
  margin-bottom: 12px;
`;

const PeopleImage = styled.Image`
  width: 210px;
  height: 300px;
  border-radius: 32px;
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
  margin: 0 0 12px 12px;
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
  margin-top: 8px;
  gap: 20px;
`;

const RowBetween = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
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
  font-weight: 600;
`;

const GrayIcon = styled(Ionicons)`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 16px;
`;

/* ---------- utils ---------- */
function parseDescriptionWithSpoilers(text) {
  const regex = /:::spoiler\s*([\s\S]*?)\s*:::/gi;
  let lastIndex = 0;
  const result = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    const beforeText = text.slice(lastIndex, match.index);
    if (beforeText.trim()) result.push({ type: 'text', content: beforeText });
    result.push({ type: 'spoiler', content: match[1] });
    lastIndex = regex.lastIndex;
  }
  const remainingText = text.slice(lastIndex);
  if (remainingText.trim()) result.push({ type: 'text', content: remainingText });
  return result;
}

/* ---------- component ---------- */
const AnimePeopleDetailsScreen = () => {
  const { slug } = useRoute().params;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [people, setPeople] = useState(null);
  const [loading, setLoading] = useState(true);
  const [spoilerOpen, setSpoilerOpen] = useState({});
  const [animeList, setAnimeList] = useState([]);
  const [mangaList, setMangaList] = useState([]);
  const [novelList, setNovelList] = useState([]);

  const headerHeight = insets.top + 30;

  /* --- fetch --- */
  useEffect(() => {
    (async () => {
      try {
        const p = await axios.get(`https://api.hikka.io/people/${slug}`);
        const a = await axios.get(`https://api.hikka.io/people/${slug}/anime?page=1&size=100`);
        const m = await axios.get(`https://api.hikka.io/people/${slug}/manga?page=1&size=100`);
        const n = await axios.get(`https://api.hikka.io/people/${slug}/novel?page=1&size=100`);
        setPeople(p.data);
        setAnimeList(a.data.list || []);
        setMangaList(m.data.list || []);
        setNovelList(n.data.list || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading || !people) {
    return (
      <CenteredContainer>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </CenteredContainer>
    );
  }

  const parsedDescription = parseDescriptionWithSpoilers(people.description_ua || '');

  return (
    <Container>
        <BackButton top={12}/>

      <Content contentContainerStyle={{
        paddingBottom: insets.bottom + 20,
        paddingTop: insets.top + 12,
       }}>
        <PeopleImageWrapper>
          <PeopleImage 
  source={
    people?.image?.trim()
      ? { uri: people.image }
      : avatarFallback
  }
          />
        </PeopleImageWrapper>

        <BlockBorder>
          <RowBetween>
            <RowLeft>
              <GrayIcon name="text" />
              <Label>Ім'я укр.</Label>
            </RowLeft>
            <Value numberOfLines={1}>{people.name_ua || '?'}</Value>
          </RowBetween>

          {people.name_en ? (
            <RowBetween>
              <RowLeft>
                <GrayIcon name="globe-outline" />
                <Label>Ім'я англ.</Label>
              </RowLeft>
              <Value numberOfLines={1}>{people.name_en}</Value>
            </RowBetween>
          ) : null}

          {people.name_native ? (
            <RowBetween>
              <RowLeft>
                <GrayIcon name="language" />
                <Label>Ім'я оригіналу.</Label>
              </RowLeft>
              <Value numberOfLines={1}>{people.name_native}</Value>
            </RowBetween>
          ) : null}

          {people.synonyms?.length > 0 && (
            <RowBetween>
              <RowLeft>
                <GrayIcon name="list" />
                <Label>Синоніми</Label>
              </RowLeft>
              <Value>{people.synonyms.join(', ')}</Value>
            </RowBetween>
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
                      color: theme.colors.gray,
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
    <TitleLine>Інформація</TitleLine>
    <RowBetween>
      <RowLeft>
        <GrayIcon name="mic-outline" />
        <Label>Озвучувань:</Label>
      </RowLeft>
      <Value>{people.characters_count}</Value>
    </RowBetween>

    <RowBetween>
      <RowLeft>
        <GrayIcon name="play-circle" />
        <Label>Аніме:</Label>
      </RowLeft>
      <Value>{people.anime_count}</Value>
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
        const { anime, roles = [] } = item;
      
        return (
          <AnimeColumnCard
            anime={anime}
            roles={roles}
            cardWidth={115}
            imageWidth={115}
            imageHeight={150}
            badgeFontSize={12}
            onPress={() => navigation.navigate('AnimeDetails', { slug: anime.slug })}
          />
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

export default AnimePeopleDetailsScreen;