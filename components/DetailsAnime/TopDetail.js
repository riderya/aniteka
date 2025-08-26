// TopDetail.js
import { TouchableOpacity } from 'react-native';
import React, { useState, useRef } from 'react';
import { Alert, View, StyleSheet, Modal, Text } from 'react-native';
import ImageViewing from 'react-native-image-viewing';
import styled from 'styled-components/native';
import * as Clipboard from 'expo-clipboard';
import Markdown from '../Custom/MarkdownText';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import AnilistBanner from '../BackgroundImg/AnilistBanner';
import KitsuBanner from '../BackgroundImg/KitsuBanner';
import TMDBBanner from '../BackgroundImg/TMDBBanner';
import GradientBlock from '../GradientBlock/GradientBlock';
import StatusDropdown from './StatusDropdown';
import LikeAnimeButton from './LikeAnimeButton';
import MoreButton from './MoreButton';
import EpisodesCounter from './EpisodesCounter';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import AnimatedModal from './AnimatedModalBottom';

const TopDetail = ({ anime }) => {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const { top: safeAreaTop } = useSafeAreaInsets();
  const fallbackImage = require('../../assets/image/image404.png');
  const [isInfoModalVisible, setInfoModalVisible] = useState(false);
  const [isStudiosModalVisible, setStudiosModalVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const [tmdbBannerLoaded, setTmdbBannerLoaded] = useState(null);
  const [anilistBannerLoaded, setAnilistBannerLoaded] = useState(null);
  const [kitsuBannerLoaded, setKitsuBannerLoaded] = useState(null);
  
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState([]);
  const [bannerUrls, setBannerUrls] = useState([]);
  const previousImagesRef = useRef([]);

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Скопійовано', `"${text}" скопійовано в буфер обміну.`);
  };

  const studios = anime.companies?.filter(c => c.type === 'studio') || [];

  const maxLines = 5;

  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => setExpanded(prev => !prev);

  // Перевіряємо, чи текст довший за 5 рядків
  const description = anime.synopsis_ua || anime.synopsis_en || 'Опис відсутній.';
  // Приблизна оцінка: 5 рядків * ~40 символів на рядок = ~200 символів
  const shouldShowToggle = description.length > 200 && !expanded;

  const media_Type = {
    tv: 'ТБ-серіал',
    movie: 'Фільм',
    ova: 'OVA',
    ona: 'ONA',
    special: 'Спешл',
    music: 'Музичне',
  };

  const status = {
    announced: 'Анонс',
    finished: 'Завершено',
    ongoing: 'Онґоінґ',
    paused: 'Припинено',
    discontinued: 'Зупинено',
  };

  const rating = {
    r_plus: 'R PLUS',
    pg_13: 'PG-13',
    pg: 'PG',
    rx: 'RX',
    g: 'G',
    r: 'R',
  };

  const season = {
    winter: 'Зима',
    spring: 'Весна',
    summer: 'Літо',
    fall: 'Осінь',
  };




  

  // Оновлюємо галерею зображень при зміні bannerUrls та студій
  React.useEffect(() => {
    const studioImages = studios.map(studio => studio.company.image).filter(Boolean);
    const imageUris = [anime.image, ...bannerUrls, ...studioImages];
    const uniqueImageUris = [...new Set(imageUris.filter(Boolean))];
    const images = uniqueImageUris.map(uri => ({ uri }));
    
    // Перевіряємо, чи дійсно змінилися зображення перед оновленням
    const currentImagesString = JSON.stringify(images.map(img => img.uri).sort());
    const previousImagesString = JSON.stringify(previousImagesRef.current.map(img => img.uri).sort());
    
    if (currentImagesString !== previousImagesString) {
      setGalleryImages(images);
      previousImagesRef.current = images;
    }
  }, [anime.image, bannerUrls, studios]);


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
<BackgroundWrapper>
  <TouchableOpacity 
    onPress={() => {
      if (bannerUrls.length > 0) {
        setGalleryIndex(1); // Починаємо з першого банеру
        setGalleryVisible(true);
      }
    }}
    activeOpacity={0.9}
  >
    <TMDBBanner
      tmdbId={anime.tmdb_id}
      title={anime.title_en || anime.title_ua || anime.title_ja}
      mediaType={anime.media_type === 'tv' ? 'tv' : 'movie'}
      onLoaded={(url) => {
        if (url) {
          setBannerUrls(prev => {
            // Перевіряємо, чи URL вже не додано
            if (!prev.includes(url)) {
              return [...prev, url];
            }
            return prev;
          });
        } else {
          setTmdbBannerLoaded(false);
        }
      }}
    />
    
    {tmdbBannerLoaded === false && (
      <AnilistBanner
        mal_id={anime.mal_id}
        type="ANIME"
        onLoaded={(url) => {
          if (url) {
            setBannerUrls(prev => {
              // Перевіряємо, чи URL вже не додано
              if (!prev.includes(url)) {
                return [...prev, url];
              }
              return prev;
            });
          } else {
            setAnilistBannerLoaded(false);
          }
        }}
      />
    )}
    
    {tmdbBannerLoaded === false && anilistBannerLoaded === false && (
      <KitsuBanner
        slug={anime.slug}
        onLoaded={(url) => {
          if (url) {
            setBannerUrls(prev => {
              // Перевіряємо, чи URL вже не додано
              if (!prev.includes(url)) {
                return [...prev, url];
              }
              return prev;
            });
          }
        }}
      />
    )}
  </TouchableOpacity>
  <GradientBlock />
</BackgroundWrapper>

      <Content style={{ paddingTop: safeAreaTop + 12 }}>
        <Container>
                 <TouchableOpacity onPress={() => {
                   setGalleryIndex(0);
                   setGalleryVisible(true);
                 }}>
   <Poster 
     source={{ uri: anime.image }} 
     resizeMode="cover"
                     onError={() => {}}
     defaultSource={fallbackImage}
   />
 </TouchableOpacity>

        </Container>

        <Block>
          <TouchableOpacity onPress={() => setInfoModalVisible(true)}>
            <Row>
              <StyledIconInfo name="information-outline" />
              <Column>
                <Title>{anime.title_ua || anime.title_ja || 'Назва відсутня'}</Title>
                <Subtitle>{anime.title_en || anime.title_ja || 'English title missing'}</Subtitle>
              </Column>
            </Row>
          </TouchableOpacity>

          <ButtonsRow>
            <StatusDropdown slug={anime.slug} episodes_total={anime.episodes_total} />

            <LikeAnimeButton slug={anime.slug} />

            <TouchableOpacityStyled
              onPress={() =>
                navigation.navigate('AnimeCommentsDetailsScreen', {
                  slug: anime.slug,
                  title: anime.title_ua || anime.title_en || anime.title_ja || '?',
                  commentsCount: anime.comments_count,
                })
              }
            >
              <StyledIconSaveComment name="chatbubble-outline" size={20} color="#fff" />
              <ButtonTextSaveComment>{anime.comments_count}</ButtonTextSaveComment>
            </TouchableOpacityStyled>
          </ButtonsRow>

          <ButtonsRow>
            <WatchButton onPress={() => {}}>
              <StyledPlay name="play" />
              <ButtonText>Дивитися</ButtonText>
            </WatchButton>

            <MoreButton slug={anime.slug}/>
          </ButtonsRow>

          <EpisodesCounter slug={anime.slug} episodes_total={anime.episodes_total}/>

          <InfoContent>
            <InfoTitle>Інформація</InfoTitle>
            <Score>{`${anime.score}`}<StyledStar name="star" /></Score>
            <InfoRow>
              <InfoBold>Тип:</InfoBold>
              <InfoText>{media_Type[anime.media_type]}</InfoText>
            </InfoRow>
            <InfoRow>
              <InfoBold>Статус:</InfoBold>
              <InfoText>{status[anime.status]}</InfoText>
            </InfoRow>
            <InfoRow>
              <InfoBold>Серій:</InfoBold>
              <InfoText>{anime.episodes_released}/{anime.episodes_total}</InfoText>
            </InfoRow>
            <InfoRow>
              <InfoBold>Тривалість епізоду:</InfoBold>
              <InfoText>{anime.duration} хв.</InfoText>
            </InfoRow>
            <InfoRow>
              <InfoBold>Рейтинг:</InfoBold>
              <InfoText>{rating[anime.rating]}</InfoText>
            </InfoRow>
            <InfoRow>
              <InfoBold>Рік:</InfoBold>
              <InfoText>{`${anime.year}`}</InfoText>
            </InfoRow>
            <InfoRow>
              <InfoBold>Сезон:</InfoBold>
              <InfoText>{season[anime.season]}</InfoText>
            </InfoRow>
            {studios.length > 0 && (
  <InfoRow>
    <InfoBold>Студія:</InfoBold>

    <TouchableOpacity
      onPress={() =>
        navigation.navigate('CompanyDetailScreen', {
          slug: studios[0].company.slug,
        })
      }
      style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}
    >
      <StudioLogo
        source={
          studios[0].company.image
            ? { uri: studios[0].company.image }
            : fallbackImage
        }
        onError={() => {}}
        defaultSource={fallbackImage}
      />
      {/* <StudioName>{studios[0].company.name}</StudioName> */}
    </TouchableOpacity>

    {studios.length > 1 && (
      <ToggleButtonStudio onPress={() => setStudiosModalVisible(true)}>
        <ToggleText>Показати більше...</ToggleText>
      </ToggleButtonStudio>
    )}
  </InfoRow>
)}

