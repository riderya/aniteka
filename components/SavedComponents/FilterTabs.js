import React from 'react';
import styled from 'styled-components/native';

const FilterTabs = ({ filters, activeIndex, onChange }) => (
  <FilterScroll horizontal showsHorizontalScrollIndicator={false}>
    {filters.map((filter, i) => (
      <FilterButton
        key={filter.label}
        active={i === activeIndex}
        onPress={() => onChange(i)}
      >
        <FilterText active={i === activeIndex}>{filter.label}</FilterText>
      </FilterButton>
    ))}
  </FilterScroll>
);

export default FilterTabs;

const FilterScroll = styled.ScrollView`
  padding: 0px 12px;
  flex-grow: 0;
`;

const FilterButton = styled.TouchableOpacity`
  border-color: ${({ active, theme }) => (active ? theme.colors.primary : theme.colors.background)};
  border-bottom-width: 2px;
  padding: 14px 16px;
  margin-right: 8px;
`;

const FilterText = styled.Text`
  color: ${({ active, theme }) => (active ? theme.colors.primary : theme.colors.gray)};
  font-weight: bold;
  font-size: 15px;
`;
