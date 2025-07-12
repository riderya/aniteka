import React from 'react';
import { View } from 'react-native';
import { RowSorting, TextCount, SortButton, SortText, RandomButton, RandomText } from './styles';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Octicons from '@expo/vector-icons/Octicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useTheme } from '../../context/ThemeContext';

const SortHeader = ({ count, sortOptions, onSort, onRandom }) => {
  const { theme } = useTheme();

  return (
    <RowSorting>
      <TextCount numberOfLines={1}>{count} Всього</TextCount>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <SortButton onPress={onSort}>
          <MaterialIcons name="sort" size={24} color={theme.colors.gray} />
          <SortText>По {sortOptions[0].includes('score') ? 'оцінкам' : 'додаванню'}</SortText>
          <Octicons name="chevron-down" size={24} color={theme.colors.gray} />
        </SortButton>
        <RandomButton onPress={onRandom}>
          <RandomText><FontAwesome5 name="random" size={20} color={theme.colors.gray} /></RandomText>
        </RandomButton>
      </View>
    </RowSorting>
  );
};

export default SortHeader;
