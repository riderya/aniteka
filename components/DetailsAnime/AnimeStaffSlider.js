import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList } from 'react-native';
import styled from 'styled-components/native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import RowLineHeader from './RowLineHeader';
import StaffColumnCard from '../Cards/StaffColumnCard';

const Container = styled.View``;

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
        <ActivityIndicator size="large" color="#ff6f61" />
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