<InfoRow>
  <InfoBold>Жанри:</InfoBold>
  {anime.genres.map((genre) => (
    <TouchableOpacity
      key={genre.slug}
      onPress={() =>
        navigation.navigate('AnimeFilterScreen', {
          initialGenre: genre.slug,
        })
      }
    >
      <GenreName>{genre.name_ua}</GenreName>
    </TouchableOpacity>
  ))}
</InfoRow>


          </InfoContent>
        </Block>

        <DescriptionContainer>
          <DescriptionTitle>Опис</DescriptionTitle>
          <DescriptionWrapper>
            <Markdown
              style={{
                body: {
                  color: theme.colors.text,
                  fontSize: 16,
                  lineHeight: 22,
                },
                link: {
                  color: theme.colors.primary,
                },
              }}
              numberOfLines={expanded ? undefined : maxLines}
              ellipsizeMode="tail"
            >
              {anime.synopsis_ua || anime.synopsis_en || 'Опис відсутній.'}
            </Markdown>
          </DescriptionWrapper>

          {(shouldShowToggle || expanded) && (
            <ToggleButton onPress={toggleExpanded}>
              <ToggleText>{expanded ? 'Сховати' : 'Показати більше...'}</ToggleText>
            </ToggleButton>
          )}
        </DescriptionContainer>
      </Content>

      {/* Модалка інформації */}
      <AnimatedModal visible={isInfoModalVisible} onClose={() => setInfoModalVisible(false)} title="Інформація про аніме">
        <SheetColumn>
          <SheetLabel>Назва 🇺🇦</SheetLabel>
          <TouchableOpacity onPress={() => copyToClipboard(anime.title_ua ?? 'Немає')}>
            <SheetText>{anime.title_ua ?? 'Немає'} <StyledIcon name="copy" /></SheetText>
          </TouchableOpacity>
        </SheetColumn>

        <SheetColumn>
          <SheetLabel>Англійська назва 🇬🇧</SheetLabel>
          <TouchableOpacity onPress={() => copyToClipboard(anime.title_en ?? 'Немає')}>
            <SheetText>{anime.title_en ?? 'Немає'} <StyledIcon name="copy" /></SheetText>
          </TouchableOpacity>
        </SheetColumn>

        <SheetColumn>
          <SheetLabel>Оригінальна 🇯🇵</SheetLabel>
          <TouchableOpacity onPress={() => copyToClipboard(anime.title_ja ?? 'Немає')}>
            <SheetText>{anime.title_ja ?? 'Немає'} <StyledIcon name="copy" /></SheetText>
          </TouchableOpacity>
        </SheetColumn>

        <SheetColumn>
          <SheetLabel>Альтернативні назви</SheetLabel>
          {Array.isArray(anime.synonyms) && anime.synonyms.length > 0 ? (
            anime.synonyms.map((syn, i) => (
              <TouchableOpacity key={i} onPress={() => copyToClipboard(syn)}>
                <SheetText>{syn} <StyledIcon name="copy" /></SheetText>
              </TouchableOpacity>
            ))
          ) : (
            <SheetText>Немає</SheetText>
          )}
        </SheetColumn>
      </AnimatedModal>

      {/* Модалка студій */}
      <AnimatedModal visible={isStudiosModalVisible} onClose={() => setStudiosModalVisible(false)} title="Студії">
        <Column style={{ gap: 16 }}>
          {studios.map((studioItem, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                const slug = studioItem.company.slug;
                if (slug) {
                  setStudiosModalVisible(false);
                  navigation.navigate('CompanyDetailScreen', { slug });
                }
              }}
            >
              <InfoRow style={{ gap: 12 }}>
                <StudioLogo
                  source={
                    studioItem.company.image
                      ? { uri: studioItem.company.image }
                      : fallbackImage
                  }
                  onError={() => {}}
                  defaultSource={fallbackImage}
                />
                <StudioName>{studioItem.company.name}</StudioName>
              </InfoRow >
            </TouchableOpacity>
          ))}
        </Column>
      </AnimatedModal>

      <ImageViewing
        images={galleryImages}
        imageIndex={galleryIndex}
        visible={galleryVisible}
        onRequestClose={() => setGalleryVisible(false)}
        presentationStyle="overFullScreen"
      />




    </GestureHandlerRootView>
  );
};

