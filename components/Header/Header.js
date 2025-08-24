import React from 'react';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../context/ThemeContext';
import { TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useNotifications } from '../../context/NotificationsContext';
import { useOrientation } from '../../hooks';
import { getHeaderStyles } from '../../utils/orientationUtils';


const Header = () => {
  const { isDark, theme } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { unseenCount } = useNotifications();
  const orientation = useOrientation();
  const headerStyles = getHeaderStyles();

  return (
      <FixedContainer topInset={insets.top + 10}>
        <Touchable onPress={() => (navigation.getParent ? navigation.getParent() : navigation).navigate('Search')} activeOpacity={0.7}>
          {Platform.OS === 'ios' ? (
            <BlurButton orientation={orientation} experimentalBlurMethod="dimezisBlurView" intensity={100} tint={isDark ? 'dark' : 'light'}>
              <IconText name="search1" />
              <ButtonText>Пошук</ButtonText>
            </BlurButton>
          ) : (
            <AndroidButton>
              <IconText name="search1" />
              <ButtonText>Пошук</ButtonText>
            </AndroidButton>
          )}
        </Touchable>

        <TouchableOpacity onPress={() => (navigation.getParent ? navigation.getParent() : navigation).navigate('Settings')} activeOpacity={0.7}>
          {Platform.OS === 'ios' ? (
            <BlurIconButton experimentalBlurMethod="dimezisBlurView" intensity={100} tint={isDark ? 'dark' : 'light'}>
              <IconText name="setting" />
            </BlurIconButton>
          ) : (
            <AndroidIconButton>
              <IconText name="setting" />
            </AndroidIconButton>
          )}
        </TouchableOpacity>

                 <TouchableOpacity onPress={() => (navigation.getParent ? navigation.getParent() : navigation).navigate('Notifications')} activeOpacity={0.7}>
           {Platform.OS === 'ios' ? (
            <BlurIconButton experimentalBlurMethod="dimezisBlurView" intensity={100} tint={isDark ? 'dark' : 'light'}>
             <IconTextNotifications name="notifications-outline" />
             {unseenCount > 0 && (
               <NotificationBadge>
                 <NotificationBadgeText>{unseenCount > 99 ? '99+' : unseenCount}</NotificationBadgeText>
               </NotificationBadge>
             )}
           </BlurIconButton>
         ) : (
           <AndroidIconButton>
             <IconTextNotifications name="notifications-outline" />
             {unseenCount > 0 && (
               <NotificationBadge>
                 <NotificationBadgeText>{unseenCount > 99 ? '99+' : unseenCount}</NotificationBadgeText>
               </NotificationBadge>
             )}
           </AndroidIconButton>
         )}
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
  height: ${({ orientation }) => orientation === 'landscape' ? 45 : 55}px;

  border-radius: 999px;
  padding: 0 ${({ orientation }) => orientation === 'landscape' ? 12 : 16}px;
  flex-direction: row;
  align-items: center;
  gap: ${({ orientation }) => orientation === 'landscape' ? 8 : 12}px;
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

const AndroidButton = styled.View`
  flex: 1;
  height: 55px;
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 999px;
  padding: 0 16px;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  overflow: hidden;
`;

const AndroidIconButton = styled.View`
  width: 55px;
  height: 55px;
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 999px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;
