import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
} from 'react-native';
import styled from 'styled-components/native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import HeaderTitleBar from '../../components/Header/HeaderTitleBar';
import StaffCardRow from '../../components/Cards/StaffCardRow';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const CenteredContainer = styled(Container)`
  align-items: center;
  justify-content: center;
`;

const BlurOverlay = styled(BlurView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  border-bottom-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

const AnimeStaffScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { slug, title } = route.params;

  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const headerHeight = insets.top + 60;

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          `https://api.hikka.io/anime/${slug}/staff?page=1&size=100`
        );
        setStaff(data.list);
      } catch (error) {
        console.error('Помилка при завантаженні авторів:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return (
      <CenteredContainer>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </CenteredContainer>
    );
  }

  return (
    <Container>
      <BlurOverlay intensity={100} tint={isDark ? 'dark' : 'light'}>
        <HeaderTitleBar title={`Всі автори: ${title}`} />
      </BlurOverlay>

      <FlatList
        data={staff}
        keyExtractor={(item) => item.person.slug}
        contentContainerStyle={{
          paddingTop: headerHeight,
          paddingBottom: 20 + insets.bottom,
        }}
        renderItem={({ item }) => (
          <StaffCardRow
            person={item.person}
            roles={item.roles}
            onPress={() =>
              navigation.navigate('AnimePeopleDetailsScreen', {
                slug: item.person.slug,
              })
            }
          />
        )}
      />
    </Container>
  );
};

export default AnimeStaffScreen;