export default TopDetail;

// --- Styled Components ---

const Content = styled.View`
  position: relative;
  padding: 0px 12px;
`;

const BackgroundWrapper = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: -1;
`;

const Container = styled.View`
  align-items: center;
`;

const Poster = styled.Image`
  width: 230px;
  height: 320px;
  border-radius: 32px;
`;

const ButtonsRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  margin-top: 15px;
`;

const WatchButton = styled.TouchableOpacity`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.primary};
  padding: 10px;
  border-radius: 999px;
  flex-direction: row;
  height: 50px;
  gap: 8px;
  align-items: center;
  justify-content: center;
`;

const StyledPlay = styled(FontAwesome6)`
  color: ${({ theme }) => theme.colors.background};
  font-weight: 600;
  font-size: 18px;
`;

const ButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.background};
  font-weight: bold;
  font-size: 16px;
`;

const TouchableOpacityStyled = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  height: 45px;
  padding: 0px 16px;
  border-radius: 999px;
  gap: 8px;
`;

const ButtonTextSaveComment = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-weight: bold;
  font-size: 14px;
`;

const StyledIconSaveComment = styled(Ionicons)`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 20px;
`;

const Block = styled.View``;

const Row = styled.View`
  flex-direction: row;
  gap: 8px;
  margin-top: 15px;
