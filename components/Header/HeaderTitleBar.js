import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { PlatformBlurView } from '../Custom/PlatformBlurView';
import { useTheme } from '../../context/ThemeContext';

const HeaderTitleBar = ({ title, showBack = true, onBack, rightButton, onShare }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();



  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    }
  };

  return (
    <HeaderContainer intensity={100} tint={isDark ? 'dark' : 'light'} topOffset={insets.top}>
      <HeaderRow>
        {showBack && (
          <BackButton onPress={handleBack} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </BackButton>
        )}
        <HeaderTitle 
          numberOfLines={1} 
          hasBackButton={showBack}
          hasRightButton={!!rightButton || !!onShare}
        >
          {title}
        </HeaderTitle>
        <RightButtonsContainer>
          {onShare && (
            <ShareButton onPress={handleShare} activeOpacity={0.7}>
              <Ionicons name="share-outline" size={24} color={theme.colors.text} />
            </ShareButton>
          )}
          {rightButton && (
            <RightButtonContainer>
              {rightButton}
            </RightButtonContainer>
          )}
        </RightButtonsContainer>
      </HeaderRow>
    </HeaderContainer>
  );
};

export default HeaderTitleBar;

const HeaderContainer = styled(PlatformBlurView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 16px;
  padding-top: ${({ topOffset }) => topOffset + 16}px;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  position: relative;
`;

const BackButton = styled.TouchableOpacity`
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  z-index: 1;
`;

const HeaderTitle = styled.Text`
  position: absolute;
  left: 50px;
  right: 50px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  z-index: 0;
`;

const RightButtonsContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  z-index: 1;
  position: absolute;
  right: 0;
`;

const ShareButton = styled.TouchableOpacity`
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: ${({ hasRightButton }) => hasRightButton ? '8px' : '0px'};
`;

const RightButtonContainer = styled.View`
  align-items: center;
  justify-content: center;
`;
