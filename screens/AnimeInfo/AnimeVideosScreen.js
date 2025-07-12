import React, { useState, useMemo } from 'react';
import { Alert, Linking } from 'react-native';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

// === УТИЛІТИ ===
const getVideoType = (video) => {
  if (video.video_type === 'video_promo') return 'PV';
  if (
    video.video_type === 'video_op' ||
    (video.video_type === 'video_music' && video.title.toUpperCase().includes('OP'))
  )
    return 'OP';
  if (
    video.video_type === 'video_ed' ||
    (video.video_type === 'video_music' && video.title.toUpperCase().includes('ED'))
  )
    return 'ED';
  if (video.video_type === 'video_trailer') return 'Trailer';
  if (video.video_type === 'video_special') return 'Special';
  return video.video_type;
};

const getYouTubeThumbnail = (url) => {
  try {
    const match = url.match(
      /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|embed|shorts|watch)\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
  } catch {}
  return null;
};

// === СТИЛІ ===
const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const BlurOverlay = styled(BlurView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
`;

const HeaderWrapper = styled.View``;

const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 10px 0px;
  border-bottom-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

const BackButton = styled.TouchableOpacity`
  padding: 8px;
`;

const HeaderTitle = styled.Text`
  flex: 1;
  color: ${({ theme }) => theme.colors.text};
  font-size: 18px;
  font-weight: bold;
  margin-left: 8px;
`;

const FilterRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px;
`;

const FilterButton = styled.TouchableOpacity`
  background-color: ${(props) =>
    props.active ? props.theme.colors.primary : props.theme.colors.border};
  flex-direction: row;
  align-items: center;
  padding: 0px 24px;
  height: 30px;
  border-radius: 999px;
`;

const FilterText = styled.Text`
  color: ${(props) =>
    props.active ? props.theme.colors.background : props.theme.colors.gray};
  font-size: 14px;
  font-weight: bold;
`;

const ScrollContainer = styled.ScrollView`
  flex: 1;
  padding-top: 10px;
`;

const VideoCard = styled.TouchableOpacity`
  flex-direction: row;
  border-radius: 12px;
  margin: 10px;
`;

const Thumbnail = styled.Image`
  width: 140px;
  height: 80px;
  border-radius: 8px;
  background-color: #333;
`;

const VideoInfo = styled.View`
  flex: 1;
  margin-left: 10px;
`;

const Title = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

const Subtitle = styled.Text`
  font-size: 13px;
  color: #aaa;
  margin-top: 4px;
`;

const VideoType = styled.Text`
  font-size: 11px;
  color: #888;
  margin-top: 6px;
  font-weight: 600;
`;

const StyledIcon = styled(Ionicons)`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 24px;
`;

// === ГОЛОВНИЙ КОМПОНЕНТ ===
const AnimeVideosScreen = ({ route }) => {
  const { anime, filter: initialFilter = 'ALL' } = route.params;
  const [filter, setFilter] = useState(initialFilter);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const videos = anime?.videos || [];
  const { isDark } = useTheme();

  const openVideo = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Помилка', 'Неможливо відкрити посилання: ' + url);
      }
    } catch (error) {
      Alert.alert('Помилка', 'Щось пішло не так: ' + error.message);
    }
  };

  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      const type = getVideoType(video);
      return filter === 'ALL' || type === filter;
    });
  }, [videos, filter]);

  const filters = ['ALL', 'PV', 'OP', 'ED'];

  const headerHeight = insets.top + 110;

  return (
    <Container>
      <BlurOverlay intensity={100} tint={isDark ? 'dark' : 'light'} style={{ paddingTop: insets.top }}>
        <HeaderWrapper>
          <HeaderRow>
            <BackButton onPress={() => navigation.goBack()}>
              <StyledIcon name="arrow-back" />
            </BackButton>
            <HeaderTitle numberOfLines={1}>
              Відео: {anime?.title_ua || anime?.title_en || anime?.title_ja || 'Аніме'}
            </HeaderTitle>
          </HeaderRow>

          <FilterRow>
            {filters.map((f) => (
              <FilterButton key={f} active={filter === f} onPress={() => setFilter(f)}>
                <FilterText active={filter === f}>{f === 'ALL' ? 'Усі' : f}</FilterText>
              </FilterButton>
            ))}
          </FilterRow>
        </HeaderWrapper>
      </BlurOverlay>

      <ScrollContainer
        contentContainerStyle={{
          paddingTop: headerHeight,
          paddingBottom: 20 + insets.bottom, // ← ВАЖЛИВО: відступ знизу
        }}
      >
        {filteredVideos.map((video, index) => {
          const type = getVideoType(video);
          const thumbnailUrl = getYouTubeThumbnail(video.url);

          return (
            <VideoCard key={`${video.url}-${index}`} onPress={() => openVideo(video.url)}>
              {thumbnailUrl ? (
                <Thumbnail source={{ uri: thumbnailUrl }} resizeMode="cover" />
              ) : (
                <Thumbnail />
              )}
              <VideoInfo>
                <Title>{video.title}</Title>
                {video.description ? <Subtitle>{video.description}</Subtitle> : null}
                <VideoType>{type}</VideoType>
              </VideoInfo>
            </VideoCard>
          );
        })}
      </ScrollContainer>
    </Container>
  );
};

export default AnimeVideosScreen;
