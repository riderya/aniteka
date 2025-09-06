import React, { useEffect, useState, useRef } from 'react';
import { Dimensions, ActivityIndicator, FlatList, TouchableOpacity, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styled from 'styled-components/native';
import { useTheme } from '../../context/ThemeContext';
import { PlatformBlurView } from '../Custom/PlatformBlurView';
import GradientBlock from '../GradientBlock/GradientBlock';
import { getTMDBBanner, getTMDBBannerByTitle, isTMDBConfigured } from '../../utils/tmdbUtils';
import axios from 'axios';

import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const { width: windowWidth } = Dimensions.get('window');
const SPACING = 0;
const SLIDE_WIDTH = windowWidth - SPACING * 2;

// Skeleton component
const SkeletonView = ({ width, height, style }) => {
  const { isDark } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: isDark ? '#1A1A1A' : '#F2F2F2',
          borderRadius: 8,
          opacity,
        },
        style,
      ]}
    />
  );
};

const HomeBannerSwiper = () => {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);
  const [animeDetails, setAnimeDetails] = useState({});
  const [genreWidths, setGenreWidths] = useState({});
  const [bannerUrls, setBannerUrls] = useState({});
  const [bannerStates, setBannerStates] = useState({}); // Стан завантаження банерів для кожного аніме
  const navigation = useNavigation();

  const fetchAnime = async () => {
    try {
      const response = await axios.post(
        'https://api.hikka.io/anime?size=8',
        {
          years: [2025,2025],
          season: ['summer'],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const list = Array.isArray(response.data.list) ? response.data.list : [];
      setAnimeList(list);

      list.forEach(({ slug }) => {
        if (slug) {
          fetchAnimeDetails(slug);
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnimeDetails = async (slug) => {
    try {
      const response = await axios.get(`https://api.hikka.io/anime/${slug}`);

      const data = response.data || {};
      const genres = Array.isArray(data.genres) ? data.genres.map(g => g.name_ua || g.name_en || '—') : ['—'];
      const description = data.synopsis_ua || data.synopsis_en || 'Опис відсутній';
      const tmdb_id = data.tmdb_id;
      const titleEn = data.title_en; // Використовуємо тільки англійську назву

      setAnimeDetails(prev => ({
        ...prev,
        [slug]: { genres, description, tmdb_id },
      }));

      // Ініціалізуємо стан банерів для цього аніме
      setBannerStates(prev => ({
        ...prev,
        [slug]: { tmdb: null }
      }));

      // Запускаємо завантаження TMDB банеру
      fetchTMDBBanner(slug, tmdb_id, titleEn);
    } catch (error) {
      setAnimeDetails(prev => ({
        ...prev,
        [slug]: { genres: ['—'], description: 'Опис відсутній', tmdb_id: null },
      }));
    }
  };

  // Функція для отримання банеру тільки з TMDB
  const fetchTMDBBanner = async (slug, tmdb_id, title) => {
    try {
      if (!isTMDBConfigured()) {
        setBannerStates(prev => ({
          ...prev,
          [slug]: { tmdb: false }
        }));
        return;
      }

      let bannerUrl = null;

      // Спочатку намагаємося за tmdb_id
      if (tmdb_id) {
        bannerUrl = await getTMDBBanner(tmdb_id, 'tv');
      }

      // Якщо не знайшли за ID, намагаємося за англійською назвою
      if (!bannerUrl && title) {
        bannerUrl = await getTMDBBannerByTitle(title, 'tv');
      } else if (!bannerUrl && !title) {
      }

      if (bannerUrl) {
        setBannerUrls(prev => ({ ...prev, [slug]: bannerUrl }));
        setBannerStates(prev => ({
          ...prev,
          [slug]: { tmdb: true }
        }));
      } else {
        setBannerStates(prev => ({
          ...prev,
          [slug]: { tmdb: false }
        }));
      }
    } catch (error) {
      setBannerStates(prev => ({
        ...prev,
        [slug]: { tmdb: false }
      }));
    }
  };

  useEffect(() => {
    fetchAnime();
  }, []);

  // Очищаємо збережені ширини при зміні розміру екрану
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      setGenreWidths({});
      setBannerUrls({}); // Очищаємо також банерні URL
    });

    return () => subscription?.remove();
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const scrollToIndex = (index) => {
    flatListRef.current?.scrollToOffset({
      offset: index * (SLIDE_WIDTH + SPACING),
      animated: true,
    });
  };

  function removeMarkdownLinks(text) {
    if (!text) return '';
    return text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  }



  // Функція для перевірки чи поміщаються жанри
  const getVisibleGenres = (genres, slug) => {
    if (!genres || genres.length === 0) return [];
    
    const firstGenre = genres[0];
    const secondGenre = genres[1];
    
    if (!secondGenre) return [firstGenre];
    
    // Використовуємо збережені ширини або розраховуємо приблизно
    const getGenreWidth = (genre) => {
      const savedWidth = genreWidths[`${slug}-${genre}`];
      if (savedWidth) {
        return savedWidth + 34; // Додаємо padding та border
      }
      
      // Приблизна ширина якщо ще не виміряно
      const charWidth = 7.5;
      const textWidth = genre.length * charWidth;
      const padding = 32;
      const border = 2;
      return textWidth + padding + border;
    };
    
    const firstGenreWidth = getGenreWidth(firstGenre);
    const secondGenreWidth = getGenreWidth(secondGenre);
    const gap = 5;
    
    // Доступна ширина для жанрів (більш консервативний підхід)
    const ratingWidth = 85; // Трохи більше для безпеки
    const yearWidth = 65;
    const rowPadding = 32;
    const safetyMargin = 10; // Додатковий запас
    const availableWidth = SLIDE_WIDTH - ratingWidth - yearWidth - rowPadding - gap - safetyMargin;
    
    if (firstGenreWidth + secondGenreWidth + gap <= availableWidth) {
      return [firstGenre, secondGenre];
    } else {
      return [firstGenre];
    }
  };

  const renderItem = ({ item }) => {
    const bannerUrl = bannerUrls[item.slug] || '';
    const details = animeDetails[item.slug] || { genres: ['Жанри відсутні'], description: 'Опис відсутній' };
    const bannerState = bannerStates[item.slug] || { tmdb: null };

    // Невидимий текст для вимірювання ширини жанрів
    const renderInvisibleGenres = () => {
      return details.genres.slice(0, 2).map((genre, idx) => (
        <InvisibleText
          key={`invisible-${idx}-${genre}`}
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            setGenreWidths(prev => ({
              ...prev,
              [`${item.slug}-${genre}`]: width
            }));
          }}
        >
          {genre}
        </InvisibleText>
      ));
    };


  return (
  <Slide key={`slide-${item.slug || item.id || Math.random().toString(36).substr(2, 9)}`}>
    <GradientBlock />
    {bannerUrl && <BackgroundImage source={{ uri: bannerUrl }} />}
    {renderInvisibleGenres()}
    <Content>
      <Info>
        <Title numberOfLines={2}>{item.title_ua || 'Назва відсутня'}</Title>
        <TitleEn numberOfLines={1}>{item.title_en || item.title_ja || 'No English Title'}</TitleEn>
        <EpisodeBlock>
          <EpisodeText>{item.episodes_released || '?'} серія</EpisodeText>
        </EpisodeBlock>
        <Row>
          <RatingBlock>
            <StyledStar name="star" />
            <RatingText>{item.score?.toFixed(1) || '0.0'}</RatingText>
          </RatingBlock>
          <InfoBlock>
            <InfoText>{item.year || '—'}</InfoText>
          </InfoBlock>
          <GenresRow>
            {getVisibleGenres(details.genres, item.slug).map((genre, idx) => (
              <InfoBlock key={`genre-${idx}-${genre}`}>
                <GenreText>{genre}</GenreText>
              </InfoBlock>
            ))}
          </GenresRow>
        </Row>

        <Description numberOfLines={3} ellipsizeMode="tail">
          {removeMarkdownLinks(details.description)}
        </Description>

        <Row>
          <WatchButton onPress={() => navigation.push('AnimeDetails', { slug: item.slug })}>
            <StyledPlay name="play" />
            <ButtonText>Дивитись</ButtonText>
          </WatchButton>
          <DetailButton onPress={() => navigation.push('AnimeDetails', { slug: item.slug })}>
            <StyledInfo name="info" />
            <ButtonText style={{color: '#fff'}}>Детальніше</ButtonText>
          </DetailButton>
        </Row>
      </Info>
    </Content>
  </Slide>
);
};

if (loading) {
  return (
    <Container>
      <SkeletonSlide>
        <GradientBlock />
        <SkeletonBackground />
        <Content>
          <Info>
            <SkeletonView width="80%" height={40} style={{ marginBottom: 8 }} />
            <SkeletonView width="60%" height={16} style={{ marginBottom: 12 }} />
            <SkeletonView width="30%" height={24} style={{ marginBottom: 8, borderRadius: 12 }} />
            
            <Row>
              <SkeletonView width={80} height={36} style={{ borderRadius: 18 }} />
              <SkeletonView width={60} height={36} style={{ borderRadius: 18, marginLeft: 5 }} />
              <SkeletonView width={80} height={36} style={{ borderRadius: 18, marginLeft: 5 }} />
            </Row>

            <SkeletonView width="100%" height={16} style={{ marginBottom: 4 }} />
            <SkeletonView width="90%" height={16} style={{ marginBottom: 4 }} />
            <SkeletonView width="70%" height={16} style={{ marginBottom: 16 }} />

            <Row>
              <SkeletonView width={120} height={48} style={{ borderRadius: 24 }} />
              <SkeletonView width={120} height={48} style={{ borderRadius: 24, marginLeft: 4 }} />
            </Row>
          </Info>
        </Content>
      </SkeletonSlide>
    </Container>
  );
}

return (
<Container>
  <FlatList
    ref={flatListRef}
    data={animeList}
    renderItem={renderItem}
    keyExtractor={(item, index) => `${item.slug || item.id || index}`}
    horizontal
    showsHorizontalScrollIndicator={false}
    snapToInterval={SLIDE_WIDTH + SPACING}
    decelerationRate="fast"
    snapToAlignment="start"
    contentContainerStyle={{ paddingHorizontal: SPACING }}
    onViewableItemsChanged={onViewableItemsChanged}
    viewabilityConfig={viewConfigRef.current}
    getItemLayout={(data, index) => ({
      length: SLIDE_WIDTH,
      offset: SLIDE_WIDTH * index,
      index,
    })}
  />
  <Pagination>
    {animeList.map((_, index) => (
      <Dot key={`dot-${index}`} active={index === activeIndex} onPress={() => scrollToIndex(index)} />
    ))}
  </Pagination>
</Container>
);
};

const Container = styled.View`
height: 660px;
margin-bottom: 20px;
`;

const Slide = styled.View`
width: ${SLIDE_WIDTH}px;
margin-right: ${SPACING}px;
flex: 1;
overflow: hidden;

`;

const BackgroundImage = styled.Image`
position: absolute;
top: 0;
right: 0;
bottom: 0;
left: 0;
opacity: 1;
`;

const StyledBlurView = styled(PlatformBlurView)`
position: absolute;
top: 0;
right: 0;
bottom: 0;
left: 0;
`;

const Content = styled.View`
flex-direction: row;
padding: 16px;
align-items: center;
margin-top: -60px;
gap: 16px;
flex: 1;
z-index: 2;
`;

const Info = styled.View`
flex: 1;
flex-direction: column;
`;

const Title = styled.Text`
font-size: 34px;
font-weight: 900;
margin-bottom: 8px;
color: ${({ theme }) => theme.colors.text};
`;

const TitleEn = styled.Text`
font-size: 14px;
font-weight: 500;
margin-bottom: 12px;
color: ${({ theme }) => theme.colors.gray};
`;

const EpisodeBlock = styled.View`
width: 100%;
`;

const EpisodeText = styled.Text`
  font-size: 14px;
  padding: 4px 12px;
  background-color: ${({ theme }) => `${theme.colors.primary}20`};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  align-self: flex-start; 
  border-radius: 999px; 
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 8px;
`;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 5px;
  margin-bottom: 12px;
`;

const RatingBlock = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 5px;
  height: 36px;
  padding: 4px 16px;
  background-color: rgba(173, 133, 0, 0.3); 
  border-radius: 999px;
`;

const StyledStar = styled(AntDesign)`
  color: ${({ theme }) => theme.colors.warning};
  font-weight: 600;
  font-size: 14px;
`;

const RatingText = styled.Text`
  color: ${({ theme }) => theme.colors.warning};
  font-size: 14px;
  font-weight: 600;
`;

const InfoBlock = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 5px;
  height: 36px;
  padding: 4px 16px;
  border: 1px solid ${({ theme }) => theme.colors.gray};
  border-radius: 999px;
`;

const InfoText = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 600;
`;

const GenresRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 5px;
`;

const GenreText = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 600;
`;

const Description = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.gray};
  line-height:   19.6px;
  margin-bottom: 16px;
`;

const SkeletonSlide = styled.View`
  width: ${SLIDE_WIDTH}px;
  margin-right: ${SPACING}px;
  flex: 1;
  overflow: hidden;
`;

const SkeletonBackground = styled.View`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  opacity: 0.7;
`;

const Center = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const WatchButton = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 48px;
  margin-top: 5px;
  background-color: ${({ theme }) => theme.colors.primary};
  padding: 0px 32px;
  border-radius: 999px;
`;

const ButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.background};
  font-size: 14px;
  font-weight: 500;
`;

const StyledPlay = styled(FontAwesome6)`
  color: ${({ theme }) => theme.colors.background};
  font-weight: 600;
  font-size: 18px;
`;

const DetailButton = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 48px;
  margin-top: 5px;
  background-color: #30303066;
  padding: 0px 32px;
  border-radius: 999px;
  margin-left: 4px;
`;

const StyledInfo = styled(MaterialIcons)`
  color: #fff;
  font-weight: 600;
  font-size: 18px;
`;

const Pagination = styled.View`
  position: absolute;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  bottom: 150px;
  left: 0;
  right: 0;
`;

const Dot = styled.TouchableOpacity.attrs({
  activeOpacity: 1,
})`
  width: 32px;
  height: 6px;
  border-radius: 3px;
  background-color: ${({ active, theme }) => active ? theme.colors.primary : '#30303066'};
  margin: 0 6px;
`;

const InvisibleText = styled.Text`
  position: absolute;
  opacity: 0;
  font-size: 14px;
  font-weight: 600;
`;

export default HomeBannerSwiper;
