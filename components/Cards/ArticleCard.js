import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale';
import { useNavigation } from '@react-navigation/native';
import { getArticleImage } from '../../utils/imageFallback';

const TouchableCard = styled(TouchableOpacity)`
  width: ${({ cardWidth }) => (cardWidth ? `${cardWidth}px` : '100%')};
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 16px;
  border-radius: 24px;
`;

const TopRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const AuthorRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Avatar = styled.Image`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  margin-right: 8px;
`;

const Username = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: bold;
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 18px;
  font-weight: bold;
  margin-top: 10px;
`;

const StyledImage = styled.Image`
  width: 100%;
  height: 180px;
  border-radius: 10px;
  margin-top: 12px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
`;

const RowSpaceBetween = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
    margin-top: 12px;
`;

const TagsRow = styled.View`
  flex-direction: row;
  gap: 6px;
`;

const Tag = styled.Text`
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 12px;
`;

const StatsRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 16px;
`;

const Stat = styled.View`
  flex-direction: row;
  align-items: center;
`;

const StatText = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  margin-left: 4px;
  font-size: 13px;
`;

const CATEGORY_TRANSLATIONS = {
  news: 'Новини',
  reviews: 'Огляди',
  original: 'Авторське',
};

const ArticleCard = ({ item, theme, cardWidth }) => {
  const navigation = useNavigation();
  const [imageError, setImageError] = React.useState(false);

  // Скидаємо помилку при зміні статті
  React.useEffect(() => {
    setImageError(false);
  }, [item.slug]);

  const handlePress = () => {
    navigation.navigate('ArticleDetailScreen', { slug: item.slug });
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <TouchableCard cardWidth={cardWidth} onPress={handlePress} activeOpacity={0.8}>
      <TopRow>
        <AuthorRow>
          <Avatar source={{ uri: item.author?.avatar || 'https://via.placeholder.com/36' }} />
          <View>
            <Username>{item.author?.username || 'Невідомо'}</Username>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#888', fontSize: 12 }}>
                {CATEGORY_TRANSLATIONS[item.category] || 'Категорія'}
              </Text>
              <FontAwesome
                name="circle"
                size={4}
                color={theme.colors.gray}
                style={{ marginHorizontal: 6 }}
              />
              <Text style={{ color: '#888', fontSize: 12 }}>
                {formatDistanceToNow(new Date(item.created * 1000), {
                  addSuffix: true,
                  locale: uk,
                })}
              </Text>
            </View>
          </View>
        </AuthorRow>
      </TopRow>

      <Title numberOfLines={1}>{item.title}</Title>

      <StyledImage
        source={
          !imageError && getArticleImage(item) 
            ? { uri: getArticleImage(item) } 
            : require('../../assets/image/image404.png')
        }
        resizeMode="cover"
        onError={handleImageError}

      />

      <RowSpaceBetween>
        <TagsRow>
          {item.tags?.length > 0 && (
            <>
              <Tag>{item.tags[0].name}</Tag>
              {item.tags.length > 1 && <Tag>+{item.tags.length - 1}</Tag>}
            </>
          )}
        </TagsRow>

        <StatsRow>
          <Stat>
            <Ionicons name="eye-outline" size={16} color={theme.colors.placeholder} />
            <StatText>{item.views || 0}</StatText>
          </Stat>
          <Stat>
            <Ionicons name="chatbubble-outline" size={16} color={theme.colors.placeholder} />
            <StatText>{item.comments_count || 0}</StatText>
          </Stat>
          <Stat>
            <Ionicons name="heart-outline" size={16} color={theme.colors.placeholder} />
            <StatText>{item.vote_score || 0}</StatText>
          </Stat>
        </StatsRow>
      </RowSpaceBetween>
    </TouchableCard>
  );
};

export default ArticleCard;