`;

const Column = styled.View`
  flex-direction: column;
  gap: 8px;
  width: 94%;
`;

const Title = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

const Subtitle = styled.Text`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.gray};
  margin-top: -4px;
`;

const SheetColumn = styled.View`
  flex-direction: column;
  margin-bottom: 10px;
`;

const SheetLabel = styled.Text`
  font-weight: 600;
  font-size: 18px;
  margin-bottom: 4px;
  color: ${({ theme }) => theme.colors.text};
`;

const SheetText = styled.Text`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 4px;
`;

const StyledIcon = styled(Ionicons)`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 14px;
`;

const StyledIconInfo = styled(MaterialCommunityIcons)`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 20px;
  margin-top: 6px;
`;

const InfoTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 12px;
`;

const InfoContent = styled.View`
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 16px;
  margin-top: 15px;
`;

const Score = styled.Text`
  position: absolute;
  top: 12px;
  right: 12px;
  font-weight: bold;
  font-size: 28px;
  color: ${({ theme }) => theme.colors.text};
`;

const StyledStar = styled(AntDesign)`
  color: ${({ theme }) => theme.colors.text};
  font-size: 28px;
`;

const InfoRow = styled.View`
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
`;

const InfoText = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
`;

const InfoBold = styled.Text`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.gray};
`;

const StudioName = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
`;

const StudioLogo = styled.Image`
  width: 45px;
  height: 45px;
  border-radius: 10px;
`;

const GenreName = styled.Text`
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
`;

const DescriptionContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 12px;
  margin-top: 15px;
`;

const DescriptionTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 12px;
`;

const DescriptionWrapper = styled.View``;

const ToggleButton = styled.TouchableOpacity`
  align-items: center;
  width: 100%;
  margin-top: 8px;
`;

const ToggleText = styled.Text`
  color: ${({ theme }) => theme.colors.placeholder};
  font-size: 14px;
  font-weight: bold;
`;

const ToggleButtonStudio = styled.TouchableOpacity``;
