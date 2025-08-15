import React from 'react';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../context/ThemeContext';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useNotifications } from '../../context/NotificationsContext';


const Header = () => {
  const { isDark } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { unseenCount } = useNotifications();

  return (
      <FixedContainer topInset={insets.top + 10}>
        <Touchable onPress={() => navigation.navigate('Search')} activeOpacity={0.7}>
          <BlurButton experimentalBlurMethod="dimezisBlurView" intensity={100} tint={isDark ? 'dark' : 'light'}>
            <IconText name="search1" />
            <ButtonText>Пошук</ButtonText>
          </BlurButton>
        </Touchable>

        <TouchableOpacity onPress={() => navigation.navigate('Settings')} activeOpacity={0.7}>
          <BlurIconButton experimentalBlurMethod="dimezisBlurView" intensity={100} tint={isDark ? 'dark' : 'light'}>
            <IconText name="setting" />
          </BlurIconButton>
        </TouchableOpacity>

                 <TouchableOpacity onPress={() => navigation.navigate('Notifications')} activeOpacity={0.7}>
           <BlurIconButton experimentalBlurMethod="dimezisBlurView" intensity={100} tint={isDark ? 'dark' : 'light'}>
             <IconTextNotifications name="notifications-outline" />
             {unseenCount > 0 && (
               <NotificationBadge>
                 <NotificationBadgeText>{unseenCount > 99 ? '99+' : unseenCount}</NotificationBadgeText>
               </NotificationBadge>
             )}
           </BlurIconButton>
         </TouchableOpacity>

      </FixedContainer>
  );
};

export default Header;

const FixedContainer = styled.View`
  margin: 0px 12px;
  padding-top: ${({ topInset }) => topInset}px;
  flex-direction: row;
  gap: 10px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
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

const NotificationBadge = styled.View`
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: #FF4444;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
`;

const NotificationBadgeText = styled.Text`
  color: white;
  font-size: 11px;
  font-weight: bold;
  text-align: center;
`;
