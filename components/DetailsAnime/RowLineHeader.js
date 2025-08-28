import styled from 'styled-components/native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const Wrapper = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 20px;
  justify-content: space-between;
  padding: 0px 12px;
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 22px;
  font-weight: bold;
`;

const LinkWrapper = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`;

const LinkText = styled.Text`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.gray};
  margin-right: 5px;
`;

const StyledIcon = styled(FontAwesome6)`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 16px;
`;

const RowLineHeader = ({ title, onPress, linkText = "Більше" }) => {
  return (
    <Wrapper>
      <Title>{title}</Title>
      {onPress && (
        <LinkWrapper onPress={onPress}>
          <LinkText>{linkText}</LinkText>
          <StyledIcon name="arrow-right" />
        </LinkWrapper>
      )}
    </Wrapper>
  );
};

export default RowLineHeader;
