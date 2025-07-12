import React from 'react';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../context/ThemeContext';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Header = () => {
  const { isDark } = useTheme();
  const navigation = useNavigation();

  return (
    <SafeAreaContainer edges={['top']}>
      <FixedContainer>
        <Touchable onPress={() => navigation.navigate('Search')} activeOpacity={0.7}>
          <BlurButton experimentalBlurMethod="dimezis" intensity={100} tint={isDark ? 'dark' : 'light'}>
            <IconText name="search1" />
            <ButtonText>Пошук</ButtonText>
          </BlurButton>
        </Touchable>

        <TouchableOpacity onPress={() => navigation.navigate('Settings')} activeOpacity={0.7}>
          <BlurIconButton experimentalBlurMethod="dimezis" intensity={100} tint={isDark ? 'dark' : 'light'}>
            <IconText name="setting" />
          </BlurIconButton>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Notifications')} activeOpacity={0.7}>
          <BlurIconButton experimentalBlurMethod="dimezis" intensity={100} tint={isDark ? 'dark' : 'light'}>
            <IconTextNotifications name="notifications-outline" />
          </BlurIconButton>
        </TouchableOpacity>
      </FixedContainer>
    </SafeAreaContainer>
  );
};

export default Header;

const SafeAreaContainer = styled(SafeAreaView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
`;

const FixedContainer = styled.View`
  margin: 0px 12px;
  flex-direction: row;
  gap: 10px;
`;

const Touchable = styled(TouchableOpacity)`
  flex: 1;
`;

const BlurButton = styled(BlurView)`
  flex: 1;
  height: 55px;

  border-radius: 999px;
  padding: 0 16px;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  overflow: hidden;
`;

const BlurIconButton = styled(BlurView)`
  width: 55px;
  height: 55px;
  border-radius: 999px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const ButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: bold;
  font-size: 16px;
`;

const IconText = styled(AntDesign)`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 24px;
`;

const IconTextNotifications = styled(Ionicons)`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 24px;
`;
