import React, { useState } from 'react';
import styled from 'styled-components/native';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RulesModal from '../CommentForm/RulesModal';

const SendContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.inputBackground};
  margin: 12px;
  border-radius: 16px;
  overflow: hidden;
`;

const TopBar = styled.TouchableOpacity`
  padding: 5px 12px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.card};
`;

const SpoilerWrap = styled.View`
  flex-direction: row;
  align-items: center;
`;

const SpoilerOk = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
`;

const SpoilerWord = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  margin-left: 6px;
`;

const RulesButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`;

const RulesText = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 14px;
  font-weight: 600;
  margin-left: 4px;
`;

const ClipboardIcon = styled(FontAwesome)`
  color: ${({ theme }) => theme.colors.gray};
`;

const InputButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.inputBackground};
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 20px 12px;
`;

const ButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.placeholder};
  font-size: 16px;
`;

const AnimeSendButton = ({ slug, title, commentsCount }) => {
  const navigation = useNavigation();
  const [rulesVisible, setRulesVisible] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <SendContainer insets={insets}>
      <TopBar onPress={() =>
          navigation.navigate('CommentsDetailsScreen', {
            slug,
            title,
            commentsCount,
          })
        }
        activeOpacity={0.8}>
        <SpoilerWrap>
          <SpoilerOk>Не містить</SpoilerOk>
          <SpoilerWord>спойлер</SpoilerWord>
        </SpoilerWrap>
        <RulesButton onPress={() => setRulesVisible(true)} activeOpacity={0.8}>
          <ClipboardIcon name="clipboard" size={14} />
            <RulesText>Правила</RulesText>
        </RulesButton>
      </TopBar>
      <InputButton
        onPress={() =>
          navigation.navigate('CommentsDetailsScreen', {
            slug,
            title,
            commentsCount,
          })
        }
        activeOpacity={0.8}
      >
        <ButtonText>Ваш коментар</ButtonText>
          <Ionicons name="send" size={24} color={`#888`} />
      </InputButton>

      <RulesModal visible={rulesVisible} onClose={() => setRulesVisible(false)} />
    </SendContainer>
  );
};

export default AnimeSendButton;
