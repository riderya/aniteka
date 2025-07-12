import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import styled from 'styled-components/native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import HeaderTitleBar from '../../components/Header/HeaderTitleBar';
import avatarFallback from '../../assets/image/image404.png';

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

const StaffCard = styled.View`
  flex-direction: row;
  margin: 6px 12px;
`;

const StaffImage = styled.Image`
  width: 80px;
  height: 100px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.card};
`;

const Info = styled.View`
  padding-left: 12px;
  width: 78%;
`;

const Name = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  font-weight: bold;
`;

const Role = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 14px;
  margin-top: 4px;
`;

// ------------ component ------------
const AnimeStaffScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { slug, title } = route.params;

  const insets = useSafeAreaInsets();          // ← беремо bottom‑inset
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
      {/* шапка */}
      <BlurOverlay intensity={100} tint={isDark ? 'dark' : 'light'}>
        <HeaderTitleBar title={`Всі автори: ${title}`} />
      </BlurOverlay>

      {/* список авторів */}
      <FlatList
        data={staff}
        keyExtractor={(item) => item.person.slug}
        contentContainerStyle={{
          paddingTop: headerHeight,
          paddingBottom: 20 + insets.bottom,   // ← базові 20 px + safe‑area
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('AnimePeopleDetailsScreen', {
                slug: item.person.slug,
              })
            }
          >
            <StaffCard>
              <StaffImage
                source={
                  item?.person?.image?.trim()
                    ? { uri: item.person.image }
                    : avatarFallback
                }
              />
              <Info>
                <Name numberOfLines={1}>
                  {item.person.name_ua || item.person.name_en}
                </Name>
                <Role numberOfLines={2}>
                  {item.roles
                    .map((r) => r.name_ua || r.name_en)
                    .join(', ')}
                </Role>
              </Info>
            </StaffCard>
          </TouchableOpacity>
        )}
      />
    </Container>
  );
};

export default AnimeStaffScreen;
