import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, View } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import styled from 'styled-components/native'
import axios from 'axios'
import { useTheme } from '../../context/ThemeContext';
import RowLineHeader from './RowLineHeader';
import AnimeColumnCard from '../Cards/AnimeColumnCard';

const Container = styled.View``

const StyledFlatList = styled.FlatList.attrs(() => ({
  contentContainerStyle: {
    paddingHorizontal: 12,
  },
}))``

const CardWrapper = styled.View`
  margin-right: ${({ isLast }) => (isLast ? '0px' : '12px')};
`

const FranchiseList = ({ slug, title, onVisibilityChange }) => {
  const [franchise, setFranchise] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const navigation = useNavigation()
  const { theme } = useTheme()

  const MAX_FRANCHISES = 5

  useEffect(() => {
    const fetchFranchise = async () => {
      setLoading(true)
      try {
        const response = await axios.get(`https://api.hikka.io/related/anime/${slug}/franchise`)
        const animeFranchise = response.data.anime || []

        const filtered = animeFranchise
          .filter(item => item.slug !== slug)
          .sort((a, b) => (b.year || 0) - (a.year || 0))
          .slice(0, MAX_FRANCHISES) // Limit to maximum 3 franchises

        setFranchise(filtered)
      } catch (err) {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchFranchise()
  }, [slug])

  // Відстежуємо зміни видимості та повідомляємо батьківський компонент
  useEffect(() => {
    if (onVisibilityChange) {
      const isVisible = !loading && !error && franchise.length > 0;
      onVisibilityChange(isVisible);
    }
  }, [loading, error, franchise.length, onVisibilityChange]);

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
      <RowLineHeader 
        title="Пов'язане" 
        onPress={() => navigation.navigate('AnimeFranchise', { slug, title })}
        linkText="Більше"
      />

      <StyledFlatList
        data={franchise}
        keyExtractor={(item, index) => `${item.slug || item.id || index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <CardWrapper isLast={index === franchise.length - 1}>
            <AnimeColumnCard
              anime={item}
              onPress={() => navigation.navigate('AnimeDetails', { slug: item.slug })}
              cardWidth={100}
              imageWidth={100}
              imageHeight={130}
              titleFontSize={14}
              badgeFontSize = {11}
              footerFontSize={11}
              starIconSize={11}
              imageBorderRadius={24}
              titleNumberOfLines={2}
            />
          </CardWrapper>
        )}
      />
    </Container>
  )
}

export default FranchiseList
