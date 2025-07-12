import React, { useEffect, useState } from 'react'
import { ActivityIndicator, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import styled from 'styled-components/native'
import axios from 'axios'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import RowLineHeader from './RowLineHeader';

const Container = styled.View`
`

const AnimeCard = styled.View`
  flex-direction: row;
  padding: 0px 12px;
`

const AnimeImage = styled.Image`
  width: 55px;
  height: 75px;
  border-radius: 10px;
  margin-right: 12px;
  background-color: ${({ theme }) => theme.colors.border};
`

const Info = styled.View`
  flex: 1;
`

const Column = styled.View`
  flex-direction: column;
  gap: 12px;
`

const Row = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
`

const Title = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`

const SubText = styled.Text`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.gray};
`

const ToggleButton = styled.TouchableOpacity`
  align-self: flex-start;
  margin-top: 16px;
  padding: 0px 12px;
`

const ToggleText = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.gray};
`

const StyledIcon = styled(FontAwesome)`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 6px;
`;

const IconStar = styled(AntDesign)`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 12px;
  margin-left: -6px;
`;

const LineGray = styled.View`
  margin: 25px 0;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
`

const FranchiseList = ({ slug, onPressItem }) => {
  const [franchise, setFranchise] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const navigation = useNavigation();

  useEffect(() => {
    const fetchFranchise = async () => {
      try {
        const response = await axios.get(`https://api.hikka.io/anime/${slug}/franchise`)
        const filtered = response.data.list.filter(item => item.slug !== slug)
        setFranchise(filtered)
      } finally {
        setLoading(false)
      }
    }

    fetchFranchise()
  }, [slug])

  if (loading) {
    return (
      <Container>
        <ActivityIndicator size="large" color="#ff6f61" />
      </Container>
    )
  }

  if (error || franchise.length === 0) return null

  const visibleItems = expanded ? franchise : franchise.slice(0, 3)

  return (
    <Container>
      <RowLineHeader
        title="Пов’язане"
      />

      <Column>
      {visibleItems.map((item) => (
  <TouchableOpacity
    key={item.slug}
    onPress={() =>
      navigation.navigate('AnimeDetails', { slug: item.slug })
    }
  >
    <AnimeCard>
      <AnimeImage source={{ uri: item.image }} />
      <Info>
        <Title numberOfLines={2}>
          {item.title_ua || item.title_en || '?'}
        </Title>
        <Row>
          <SubText>{item.year || '?'} рік</SubText>
          <StyledIcon name="circle" />
          <SubText>{item.score || '?'}</SubText>
          <IconStar name="star" />
        </Row>
      </Info>
    </AnimeCard>
  </TouchableOpacity>
))}

        </Column>

      {franchise.length > 3 && (
        <ToggleButton onPress={() => setExpanded(!expanded)}>
          <ToggleText>{expanded ? 'Згорнути...' : 'Показати більше...'}</ToggleText>
        </ToggleButton>
      )}

      <LineGray />
    </Container>
  )
}

export default FranchiseList
