import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const HeaderTitleBar = ({ title }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <HeaderContainer style={{ paddingTop: insets.top }}>
      <HeaderRow>
        <BackButton onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#888" />
        </BackButton>
        <HeaderTitle numberOfLines={1}>{title}</HeaderTitle>
      </HeaderRow>
    </HeaderContainer>
  );
};

export default HeaderTitleBar;

const HeaderContainer = styled.View`
  padding: 12px;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const BackButton = styled.TouchableOpacity`
  padding: 4px;
`;

const HeaderTitle = styled.Text`
  flex: 1;
  color: ${({ theme }) => theme.colors.text};
  font-size: 18px;
  font-weight: bold;
  margin-left: 12px;
`;
