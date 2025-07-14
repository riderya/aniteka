import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Animated, TouchableOpacity, View } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import styled from 'styled-components/native'
import axios from 'axios'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import RowLineHeader from './RowLineHeader';

const Container = styled.View``

const AnimeCard = styled.View`
  flex-direction: row;
  padding: 0px 12px;
  margin-top: 10px;
`

const AnimeImage = styled.Image`
  width: 55px;
  height: 75px;
  border-radius: 14px;
  margin-right: 12px;
  background-color: ${({ theme }) => theme.colors.border};
`

const Info = styled.View`
  flex: 1;
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

const FranchiseList = ({ slug }) => {
  const [franchise, setFranchise] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [contentHeight, setContentHeight] = useState(0)
  const animation = useRef(new Animated.Value(0)).current
  const navigation = useNavigation()

  const COLLAPSED_COUNT = 3
  const FALLBACK_ITEM_HEIGHT = 85

  useEffect(() => {
    const fetchFranchise = async () => {
      setLoading(true)
      try {
        const response = await axios.get(`https://api.hikka.io/related/anime/${slug}/franchise`)
        const animeFranchise = response.data.anime || []

        const filtered = animeFranchise
          .filter(item => item.slug !== slug)
          .sort((a, b) => (b.year || 0) - (a.year || 0))

        setFranchise(filtered)
      } catch (err) {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchFranchise()
  }, [slug])

  useEffect(() => {
    // Початкова висота після завантаження — згорнутий стан
    if (franchise.length > 0) {
      const collapsedHeight = Math.min(franchise.length, COLLAPSED_COUNT) * FALLBACK_ITEM_HEIGHT
      animation.setValue(collapsedHeight)
    }
  }, [franchise])

  const toggleExpansion = () => {
    const collapsedHeight = Math.min(franchise.length, COLLAPSED_COUNT) * FALLBACK_ITEM_HEIGHT
    const toValue = expanded ? collapsedHeight : contentHeight

    Animated.timing(animation, {
      toValue,
      duration: 500,
      useNativeDriver: false,
    }).start()

    setExpanded(!expanded)
  }

  if (loading) {
    return (
      <Container>
        <ActivityIndicator size="large" color="#ff6f61" />
      </Container>
    )
  }

  if (error || franchise.length === 0) return null

  return (
    <Container>
      <RowLineHeader title="Пов’язане" />

      <Animated.View style={{ overflow: 'hidden', height: animation }}>
        <View
          onLayout={(e) => {
            const height = e.nativeEvent.layout.height
            setContentHeight(height)
          }}
        >
          {franchise.map((item) => (
            <TouchableOpacity
              key={item.slug}
              onPress={() => navigation.navigate('AnimeDetails', { slug: item.slug })}
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
                    <StyledIcon name="circle" />
                    <SubText>{item.episodes_released || '?'}/{item.episodes_total || '?'} еп</SubText>
                  </Row>
                </Info>
              </AnimeCard>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {franchise.length > COLLAPSED_COUNT && (
        <ToggleButton onPress={toggleExpansion}>
          <ToggleText>{expanded ? 'Згорнути...' : 'Показати більше...'}</ToggleText>
        </ToggleButton>
      )}

      <LineGray />
    </Container>
  )
}

export default FranchiseList
