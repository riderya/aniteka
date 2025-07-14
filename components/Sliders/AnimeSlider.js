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
import AntDesign from '@expo/vector-icons/AntDesign';
import AnimeColumnCard from '../Cards/AnimeColumnCard';
import * as SecureStore from 'expo-secure-store';

const SCREEN_WIDTH = Dimensions.get('window').width;

const AnimeSlider = ({ titleLineText, descriptionText, api, requestBody, refreshTrigger  }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [watchStatuses, setWatchStatuses] = useState({});
  const flatListRef = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.post(api, requestBody, {
          headers: { 'Content-Type': 'application/json' },
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

  useEffect(() => {
    const fetchStatuses = async () => {
      if (!data.length) return;

      try {
        const authToken = await SecureStore.getItemAsync('hikka_token');
        if (!authToken) {
          return;
        }

        const statuses = {};
        await Promise.all(
          data.map(async (anime) => {
            try {
              const response = await axios.get(`https://api.hikka.io/watch/${anime.slug}`, {
                headers: { auth: authToken },
              });
              statuses[anime.slug] = response.data.status;
            } catch {
              statuses[anime.slug] = null;
            }
          })
        );
        setWatchStatuses(statuses);
      } catch (err) {
      }
    };

    fetchStatuses();
  }, [data]);

  const scrollToIndex = (index) => {
    if (flatListRef.current && index >= 0 && index < data.length) {
      flatListRef.current.scrollToIndex({ index, animated: true });
      setCurrentIndex(index);
    }
  };

  if (loading) {
    return (
      <Container>
        <HeaderLine>
          <Column>
            <TitleLine>{titleLineText}</TitleLine>
            <Description>{descriptionText}</Description>
          </Column>
        </HeaderLine>

        <SkeletonList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[...Array(6).keys()]}
          keyExtractor={(item) => `skeleton-${item}`}
          renderItem={() => <SkeletonItem />}
        />
      </Container>
    );
  }

  if (error) return <TextError>{error} Помилка при завантажені аніме</TextError>;

  return (
    <Container>
      <HeaderLine>
        <Column>
          <TitleLine>{titleLineText}</TitleLine>
          <Description>{descriptionText}</Description>
        </Column>

        <ButtonRow>
          <ArrowButton
            onPress={() => scrollToIndex(currentIndex - 1)}
            disabled={currentIndex === 0}
            disabledOpacity={0.3}
          >
            <StyledIcon name="left" disabled={currentIndex === 0} />
          </ArrowButton>
          <ArrowButton
            onPress={() => scrollToIndex(currentIndex + 1)}
            disabled={currentIndex === data.length - 1}
            disabledOpacity={0.3}
          >
            <StyledIcon name="right" disabled={currentIndex === data.length - 1} />
          </ArrowButton>
        </ButtonRow>
      </HeaderLine>

      <StyledFlatList
        ref={flatListRef}
        data={data}
        keyExtractor={(item, index) => `${item.slug || item.id || index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <AnimeColumnCard
            anime={item}
            status={watchStatuses[item.slug]}
            onPress={() => navigation.navigate('AnimeDetails', { slug: item.slug })}
          />
        )}
      />
    </Container>
  );
};

export default AnimeSlider;

const Container = styled.View`
  position: relative;
  align-items: center;
`;

const StyledFlatList = styled.FlatList`
  padding: 0px 12px;
`;

const HeaderLine = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0px 12px;
  margin-bottom: 8px;
`;

const Column = styled.View`
  flex-direction: column;
  width: 80%;
`;

const TitleLine = styled.Text`
  font-size: 24px;
  font-weight: 900;
  margin-bottom: 4px;
  color: ${({ theme }) => theme.colors.text};
`;

const Description = styled.Text`
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.gray};
  margin-bottom: 8px;
`;

const ButtonRow = styled.View`
  flex-direction: row;
  gap: 8px;
`;

const ArrowButton = styled.TouchableOpacity`
  opacity: ${({ disabled, disabledOpacity }) => (disabled ? disabledOpacity || 0.5 : 1)};
`;

const StyledIcon = styled(AntDesign)`
  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.disabled : theme.colors.primary};
  font-weight: 600;
  font-size: 24px;
`;

const SkeletonList = styled(FlatList)`
  padding-left: 10px;
`;

const SkeletonItem = () => (
  <SkeletonContainer>
    <SkeletonPoster />
    <SkeletonText />
  </SkeletonContainer>
);

const SkeletonContainer = styled.View`
  width: 140px;
  margin-right: 20px;
`;

const SkeletonPoster = styled.View`
  height: 190px;
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
