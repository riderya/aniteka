import React, { useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  Text,
  FlatList,
  Dimensions,
  View,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import styled from 'styled-components/native';
import AnimeColumnCard from '../Cards/AnimeColumnCard';
import RowLineHeader from '../DetailsAnime/RowLineHeader';
import * as SecureStore from 'expo-secure-store';
import { useOrientation } from '../../hooks';
import { getResponsiveDimensions } from '../../utils/orientationUtils';

const SCREEN_WIDTH = Dimensions.get('window').width;

const AnimeSlider = ({ titleLineText, descriptionText, api, requestBody, refreshTrigger, onPress }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const flatListRef = useRef(null);
  const navigation = useNavigation();
  const orientation = useOrientation();
  const responsiveDims = getResponsiveDimensions();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = await SecureStore.getItemAsync('hikka_token');

        const response = await axios.post(api, requestBody, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            Cookie: `auth=${token}`,
          },
          withCredentials: true,
        });

        const list = Array.isArray(response.data.list) ? response.data.list : [];
        setData(list);
        setLoading(false);
      } catch (e) {
        setError(e.message || 'Error');
        setLoading(false);
      }
    };

    if (api && requestBody) {
      fetchData();
    }
  }, [api, requestBody, refreshTrigger]);

  if (loading) {
    return (
      <Container>
        <RowLineHeader
          title={titleLineText}
          description={descriptionText}
          onPress={onPress}
          marginBottom={5}
        />

        <SkeletonList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[...Array(6).keys()]}
          keyExtractor={(item) => `skeleton-${item}`}
          renderItem={() => <SkeletonItem orientation={orientation} />}
        />
      </Container>
    );
  }

  if (error) return <TextError>{error} Помилка при завантаженні аніме</TextError>;

  return (
    <Container>
      <RowLineHeader
        title={titleLineText}
        description={descriptionText}
        onPress={onPress}
        marginBottom={5}
      />

      <StyledFlatList
        ref={flatListRef}
        data={data}
        keyExtractor={(item, index) => `${item.slug || item.id || index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <CardWrapper isLast={index === data.length - 1}>
            <AnimeColumnCard
              anime={item}
              onPress={() => navigation.navigate('AnimeDetails', { slug: item.slug })}
            />
          </CardWrapper>
        )}
      />
    </Container>
  );
};

export default AnimeSlider;

// styled components

const Container = styled.View`
  position: relative;
  align-items: center;
`;

const StyledFlatList = styled.FlatList.attrs(() => ({
  contentContainerStyle: {
    paddingHorizontal: 12,
  },
}))``;

const SkeletonList = styled(FlatList)`
  padding-left: 10px;
`;

const SkeletonItem = ({ orientation }) => (
  <SkeletonContainer orientation={orientation}>
    <SkeletonPoster orientation={orientation} />
    <SkeletonText />
  </SkeletonContainer>
);

const SkeletonContainer = styled.View`
  width: ${({ orientation }) => orientation === 'landscape' ? 120 : 140}px;
  margin-right: ${({ orientation }) => orientation === 'landscape' ? 16 : 20}px;
`;

const SkeletonPoster = styled.View`
  height: ${({ orientation }) => orientation === 'landscape' ? 160 : 190}px;
  background-color: ${({ theme }) => theme.colors.disabled};
  border-radius: 8px;
`;

const SkeletonText = styled.View`
  height: 14px;
  margin-top: 10px;
  background-color: ${({ theme }) => theme.colors.disabled};
  border-radius: 4px;
`;

const TextError = styled.Text`
  font-size: 14px;
  padding: 12px;
  margin: 0px 12px;
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.error};
  background-color: ${({ theme }) => theme.colors.errorHover};
`;

const CardWrapper = styled.View`
  margin-right: ${({ isLast }) => (isLast ? '0px' : '12px')};
`;
