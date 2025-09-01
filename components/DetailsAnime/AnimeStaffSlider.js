import React, { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import styled from 'styled-components/native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import RowLineHeader from './RowLineHeader';
import StaffColumnCard from '../Cards/StaffColumnCard';
import { StaffColumnCardSkeleton } from '../Skeletons';

const Container = styled.View``;

const SkeletonContainer = styled.View`
  padding-horizontal: 12px;
  padding-bottom: 50px;
`;

const StaffName = styled.Text`
  font-size: 14px;
  font-weight: 500;
  margin-top: 4px;
  margin-left: 12px;
  color: ${({ theme }) => theme.colors.text};
`;

const AnimeStaffSlider = ({ slug, title, onVisibilityChange }) => {
  const navigation = useNavigation();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await axios.get(`https://api.hikka.io/anime/${slug}/staff`);
        setStaff(response.data.list);
        
        // Повідомляємо батьківський компонент про видимість
        if (onVisibilityChange) {
          onVisibilityChange(response.data.list.length > 0);
        }
      } catch (e) {
        setError(true);
        console.error('Помилка при завантаженні акторів:', e);
        
        // Повідомляємо батьківський компонент про видимість при помилці
        if (onVisibilityChange) {
          onVisibilityChange(false);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [slug, onVisibilityChange]);

  if (loading) {
    return (
      <Container>
        <RowLineHeader
          title="Автори"
          onPress={() => {}}
        />
        <SkeletonContainer>
          <FlatList
            data={[1, 2, 3, 4, 5]} // Показуємо 5 скелетонів
            keyExtractor={(_, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={() => (
              <StaffColumnCardSkeleton 
                cardWidth="100px"
                imageWidth="100px"
                imageHeight="130px"
                borderRadius={24}
                marginRight="12px"
              />
            )}
          />
        </SkeletonContainer>
      </Container>
    );
  }

  // Якщо немає персоналу або є помилка - не показуємо нічого
  if (error || staff.length === 0) {
    return null;
  }

  return (
    <Container>
      <RowLineHeader
        title="Автори"
        onPress={() => navigation.navigate('AnimeStaffScreen', { slug, title })}
      />

      <FlatList
        data={staff.slice(0, 5)}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        contentContainerStyle={{ paddingHorizontal: 12 }}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <StaffColumnCard 
          person={item.person} roles={item.roles}
          cardWidth="100px"
          imageWidth="100px"
          imageHeight="130px"
          borderRadius={24}
          marginRight="12px"
          nameFontSize="14px"
          />
        )}
      />
    </Container>
  );
};

export default AnimeStaffSlider;
