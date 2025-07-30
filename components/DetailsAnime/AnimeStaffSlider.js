import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList } from 'react-native';
import styled from 'styled-components/native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import RowLineHeader from './RowLineHeader';
import StaffColumnCard from '../Cards/StaffColumnCard';

const Container = styled.View``;

const LineGray = styled.View`
  margin-top: 25px;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
  margin-left: 12px;
  margin-right: 12px;
`;

const StaffName = styled.Text`
  font-size: 14px;
  font-weight: 500;
  margin-top: 4px;
  margin-left: 12px;
  color: ${({ theme }) => theme.colors.text};
`;

const AnimeStaffSlider = ({ slug, title }) => {
  const navigation = useNavigation();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await axios.get(`https://api.hikka.io/anime/${slug}/staff`);
        setStaff(response.data.list);
      } catch (e) {
        setError(true);
        console.error('Помилка при завантаженні акторів:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [slug]);

  if (loading) {
    return (
      <Container>
        <ActivityIndicator size="large" color="#ff6f61" />
      </Container>
    );
  }

  if (error || staff.length === 0) {
    return (
      <Container>
        <RowLineHeader title="Автори" />
        <StaffName>Немає даних</StaffName>
      </Container>
    );
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
        contentContainerStyle={{ paddingHorizontal: 15 }}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <StaffColumnCard person={item.person} roles={item.roles} />
        )}
      />

      <LineGray />
    </Container>
  );
};

export default AnimeStaffSlider;
