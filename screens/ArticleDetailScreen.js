import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Image, Linking, Pressable, FlatList, Platform } from 'react-native';
import axios from 'axios';
import styled from 'styled-components/native';
import YoutubePlayer from "react-native-youtube-iframe";
import ImageViewing from 'react-native-image-viewing';
import HeaderTitleBar from '../components/Header/HeaderTitleBar';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Entypo from '@expo/vector-icons/Entypo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { BlurView } from 'expo-blur';
import { formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale';
import MarkdownText from '../components/Custom/MarkdownText';

const CATEGORY_TRANSLATIONS = {
  news: 'Новини',
  reviews: 'Огляди',
  original: 'Авторське',
};

// Debounce функція для оптимізації
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Мемоізований компонент для оптимізованого зображення
const OptimizedImage = React.memo(({ source, style, resizeMode = "cover", onPress }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleLoadStart = useCallback(() => {
    setImageLoading(true);
  }, []);

  const handleLoadEnd = useCallback(() => {
    setImageLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setImageError(true);
    setImageLoading(false);
  }, []);

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    }
  }, [onPress]);

  if (imageError) {
    return (
      <View style={[style, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#999', fontSize: 12 }}>Помилка завантаження</Text>
      </View>
    );
  }

  const ImageComponent = onPress ? Pressable : View;
  const imageProps = onPress ? { onPress: handlePress } : {};

  return (
    <ImageComponent {...imageProps}>
      <Image
        source={source}
        style={style}
        resizeMode={resizeMode}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        fadeDuration={300}
      />
      {imageLoading && (
        <View style={[style, { position: 'absolute', backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="small" color="#999" />
        </View>
      )}
    </ImageComponent>
  );
});

// Мемоізований компонент для YouTube відео
const OptimizedYoutubePlayer = React.memo(({ videoId, height = 210 }) => {
  const [isReady, setIsReady] = useState(false);

  const handleReady = useCallback(() => {
    setIsReady(true);
  }, []);

  if (!videoId) return null;

  return (
    <View style={{ marginVertical: 10, height }}>
      {!isReady && (
        <View style={{ 
          height, 
          backgroundColor: '#f0f0f0', 
          justifyContent: 'center', 
          alignItems: 'center',
          borderRadius: 8 
        }}>
          <ActivityIndicator size="large" color="#999" />
        </View>
      )}
      <YoutubePlayer 
        height={height} 
        play={false} 
        videoId={videoId}
        onReady={handleReady}
        initialPlayerParams={{
          preventFullScreen: false,
          cc_lang_pref: "us",
          showClosedCaptions: true
        }}
      />
    </View>
  );
});

// Мемоізований компонент для спойлера
const SpoilerWrapper = React.memo(({ children, theme }) => {
  const [visible, setVisible] = useState(false);
  
  const toggleSpoiler = useCallback(() => {
    setVisible(prev => !prev);
  }, []);
  
  const buttonStyle = useMemo(() => ({
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4,
    padding: 2
  }), []);
  
  return (
    <SpoilerContainer>
      <Pressable style={buttonStyle} onPress={toggleSpoiler}>
        <SpoilerButtonText style={{ color: theme.colors.primary }}>
          {visible ? 'Сховати спойлер' : 'Показати спойлер'}
        </SpoilerButtonText>
        <Entypo 
          name={visible ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={theme.colors.gray} 
        />
      </Pressable>
      {visible && (
        <SpoilerContent>
          {Array.isArray(children) ? 
            children.map((child, index) => {
              if (child.type === 'p') {
                return (
                  <View key={`spoiler-${index}`} style={{ marginBottom: 12 }}>
                    <RenderChildren children={child.children} theme={theme} />
                  </View>
                );
              }
              if (child.type === 'ul') {
                return (
                  <List key={`spoiler-${index}`}>
                    {child.children.map((li, liIndex) => (
                      <View key={liIndex} style={{ paddingLeft: 12, marginBottom: 6, flexDirection: 'row' }}>
                        <Text style={{ color: theme.colors.text, fontSize: 16, marginRight: 8 }}>•</Text>
                        <View style={{ flex: 1 }}>
                          <RenderChildren children={li.children[0].children} theme={theme} customStyle={{ color: theme.colors.text, fontSize: 16 }} />
                        </View>
                      </View>
                    ))}
                  </List>
                );
              }
              if (child.type === 'h1' || child.type === 'h2' || child.type === 'h3' || child.type === 'h4' || child.type === 'h5' || child.type === 'h6') {
                const fontSize = {
                  h1: 28, h2: 24, h3: 22, h4: 20, h5: 18, h6: 16
                }[child.type];
                const marginTop = {
                  h1: 24, h2: 22, h3: 20, h4: 18, h5: 16, h6: 14
                }[child.type];
                const marginBottom = {
                  h1: 12, h2: 11, h3: 10, h4: 9, h5: 8, h6: 7
                }[child.type];
                
                return (
                  <View key={`spoiler-${index}`} style={{ marginTop, marginBottom }}>
                    <MarkdownText style={{ body: { color: theme.colors.text, fontSize, fontWeight: 'bold' } }}>
                      <RenderChildren children={child.children} theme={theme} />
                    </MarkdownText>
                  </View>
                );
              }
              return <RenderBlock key={`spoiler-${index}`} block={child} index={`spoiler-${index}`} theme={theme} />;
            }) 
            : 
            <Text style={{ color: theme.colors.text }}>Немає вмісту</Text>
          }
        </SpoilerContent>
      )}
    </SpoilerContainer>
  );
});

// Мемоізований компонент для рендерингу дітей
const RenderChildren = React.memo(({ children, theme, customStyle = {} }) => {
  // Мемоізуємо стилі для звичайного тексту
  const textStyle = useMemo(() => ({
    body: {
      color: customStyle.color || theme.colors.text,
      fontSize: customStyle.fontSize || 16,
      fontWeight: 'normal',
    }
  }), [theme.colors.text, customStyle.color, customStyle.fontSize]);

  // Мемоізуємо стилі для посилань
  const linkStyle = useMemo(() => ({
    body: {
      color: theme.colors.primary,
      fontSize: customStyle.fontSize || 16,
      fontWeight: 'normal',
    },
    link: {
      color: theme.colors.primary,
      textDecorationLine: 'underline',
    }
  }), [theme.colors.primary, customStyle.fontSize]);

  const renderChild = useCallback((child, index) => {
    if (!child) return null;
    
    if (typeof child.text === 'string') {
      const cleanText = child.text
        .replace(/\s+/g, ' ')
        .replace(/^\s+|\s+$/g, '');

      const finalStyle = {
        ...textStyle,
        body: {
          ...textStyle.body,
          fontWeight: child.bold ? 'bold' : 'normal',
        }
      };

      return (
        <MarkdownText key={index} style={finalStyle}>
          {cleanText}
        </MarkdownText>
      );
    }

    if (child.type === 'a') {
      const finalLinkStyle = {
        ...linkStyle,
        body: {
          ...linkStyle.body,
          fontWeight: child.bold ? 'bold' : 'normal',
        }
      };

      return (
        <MarkdownText key={index} style={finalLinkStyle}>
          {child.children?.[0]?.text || ''}
        </MarkdownText>
      );
    }

    return null;
  }, [textStyle, linkStyle]);

  if (!children || !Array.isArray(children)) return null;
  return children.map(renderChild);
});

// Мемоізований компонент для рендерингу блоків
const RenderBlock = React.memo(({ block, index, theme, onImagePress }) => {
  // Мемоізуємо стилі для заголовків
  const headingStyles = useMemo(() => ({
    h1: { marginTop: 24, marginBottom: 12, fontSize: 28 },
    h2: { marginTop: 22, marginBottom: 11, fontSize: 24 },
    h3: { marginTop: 20, marginBottom: 10, fontSize: 22 },
    h4: { marginTop: 18, marginBottom: 9, fontSize: 20 },
    h5: { marginTop: 16, marginBottom: 8, fontSize: 18 },
    h6: { marginTop: 14, marginBottom: 7, fontSize: 16 },
  }), []);

  // Мемоізуємо функцію для отримання YouTube ID
  const getVideoId = useCallback((url) => {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
    return match?.[1] || null;
  }, []);

  const renderBlockContent = useCallback(() => {
    if (!block) return null;
    
    if (!block.type && Array.isArray(block.children)) {
      return block.children.map((child, childIndex) => (
        <RenderBlock key={`${index}-${childIndex}`} block={child} index={`${index}-${childIndex}`} theme={theme} onImagePress={onImagePress} />
      ));
    }

    switch (block.type) {
      case 'p':
        return (
          <View style={{ marginBottom: 12 }}>
            <RenderChildren children={block.children} theme={theme} />
          </View>
        );
      case 'ul':
        return (
          <List>
            {block.children.map((li, liIndex) => (
              <View key={liIndex} style={{ paddingLeft: 12, marginBottom: 6, flexDirection: 'row' }}>
                <Text style={{ color: theme.colors.text, fontSize: 16, marginRight: 8 }}>•</Text>
                <View style={{ flex: 1 }}>
                  <RenderChildren children={li.children[0].children} theme={theme} customStyle={{ color: theme.colors.text, fontSize: 16 }} />
                </View>
              </View>
            ))}
          </List>
        );
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        const style = headingStyles[block.type];
        return (
          <View style={{ marginTop: style.marginTop, marginBottom: style.marginBottom }}>
            <MarkdownText style={{ body: { color: theme.colors.text, fontSize: style.fontSize, fontWeight: 'bold' } }}>
              <RenderChildren children={block.children} theme={theme} />
            </MarkdownText>
          </View>
        );
      case 'blockquote':
        return (
          <Blockquote>
            {block.children?.map((child, childIndex) => (
              <View key={childIndex}>
                {child.text ? (
                  <MarkdownText style={{ body: { color: theme.colors.gray, fontSize: 16, fontStyle: 'italic' } }}>
                    {child.text.replace(/\s+/g, ' ').trim()}
                  </MarkdownText>
                ) : (
                  <RenderChildren children={child.children} theme={theme} customStyle={{ color: theme.colors.gray, fontSize: 16 }} />
                )}
              </View>
            ))}
          </Blockquote>
        );
      case 'preview':
        return block.children?.map((child, childIndex) => (
          <RenderBlock key={`${index}-${childIndex}`} block={child} index={`${index}-${childIndex}`} theme={theme} onImagePress={onImagePress} />
        ));
      case 'image':
        return (
          <OptimizedImage
            source={{ uri: block.url }}
            style={{ width: '100%', height: 220, borderRadius: 10, marginBottom: 16 }}
            resizeMode="cover"
          />
        );
      case 'image_group':
        const images = block.children || [];
        if (images.length === 1) {
          return (
            <OptimizedImage
              source={{ uri: images[0].url }}
              style={{ width: '100%', height: 220, borderRadius: 10, marginBottom: 16 }}
              resizeMode="cover"
              onPress={() => onImagePress(images[0].url)}
            />
          );
        }
        return (
          <ImageRow>
            {images.map((img, imgIndex) => (
              <OptimizedImage
                key={imgIndex}
                source={{ uri: img.url }}
                style={{ width: '48.5%', height: 180, borderRadius: 8, marginBottom: 10 }}
                resizeMode="cover"
                onPress={() => onImagePress(img.url)}
              />
            ))}
          </ImageRow>
        );
      case 'video':
        const videoId = getVideoId(block.url);
        return <OptimizedYoutubePlayer videoId={videoId} />;
      case 'spoiler':
        return <SpoilerWrapper children={block.children} theme={theme} />;
      default:
        break;
    }

    if (block.children && Array.isArray(block.children)) {
      return block.children.map((child, childIndex) => (
        <RenderBlock key={`${index}-${childIndex}`} block={child} index={`${index}-${childIndex}`} theme={theme} onImagePress={onImagePress} />
      ));
    }

    return null;
  }, [block, index, theme, onImagePress, headingStyles, getVideoId]);

  return renderBlockContent();
});

// Мемоізований компонент для автора
const AuthorInfo = React.memo(({ article, theme, navigation, categoryTranslations }) => {
  const handleAuthorPress = useCallback(() => {
    if (article?.author?.username) {
      navigation.navigate('UserProfileScreen', { username: article.author.username });
    }
  }, [navigation, article?.author?.username]);

  const formattedDate = useMemo(() => {
    if (!article?.created) return '';
    return formatDistanceToNow(new Date(article.created * 1000), {
      addSuffix: true,
      locale: uk,
    });
  }, [article?.created]);

  if (!article?.author) return null;

  return (
    <AuthorContainer onPress={handleAuthorPress} activeOpacity={0.7}>
      <Avatar source={{ uri: article.author.avatar }} />
      <View>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4, color: theme.colors.text }}>
          {article.author.username}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: '#888', fontSize: 12 }}>
            {categoryTranslations[article.category] || 'Категорія'}
          </Text>
          <FontAwesome
            name="circle"
            size={4}
            color={theme.colors.gray}
            style={{ marginHorizontal: 6 }}
          />
          <Text style={{ color: '#888', fontSize: 12 }}>
            {formattedDate}
          </Text>
        </View>
      </View>
    </AuthorContainer>
  );
});

