import React from 'react';
import { FlatList, Linking, Alert, View } from 'react-native';
import styled from 'styled-components/native';
import RowLineHeader from './RowLineHeader';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useTheme } from '../../context/ThemeContext';

const Container = styled.View`
  padding: 0px;
`;

const Spacer = styled.View`
  width: 12px;
`;

const Card = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.border};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.card};
  border-radius: 20px;
  width: 260px;
  padding: 12px;
  justify-content: space-between;
`;

const TypeBadge = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  padding: 4px 10px;
  border-radius: 999px;
  align-self: flex-start;
`;

const TypeBadgeText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
  font-size: 12px;
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 15px;
  line-height: 20px;
  font-weight: 600;
  margin-top: 8px;
`;

const SubTitle = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 13px;
  margin-top: 4px;
`;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
`;

const PlayButton = styled.View`
  padding: 6px 10px;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.colors.primary}20;
`;

const PlayText = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
  margin-left: 6px;
`;

const PlayRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const getDisplayType = (ostType) => {
  if (!ostType) return null;
  const normalized = String(ostType).toLowerCase();
  if (normalized.includes('opening') || normalized === 'op') return 'OP';
  if (normalized.includes('ending') || normalized === 'ed') return 'ED';
  return null;
};

const openLink = async (url) => {
  try {
    if (!url) {
      Alert.alert('Немає посилання', 'Для цього треку немає доступного посилання.');
      return;
    }
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Помилка', 'Неможливо відкрити посилання: ' + url);
    }
  } catch (error) {
    Alert.alert('Помилка', 'Щось пішло не так: ' + error.message);
  }
};

const MusicSlider = ({ anime }) => {
  const { theme } = useTheme();
  const ost = Array.isArray(anime?.ost) ? anime.ost : [];

  const data = ost
    .map((item) => ({
      ...item,
      displayType: getDisplayType(item.ost_type),
    }))
    .filter((x) => x.displayType);

  if (data.length === 0) return null;

  return (
    <Container>
      <RowLineHeader title="Музика" />

      <FlatList
        data={data}
        keyExtractor={(item, index) => `${item.displayType}-${item.index || index}-${item.title}`}
        horizontal
        ListHeaderComponent={<Spacer />}
        ListFooterComponent={<Spacer />}
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        renderItem={({ item }) => (
          <Card onPress={() => openLink(item.spotify)}>
            <TypeBadge>
              <TypeBadgeText>
                {item.displayType}
                {item.index ? ` ${item.index}` : ''}
              </TypeBadgeText>
            </TypeBadge>

            <Title numberOfLines={1} ellipsizeMode="tail">
              {item.title || 'Без назви'}
            </Title>
            <Row>
              <SubTitle numberOfLines={1} ellipsizeMode="tail">
                {item.author || '—'}
              </SubTitle>

              <PlayButton>
                <PlayRow>
                  <FontAwesome6 name="headphones" size={16} color={theme.colors.primary} />
                  <PlayText>Слухати</PlayText>
                </PlayRow>
              </PlayButton>
            </Row>
          </Card>
        )}
      />
    </Container>
  );
};

export default MusicSlider;


