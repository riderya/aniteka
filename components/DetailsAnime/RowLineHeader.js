import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';

const Wrapper = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 20px;
  justify-content: space-between;
  padding: 0px 12px;
`;

const LeftContent = styled.View`
  flex: 1;
  flex-direction: column;
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 22px;
  font-weight: bold;
  margin-bottom: ${({ hasDescription }) => hasDescription ? '4px' : '0px'};
`;

const Description = styled.Text`
  color: ${({ theme }) => theme.colors.gray};
  font-size: 14px;
  font-weight: 400;
  margin-bottom: 8px;
`;

const RightContent = styled.View`
  align-items: flex-end;
`;

const LinkWrapper = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`;

const LinkText = styled.Text`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.primary};
  margin-right: 5px;
  font-weight: 600;
  padding-left: 5px;
`;

const StyledIcon = styled(Ionicons)`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 20px;
`;

const RowLineHeader = ({ title, description, onPress, linkText = "Більше", rightContent }) => {
  return (
    <Wrapper>
      <LeftContent>
        <Title hasDescription={!!description}>{title}</Title>
        {description && <Description>{description}</Description>}
      </LeftContent>
      <RightContent>
        {rightContent || (onPress && (
          <LinkWrapper onPress={onPress}>
            <LinkText>{linkText}</LinkText>
            <StyledIcon name="chevron-forward" />
          </LinkWrapper>
        ))}
      </RightContent>
    </Wrapper>
  );
};

export default RowLineHeader;