// Мемоізований компонент для тегів
const TagsList = React.memo(({ tags, theme }) => {
  if (!tags || !Array.isArray(tags)) return null;
  
  return (
    <TagContainer>
      {tags.map(tag => (
        <Tag key={tag.name}>#{tag.name}</Tag>
      ))}
    </TagContainer>
  );
});

// Мемоізований компонент для рендерингу елемента FlatList
const DocumentItem = React.memo(({ item, index, theme, onImagePress }) => (
  <RenderBlock 
    block={item} 
    index={index} 
    theme={theme} 
    onImagePress={onImagePress}
  />
));

const ArticleDetailScreen = () => {
  const { slug } = useRoute().params;
  const navigation = useNavigation();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef(null);

  const [galleryVisible, setGalleryVisible] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState([]);

  // Debounce для оптимізації
  const debouncedSlug = useDebounce(slug, 300);

  // Мемоізована функція для збору зображень
  const collectImages = useCallback((blocks) => {
    if (!blocks || !Array.isArray(blocks)) return [];
    
    const allImages = [];
    
    const processBlocks = (blockList) => {
      if (!Array.isArray(blockList)) return;
      
      blockList.forEach(block => {
        if (block?.type === 'image_group' && Array.isArray(block.children)) {
          block.children.forEach(img => {
            if (img?.url) {
              allImages.push({ uri: img.url });
            }
          });
        }
        if (block?.children) processBlocks(block.children);
      });
    };

    processBlocks(blocks);
    return allImages;
  }, []);

  useEffect(() => {
    if (!debouncedSlug) return;
    
    setLoading(true);
    setError(null);
    
    axios.get(`https://api.hikka.io/articles/${debouncedSlug}`)
      .then(res => {
        setArticle(res.data);
        // Збираємо зображення одразу після отримання даних
        if (res.data?.document) {
          const images = collectImages(res.data.document);
          setGalleryImages(images);
        }
      })
      .catch((err) => {
        console.error('Error fetching article:', err);
        setError('Помилка завантаження статті');
      })
      .finally(() => setLoading(false));
  }, [debouncedSlug, collectImages]);

  // Мемоізована функція для обробки натискання на зображення
  const handleImagePress = useCallback((imageUrl) => {
    if (!galleryImages || !Array.isArray(galleryImages)) return;
    const index = galleryImages.findIndex(img => img.uri === imageUrl);
    setGalleryIndex(index >= 0 ? index : 0);
    setGalleryVisible(true);
  }, [galleryImages]);

  // Мемоізований рендеринг документа
  const documentData = useMemo(() => {
    if (!article?.document || !Array.isArray(article.document)) return [];
    return article.document;
  }, [article?.document]);

  const flatListStyle = useMemo(() => ({
    backgroundColor: theme.colors.background,
    paddingTop: insets.top + 56 + 20, // insets.top + header height (16+16+24) + additional 12px
    paddingHorizontal: 12,
    paddingBottom: insets.bottom,
  }), [theme.colors.background, insets.top, insets.bottom]);

  const flatListContentStyle = useMemo(() => ({
    paddingBottom: 20 + insets.bottom,
  }), [insets.bottom]);

  // Мемоізована функція для рендерингу елемента
  const renderItem = useCallback(({ item, index }) => (
    <DocumentItem 
      item={item} 
      index={index} 
      theme={theme} 
      onImagePress={handleImagePress}
    />
  ), [theme, handleImagePress]);



  // Мемоізована функція для ключа елемента
  const keyExtractor = useCallback((item, index) => `block-${index}`, []);

  // Мемоізований header компонент
  const ListHeaderComponent = useMemo(() => {
    if (!article) return null;
    
    return (
      <>
        <AuthorInfo 
          article={article} 
          theme={theme} 
          navigation={navigation} 
          categoryTranslations={CATEGORY_TRANSLATIONS}
        />
        <Title>{article.title}</Title>
        <TagsList tags={article.tags} theme={theme} />
      </>
    );
  }, [article, theme, navigation]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16, color: theme.colors.text }}>Завантаження статті...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <Text style={{ color: theme.colors.text, fontSize: 16, textAlign: 'center', marginHorizontal: 20 }}>
          {error}
        </Text>
        <Pressable 
          style={{ 
            marginTop: 16, 
            paddingHorizontal: 20, 
            paddingVertical: 10, 
            backgroundColor: theme.colors.primary, 
            borderRadius: 8 
          }}
          onPress={() => {
            setLoading(true);
            setError(null);
            // Повторна спроба завантаження
            axios.get(`https://api.hikka.io/articles/${slug}`)
              .then(res => {
                setArticle(res.data);
                if (res.data?.document) {
                  const images = collectImages(res.data.document);
                  setGalleryImages(images);
                }
              })
              .catch(() => setError('Помилка завантаження статті'))
              .finally(() => setLoading(false));
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Спробувати знову</Text>
        </Pressable>
      </View>
    );
  }

  // Перевіряємо чи є дані перед рендерингом
  if (!article) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16, color: theme.colors.text }}>Завантаження статті...</Text>
      </View>
    );
  }

  return (
    <>
      <BlurOverlay experimentalBlurMethod="dimezisBlurView" intensity={100} tint={isDark ? 'dark' : 'light'}>
        <HeaderTitleBar title={`Стаття: ${article.title}`} />
      </BlurOverlay>

      <FlatList
        ref={flatListRef}
        style={flatListStyle}
        contentContainerStyle={flatListContentStyle}
        data={documentData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        initialNumToRender={5}
        maxToRenderPerBatch={3}
        windowSize={10}
        removeClippedSubviews={true}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={() => <View style={{ height: 100 }} />}
      />

      <ImageViewing
        images={galleryImages}
        imageIndex={galleryIndex}
        visible={galleryVisible}
        onRequestClose={() => setGalleryVisible(false)}
      />
    </>
  );
};

