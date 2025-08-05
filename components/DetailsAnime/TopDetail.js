// TopDetail.js
import { TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { Alert, View, StyleSheet, Modal } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import styled from 'styled-components/native';
import * as Clipboard from 'expo-clipboard';
import Markdown from 'react-native-markdown-display';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import AnilistBanner from '../BackgroundImg/AnilistBanner';
import KitsuBanner from '../BackgroundImg/KitsuBanner';
import GradientBlock from '../GradientBlock/GradientBlock';
import StatusDropdown from './StatusDropdown';
import LikeAnimeButton from './LikeAnimeButton';
import MoreButton from './MoreButton';
import EpisodesCounter from './EpisodesCounter';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Entypo from '@expo/vector-icons/Entypo';

import AnimatedModal from './AnimatedModalBottom';

const TopDetail = ({ anime }) => {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const fallbackImage = require('../../assets/image/image404.png');
  const [isInfoModalVisible, setInfoModalVisible] = useState(false);
  const [isStudiosModalVisible, setStudiosModalVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const [anilistBannerLoaded, setAnilistBannerLoaded] = useState(null);
  
  const [isImageViewerVisible, setImageViewerVisible] = useState(false);
  const [bannerUrls, setBannerUrls] = useState([]);

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Скопійовано', `"${text}" скопійовано в буфер обміну.`);
  };

  const studios = anime.companies?.filter(c => c.type === 'studio') || [];

  const lineHeight = 22;
  const maxLines = 5;
  const maxHeight = lineHeight * maxLines;

  const [expanded, setExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const [measuredHeight, setMeasuredHeight] = useState(0);

  const toggleExpanded = () => setExpanded(prev => !prev);

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

  const styles = StyleSheet.create({
    header: {
      flexDirection: 'row',
      gap: 10,
      position: 'absolute',
      top: 50,
      right: 12,
      zIndex: 1,
    },
    closeBtn: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.borderInput,
      borderRadius: 12,
      width: 45,
      height: 45,
    },
  });


  

  const imageUris = [anime.image, ...bannerUrls];
  const uniqueImageUris = [...new Set(imageUris.filter(Boolean))];
  const imagesToView = uniqueImageUris.map(uri => ({ url: uri }));


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
<BackgroundWrapper>
  <AnilistBanner
    mal_id={anime.mal_id}
    type="ANIME"
    onLoaded={(url) => {
      if (url) {
        setBannerUrls(prev => [...prev, url]);
      } else {
        setAnilistBannerLoaded(false);
      }
    }}
  />
  
  {anilistBannerLoaded === false && (
    <KitsuBanner
      slug={anime.slug}
      onLoaded={(url) => url && setBannerUrls(prev => [...prev, url])}
    />
  )}
  <GradientBlock />
</BackgroundWrapper>

      <Content>
        <Container>
                 <TouchableOpacity onPress={() => setImageViewerVisible(true)}>
   <Poster 
     source={{ uri: anime.image }} 
     resizeMode="cover"
     onError={() => console.log('Помилка завантаження зображення')}
     defaultSource={fallbackImage}
   />
 </TouchableOpacity>

        </Container>

        <Block>
          <TouchableOpacity onPress={() => setInfoModalVisible(true)}>
            <Row>
              <StyledIconInfo name="information-circle-sharp" />
              <Column>
                <Title>{anime.title_ua || anime.title_ja || 'Назва відсутня'}</Title>
                <Subtitle>{anime.title_en || anime.title_ja || 'English title missing'}</Subtitle>
              </Column>
            </Row>
          </TouchableOpacity>

          <ButtonsRow>
            <StatusDropdown slug={anime.slug} />

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
            <WatchButton onPress={() => console.log('Кнопка 2')}>
              <StyledPlay name="play" />
              <ButtonText>Дивитися</ButtonText>
            </WatchButton>

            <MoreButton slug={anime.slug}/>
          </ButtonsRow>

          <EpisodesCounter slug={anime.slug} episodes_total={anime.episodes_total}/>

          <InfoContent>
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
         onError={() => console.log('Помилка завантаження логотипу студії')}
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

        <Column>
          <MeasuredWrapper
            onLayout={e => {
              const height = e.nativeEvent.layout.height;
              setMeasuredHeight(height);
              setShowToggle(height > maxHeight);
            }}
          >
            <DescriptionWrapper expanded={expanded}>
              <Markdown
                style={{
                  body: {
                    color: theme.colors.gray,
                    fontSize: 16,
                    lineHeight,
                  },
                  link: {
                    color: theme.colors.primary,
                  },
                }}
              >
                {anime.synopsis_ua || anime.synopsis_en || 'Опис відсутній.'}
              </Markdown>
            </DescriptionWrapper>
          </MeasuredWrapper>

          {showToggle && (
            <ToggleButton onPress={toggleExpanded}>
              <ToggleText>{expanded ? 'Згорнути...' : 'Показати більше...'}</ToggleText>
            </ToggleButton>
          )}
        </Column>
        <LineGray />
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
                   onError={() => console.log('Помилка завантаження логотипу студії')}
                   defaultSource={fallbackImage}
                 />
                <StudioName>{studioItem.company.name}</StudioName>
              </InfoRow >
            </TouchableOpacity>
          ))}
        </Column>
      </AnimatedModal>

      <Modal
  visible={isImageViewerVisible}
  onRequestClose={() => setImageViewerVisible(false)}
  transparent={true}
>
     <View style={{ flex: 1, backgroundColor: theme.colors.transparentBackground }}>
     <View style={styles.header}>
       <TouchableOpacity
         onPress={() => setImageViewerVisible(false)}
         style={styles.closeBtn}
       >
         <Ionicons name="close" size={28} color={theme.colors.gray} />
       </TouchableOpacity>
     </View>

         <ImageViewer
       imageUrls={imagesToView}
       index={0}
       enableSwipeDown={true}
       onSwipeDown={() => setImageViewerVisible(false)}
       backgroundColor={theme.colors.transparentBackground}
       saveToLocalByLongPress={false}
       onImageLoadError={() => console.log('Помилка завантаження зображення в ImageViewer')}
       enableImageZoom={true}
       swipeDownThreshold={50}
     />
  </View>
</Modal>




    </GestureHandlerRootView>
  );
};

export default TopDetail;

// --- Styled Components ---

const Content = styled.View`
  position: relative;
  margin-top: 50px;
  padding: 0px 12px;
`;

const LineGray = styled.View`
  margin: 25px 0px;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
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

const StyledIconInfo = styled(Ionicons)`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 20px;
  margin-top: 4px;
`;

const InfoContent = styled.View`
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
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
  background-color: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.text};
`;

const MeasuredWrapper = styled.View`
  width: 100%;
`;

const DescriptionWrapper = styled.View`
  max-height: ${({ expanded }) => (expanded ? 'none' : '120px')};
  overflow: hidden;
`;

const ToggleButton = styled.TouchableOpacity`
  align-items: center;
  width: 100%;
  margin-left: 11px;
`;

const ToggleText = styled.Text`
  color: ${({ theme }) => theme.colors.placeholder};
  font-size: 14px;
  font-weight: bold;
`;

const ToggleButtonStudio = styled.TouchableOpacity``;
