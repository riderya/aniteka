import React from 'react';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LineGray = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.borderInput};
`;

const Button = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.inputBackground};
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 15px 12px; /* більше відступу зверху */
  padding-bottom: ${({ bottomInset }) => 25 + (bottomInset || 0)}px;
  min-height: 90px; /* мінімальна висота замість фіксованої */
`;

const ButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.placeholder};
  font-size: 16px;
`;

const StyledIcon = styled(Ionicons)`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 24px;
`;

const AnimeSendButton = ({ slug, title, commentsCount }) => {
  const navigation = useNavigation();
  const { bottom } = useSafeAreaInsets();

  return (
    <>
      <LineGray />
      <Button
        bottomInset={bottom}
        onPress={() =>
          navigation.navigate('AnimeCommentsDetailsScreen', {
            slug,
            title,
            commentsCount,
          })
        }
        activeOpacity={0.8}
      >
        <ButtonText>Відправити коментар...</ButtonText>
        <StyledIcon name="send" />
      </Button>
    </>
  );
};

export default AnimeSendButton;