export default React.memo(ArticleDetailScreen);

// Styled components

const BlurOverlay = styled(BlurView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  border-bottom-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

const Title = styled.Text`
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 12px;
  color: ${({ theme }) => theme.colors.text};
`;

const AuthorContainer = styled.Pressable`
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px;
  border-color: ${({ theme }) => theme.colors.card};
`;

const Avatar = styled.Image`
  width: 40px;
  height: 40px;
  border-radius: 999px;
  margin-right: 10px;
`;

const TagContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: 12px;
`;

const Tag = styled.Text`
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  padding: 4px 12px;
  border-radius: 999px;
  margin-right: 8px;
  margin-bottom: 8px;
`;

const Paragraph = styled.Text`
  font-size: 16px;
  margin-bottom: 12px;
  color: ${({ theme }) => theme.colors.text};
`;

const List = styled.View`
  margin-bottom: 12px;
`;

const ListItem = styled.Text`
  font-size: 16px;
  padding-left: 12px;
  margin-bottom: 6px;
  color: ${({ theme }) => theme.colors.text};
`;

const ImageRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: 16px;
  justify-content: space-between;
`;

const StyledImage = styled.Image`
  width: 100%;
  height: 180px;
  border-radius: 8px;
`;

const ContentBlock = styled.View`
  margin-top: 24px;
`;

const FullWidthImage = styled.Image`
  width: 100%;
  height: 220px;
  border-radius: 10px;
  margin-bottom: 16px;
`;

const Blockquote = styled.View`
  border-left-width: 3px;
  border-left-color: ${({ theme }) => theme.colors.gray};
  padding-left: 12px;
  margin: 12px 0;
`;

const BlockquoteText = styled.Text`
  font-style: italic;
  color: ${({ theme }) => theme.colors.gray};
  font-size: 16px;
`;

const H1 = styled.Text`
  font-size: 28px;
  font-weight: bold;
  margin-top: 24px;
  margin-bottom: 12px;
  color: ${({ theme }) => theme.colors.text};
`;

const H2 = styled.Text`
  font-size: 24px;
  font-weight: bold;
  margin-top: 22px;
  margin-bottom: 11px;
  color: ${({ theme }) => theme.colors.text};
`;

const H3 = styled.Text`
  font-size: 22px;
  font-weight: bold;
  margin-top: 20px;
  margin-bottom: 10px;
  color: ${({ theme }) => theme.colors.text};
`;

const H4 = styled.Text`
  font-size: 20px;
  font-weight: bold;
  margin-top: 18px;
  margin-bottom: 9px;
  color: ${({ theme }) => theme.colors.text};
`;

const H5 = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin-top: 16px;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.text};
`;

const H6 = styled.Text`
  font-size: 16px;
  font-weight: bold;
  margin-top: 14px;
  margin-bottom: 7px;
  color: ${({ theme }) => theme.colors.text};
`;

const SpoilerContainer = styled.View`
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.card};
  margin-bottom: 12px;
`;

const SpoilerButtonText = styled.Text`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

const SpoilerContent = styled.View`
  margin-top: 12px;
`;