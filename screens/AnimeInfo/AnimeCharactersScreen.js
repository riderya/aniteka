import { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  Share,
} from 'react-native';
import styled from 'styled-components/native';
import axios from 'axios';
import HeaderTitleBar from '../../components/Header/HeaderTitleBar';
import { useTheme } from '../../context/ThemeContext';
import { useRoute } from '@react-navigation/native';
import { PlatformBlurView } from '../../components/Custom/PlatformBlurView';
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

const BlurOverlay = styled(PlatformBlurView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  border-bottom-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

const LoadingFooter = styled.View`
  padding: 25px;
  align-items: center;
  justify-content: center;
  min-height: 80px;
`;

const LoadingText = styled(Text)`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 10px;
  font-size: 14px;
`;

const EndMessage = styled(Text)`
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  padding: 15px;
  font-size: 14px;
  font-weight: 500;
`;

const EmptyMessage = styled(Text)`
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  padding: 20px;
  font-size: 16px;
  font-weight: 500;
`;

const AnimeCharactersScreen = () => {
  const route = useRoute();
  const { slug, title } = route.params;

  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  
  const CHARACTERS_PER_PAGE = 20;

  const headerHeight = insets.top + 56 + 20;

  const handleShare = useCallback(async () => {
    try {
      const shareUrl = `https://hikka.io/anime/${slug}/characters`;
      await Share.share({
        message: `Дивіться всіх персонажів аніме "${title}" на Hikka: ${shareUrl}`,
        url: shareUrl,
        title: `Персонажі аніме: ${title}`,
      });
    } catch (error) {
      console.log('Помилка при поділі:', error);
    }
  }, [slug, title]);

  const fetchCharacters = useCallback(async (page = 1, isLoadMore = false) => {
    try {
      
      const { data } = await axios.get(
        `https://api.hikka.io/anime/${slug}/characters?page=${page}&size=${CHARACTERS_PER_PAGE}`
      );
      
      if (isLoadMore) {
        // Фільтруємо дублікати за slug
        setCharacters(prev => {
          const existingSlugs = new Set(prev.map(char => char.character.slug));
          const newCharacters = data.list.filter(char => !existingSlugs.has(char.character.slug));
          return [...prev, ...newCharacters];
        });
      } else {
        setCharacters(data.list);
      }
      
      // Перевіряємо, чи є ще дані для завантаження
      setHasMoreData(data.list.length === CHARACTERS_PER_PAGE);
      setCurrentPage(page);
    } catch (error) {
      
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [slug, CHARACTERS_PER_PAGE]);

  useEffect(() => {
    fetchCharacters(1, false);
  }, [fetchCharacters]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMoreData) {
      setLoadingMore(true); // Встановлюємо лоадер одразу
      fetchCharacters(currentPage + 1, true);
    }
  }, [loadingMore, hasMoreData, currentPage, fetchCharacters]);

  // Функція для створення масиву з лоадером або повідомленням про завершення
  const getDataWithLoader = useCallback(() => {
    if (hasMoreData && characters.length > 0) {
      return [...characters, { isLoader: true, character: { slug: 'loader' } }];
    } else if (!hasMoreData && characters.length > 0) {
      return [...characters, { isEndMessage: true, character: { slug: 'end-message' } }];
    }
    return characters;
  }, [characters, hasMoreData]);

  const renderFooter = useCallback(() => {
    if (!hasMoreData && characters.length > 0) {
      return (
        <EndMessage theme={theme}>
          Всі персонажі завантажені
        </EndMessage>
      );
    }
    
    return null;
  }, [hasMoreData, characters.length, theme]);

  // Видаляємо лоадер при переході на екран
  // if (loading) {
  //   return (
  //     <CenteredContainer>
  //       <ActivityIndicator size="large" color={theme.colors.primary} />
  //     </CenteredContainer>
  //   );
  // }

  return (
    <Container>
      <BlurOverlay intensity={100} tint={isDark ? 'dark' : 'light'}>
        <HeaderTitleBar 
          title={`Всі персонажі: ${title}`} 
          onShare={handleShare}
        />
      </BlurOverlay>

      <FlatList
        data={getDataWithLoader()}
        keyExtractor={(item, index) => item.isLoader ? 'loader' : item.isEndMessage ? 'end-message' : `character-${item.character.slug}-${index}`}
        contentContainerStyle={{
          paddingTop: headerHeight,
          paddingBottom: 20 + insets.bottom,
          flexGrow: 1, // Дозволяє контенту розтягуватися
          paddingHorizontal: 12,
        }}
        renderItem={({ item }) => {
          if (item.isLoader) {
            return (
              <LoadingFooter>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <LoadingText theme={theme}>
                  Завантаження персонажів...
                </LoadingText>
              </LoadingFooter>
            );
          }
          if (item.isEndMessage) {
            return (
              <LoadingFooter>
                <LoadingText theme={theme}>
                  Всі персонажі завантажені
                </LoadingText>
              </LoadingFooter>
            );
          }
          return (
            <CharacterCardItem 
            character={item.character}
            imageWidth={90}
            imageHeight={120}
            nameFontSize={16}
            altNameFontSize={13}
            imageBorderRadius={24}
            />
          );
        }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={() => (
          <CenteredContainer style={{ flex: 1, paddingTop: headerHeight }}>
            {loading ? (
              <ActivityIndicator size="large" color={theme.colors.primary} />
            ) : (
              <EmptyMessage theme={theme}>
                Персонажі не знайдені
              </EmptyMessage>
            )}
          </CenteredContainer>
        )}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        getItemLayout={(data, index) => ({
          length: 120, // Приблизна висота CharacterCardItem
          offset: 120 * index,
          index,
        })}
      />
    </Container>
  );
};

export default AnimeCharactersScreen;
