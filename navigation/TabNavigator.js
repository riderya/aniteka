import React, { useRef, useEffect } from 'react';
import { Animated, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { PlatformBlurView } from '../components/Custom/PlatformBlurView';
import HomeScreen from '../screens/HomeScreen';
import OverviewScreen from '../screens/OverviewScreen';
import SavedScreen from '../screens/SavedScreen';
import UserScreen from '../screens/UserScreen';


const Tab = createBottomTabNavigator();

const TabBarContainer = styled(PlatformBlurView)`
  position: absolute;
  bottom: ${props => props.bottomInset + 10}px;
  left: 10px;
  right: 10px;
  height: 80px;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  border-radius: 999px;
  overflow: hidden;
`;

const TabBarLabel = styled.Text`
  font-size: 12px;
  margin-top: 4px;
`;

function CustomTabBar({ state, descriptors, navigation }) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const TAB_COUNT = state.routes.length;
  const tabWidth = (Dimensions.get('window').width - 20) / TAB_COUNT;
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
      friction: 7,
    }).start();
  }, [state.index, tabWidth]);

  return (
    <TabBarContainer
      intensity={100}
      tint={isDark ? 'dark' : 'light'}
      bottomInset={insets.bottom}
    >
      <Animated.View
        style={{
          position: 'absolute',
          left: (tabWidth - 60) / 2, // центровано під іконкою
          top: 15, // трохи нижче, щоб було під іконкою
          width: 60, // ширина фону під іконкою
          height: 30, // висота фону під іконкою
          borderRadius: 20, // круглий фон
          backgroundColor: theme.colors.primary + '22',
          transform: [{ translateX: animatedValue }],
          zIndex: 0,
        }}
      />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TabButton
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.7}
            style={{ zIndex: 1 }}
          >
            <Ionicons
              name={
                route.name === 'Home'
                  ? isFocused ? 'home' : 'home-outline'
                  : route.name === 'Overview'
                  ? isFocused ? 'compass' : 'compass-outline'
                  : route.name === 'Saved'
                  ? isFocused ? 'bookmark' : 'bookmark-outline'
                  : route.name === 'User'
                  ? isFocused ? 'person' : 'person-outline'
                  : 'help-circle-outline'
              }
              size={24}
              color={isFocused ? theme.colors.primary : theme.colors.text}
            />
            <TabBarLabel style={{ color: isFocused ? theme.colors.primary : theme.colors.text }}>
              {label}
            </TabBarLabel>
          </TabButton>
        );
      })}
    </TabBarContainer>
  );
}

export default function TabNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Overview':
              iconName = focused ? 'compass' : 'compass-outline';
              break;
            case 'Saved':
              iconName = focused ? 'bookmark' : 'bookmark-outline';
              break;
            case 'User':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text,
        tabBarStyle: { display: 'none' },
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTitleStyle: {
          color: theme.colors.text,
        },
      })}
      tabBar={props => <CustomTabBar {...props} />}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Головна',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Overview"
        component={OverviewScreen}
        options={{
          tabBarLabel: 'Огляд',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Saved"
        component={SavedScreen}
        options={{
          tabBarLabel: 'Збережені',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="User"
        component={UserScreen}
        options={{
          tabBarLabel: 'Профіль',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

const TabButton = styled.TouchableOpacity`
  flex: 1;
  align-items: center;
  justify-content: center;
`;
