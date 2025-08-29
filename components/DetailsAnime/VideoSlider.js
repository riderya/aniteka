import React, { useEffect } from 'react';
import { FlatList, Linking, Alert, Image, View } from 'react-native';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import RowLineHeader from './RowLineHeader';

// Стилі
const Container = styled.View`
  padding: 0px;
`;

const Spacer = styled.View`
  width: 12px;
`;

const Card = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.border};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.card};
  border-radius: 24px;
  width: 200px;
  height: 110px;
  justify-content: center;
  align-items: center;
`;

const CardTitle = styled.Text`
  color: #fff;
  font-size: 30px;
  font-weight: 300;
  margin-top: 8px;
  position: absolute;
`;

const MoreCard = styled(Card)`
  align-items: center;
  justify-content: center;
`;

const MoreText = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 16px;
  font-weight: 600;
`;

const ThumbnailWrapper = styled.View`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 24px;
  overflow: hidden;
`;

const Thumbnail = styled.Image`
  width: 100%;
  height: 100%;
`;

const Overlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #121212B3;
`;

// Функція для визначення типу відео
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

  return null;
};

// Функція для витягування YouTube ID із посилання
const getYouTubeVideoId = (url) => {
  // Підтримує формати: https://youtu.be/ID, https://www.youtube.com/watch?v=ID
  const regex =
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const VideoSlider = ({ anime, onVisibilityChange }) => {
  const navigation = useNavigation();
  const videos = anime?.videos || [];

  const seenTypes = new Set();
  const filteredVideos = [];

  for (const video of videos) {
    const type = getVideoType(video);
    if (type && !seenTypes.has(type)) {
      filteredVideos.push({ ...video, displayType: type });
      seenTypes.add(type);
    }
    if (seenTypes.size >= 3) break;
  }

  if (videos.length > 0) {
    filteredVideos.push({
      isMoreButton: true,
      key: 'more',
    });
  }

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

  useEffect(() => {
    onVisibilityChange?.(filteredVideos.length > 0);
  }, [filteredVideos.length, onVisibilityChange]);

  if (filteredVideos.length === 0) {
    return null;
  }

  return (
    <Container>
      <RowLineHeader
        title="Відео"
        onPress={() => navigation.navigate('AnimeVideosScreen', { anime })}
      />

<FlatList
  data={filteredVideos}
  keyExtractor={(item, index) => item.key || `${item.url}-${index}`}
  horizontal
  ListHeaderComponent={<Spacer />}
  ListFooterComponent={<Spacer />}
  showsHorizontalScrollIndicator={false}
  ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
  renderItem={({ item }) =>
    item.isMoreButton ? (
      <MoreCard onPress={() => navigation.navigate('AnimeVideosScreen', { anime })}>
        <MoreText>Більше...</MoreText>
      </MoreCard>
    ) : (
      <Card
        onPress={() => {
          if (item.displayType === 'PV' || item.displayType === 'OP' || item.displayType === 'ED') {
            navigation.navigate('AnimeVideosScreen', {
              anime,
              filter: item.displayType,
            });
          } else {
            openVideo(item.url);
          }
        }}
      >
        {(() => {
          const videoId = getYouTubeVideoId(item.url);
          if (videoId) {
            return (
              <ThumbnailWrapper>
                <Thumbnail
                  source={{ uri: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` }}
                  resizeMode="cover"
                />
                <Overlay />
              </ThumbnailWrapper>
            );
          }
          return null;
        })()}
        <CardTitle>{item.displayType}</CardTitle>
      </Card>
    )
  }
/>
    </Container>
  );
};

export default VideoSlider;