import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Image, Linking, Pressable } from 'react-native';
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

const ArticleDetailScreen = () => {
  const { slug } = useRoute().params;
  const navigation = useNavigation();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [galleryVisible, setGalleryVisible] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState([]);

const CATEGORY_TRANSLATIONS = {
  news: 'Новини',
  reviews: 'Огляди',
  original: 'Авторське',
};

  useEffect(() => {
    axios.get(`https://api.hikka.io/articles/${slug}`)
      .then(res => setArticle(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

const renderChildren = (children, customStyle = {}) =>
  children?.map((child, index) => {
    if (typeof child.text === 'string') {
      let style = { ...customStyle };
      if (child.bold) style.fontWeight = 'bold';

      const cleanText = child.text
        .replace(/\s+/g, ' ')
        .replace(/^\s+|\s+$/g, '');

      return <Text key={index} style={style}>{cleanText}</Text>;
    }

    if (child.type === 'a') {
      return (
        <Text
          key={index}
          style={{
            color: theme.colors.primary,
            textDecorationLine: 'underline',
            ...customStyle,
          }}
          onPress={() => Linking.openURL(child.url)}
        >
          {renderChildren(child.children, customStyle)}
        </Text>
      );
    }

    return null;
  });



  useEffect(() => {
    if (!article) return;

    const allImages = [];

    const collectImages = (blocks) => {
      blocks.forEach(block => {
        if (block.type === 'image_group' && Array.isArray(block.children)) {
          block.children.forEach(img => {
            if (img.url) {
              allImages.push({ uri: img.url });
            }
          });
        }
        if (block.children) collectImages(block.children);
      });
    };

    collectImages(article.document);
    setGalleryImages(allImages);
  }, [article]);

  const renderDocument = (document) => {
    
const SpoilerWrapper = ({ children }) => {
  const [visible, setVisible] = useState(false);
  return (
    <SpoilerContainer>
      <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }} onPress={() => setVisible(!visible)}>
        <SpoilerButtonText style={{ color: theme.colors.primary }}>
          {visible ? 'Сховати спойлер' : 'Показати спойлер'}
        </SpoilerButtonText>
        <Entypo name="select-arrows" size={20} color={theme.colors.gray} />
      </Pressable>
      {visible && (
  <SpoilerContent>
    {renderChildren(children, { color: theme.colors.text })}
  </SpoilerContent>
)}

    </SpoilerContainer>
  );
};


 const renderBlock = (block, i) => {
    if (!block.type && Array.isArray(block.children)) {
      return block.children.map((child, index) => renderBlock(child, `${i}-${index}`));
    }

    switch (block.type) {
      case 'p':
        return <Paragraph key={i}>{renderChildren(block.children)}</Paragraph>;
      case 'ul':
        return (
          <List key={i}>
            {block.children.map((li, index) => (
              <ListItem key={index}>{renderChildren(li.children[0].children)}</ListItem>
            ))}
          </List>
        );
      case 'h1':
        return <H1 key={i}>{renderChildren(block.children)}</H1>;
      case 'h2':
        return <H2 key={i}>{renderChildren(block.children)}</H2>;
      case 'h3':
        return <H3 key={i}>{renderChildren(block.children)}</H3>;
      case 'h4':
        return <H4 key={i}>{renderChildren(block.children)}</H4>;
      case 'h5':
        return <H5 key={i}>{renderChildren(block.children)}</H5>;
      case 'h6':
        return <H6 key={i}>{renderChildren(block.children)}</H6>;
      case 'blockquote':
        return (
          <Blockquote key={i}>
            {block.children?.map((child, index) => (
<BlockquoteText key={index}>
  {(child.text?.replace(/\s+/g, ' ').trim()) || renderChildren(child.children)}
</BlockquoteText>

            ))}
          </Blockquote>
        );
      case 'preview':
        return block.children?.map((child, index) => renderBlock(child, `${i}-${index}`));
      case 'image':
        return (
          <FullWidthImage
            key={i}
            source={{ uri: block.url }}
            resizeMode="cover"
          />
        );
      case 'image_group':
        const images = block.children || [];
        if (images.length === 1) {
          return (
            <Pressable
              key={i}
              onPress={() => {
                const index = galleryImages.findIndex(img => img.uri === images[0].url);
                setGalleryIndex(index >= 0 ? index : 0);
                setGalleryVisible(true);
              }}
            >
              <FullWidthImage
                source={{ uri: images[0].url }}
                resizeMode="cover"
              />
            </Pressable>
          );
        }
        return (
          <ImageRow key={i}>
            {images.map((img, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  const galleryIdx = galleryImages.findIndex(g => g.uri === img.url);
                  setGalleryIndex(galleryIdx >= 0 ? galleryIdx : 0);
                  setGalleryVisible(true);
                }}
                style={{ width: '48.5%', marginBottom: 10 }}
              >
                <StyledImage source={{ uri: img.url }} resizeMode="cover" />
              </Pressable>
            ))}
          </ImageRow>
        );
      case 'video':
        const getVideoId = (url) => {
          const match = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
          return match?.[1] || null;
        };
        const videoId = getVideoId(block.url);
        if (!videoId) return null;
        return (
          <View key={i} style={{ marginVertical: 10 }}>
            <YoutubePlayer height={210} play={false} videoId={videoId} />
          </View>
        );
      case 'spoiler':
        return <SpoilerWrapper key={i} children={block.children} />;
      default:
        break;
    }

    if (block.children && Array.isArray(block.children)) {
      return block.children.map((child, index) => renderBlock(child, `${i}-${index}`));
    }

    return null;
  };

  return document.map((block, i) => renderBlock(block, i));
};

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;

  return (
    <>
      <BlurOverlay intensity={100} tint={isDark ? 'dark' : 'light'}>
        <HeaderTitleBar title={`Стаття: ${article.title}`} />
      </BlurOverlay>

      <ScrollView
      style={{ backgroundColor: theme.colors.background }}
        contentContainerStyle={{
          paddingTop: 110,
          paddingBottom: 20 + insets.bottom,
          paddingHorizontal: 12,
        }}
      >

<AuthorContainer 
  onPress={() => navigation.navigate('UserProfileScreen', { username: article.author.username })}
  activeOpacity={0.7}
>
  <Avatar source={{ uri: article.author.avatar }} />
  <View>
    <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4, color: theme.colors.text }}>
      {article.author.username}
    </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#888', fontSize: 12 }}>
                {CATEGORY_TRANSLATIONS[article.category] || 'Категорія'}
              </Text>
              <FontAwesome
                name="circle"
                size={4}
                color={theme.colors.gray}
                style={{ marginHorizontal: 6 }}
              />
              <Text style={{ color: '#888', fontSize: 12 }}>
                {formatDistanceToNow(new Date(article.created * 1000), {
                  addSuffix: true,
                  locale: uk,
                })}
              </Text>
            </View>
  </View>
</AuthorContainer>


        <Title>{article.title}</Title>

        <TagContainer>
          {article.tags.map(tag => (
            <Tag key={tag.name}>#{tag.name}</Tag>
          ))}
        </TagContainer>

        {renderDocument(article.document)}
        
      </ScrollView>

      <ImageViewing
        images={galleryImages}
        imageIndex={galleryIndex}
        visible={galleryVisible}
        onRequestClose={() => setGalleryVisible(false)}
      />
    </>
  );
};

export default ArticleDetailScreen;

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
