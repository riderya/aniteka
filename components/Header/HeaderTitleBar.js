import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { PlatformBlurView } from '../Custom/PlatformBlurView';
import { useTheme } from '../../context/ThemeContext';

const HeaderTitleBar = ({ title, showBack = true, onBack }) => {
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

  return (
    <HeaderContainer intensity={100} tint={isDark ? 'dark' : 'light'} topOffset={insets.top}>
      <HeaderRow>
        {showBack && (
          <BackButton onPress={handleBack} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </BackButton>
        )}
        <HeaderTitle numberOfLines={1}>{title}</HeaderTitle>
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
`;

const BackButton = styled.TouchableOpacity`
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
`;

const HeaderTitle = styled.Text`
  flex: 1;
  color: ${({ theme }) => theme.colors.text};
  font-size: 18px;
  font-weight: 700;
  margin-left: 12px;
`;
