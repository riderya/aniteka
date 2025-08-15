import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import HomeScreen from '../screens/HomeScreen';
import OverviewScreen from '../screens/OverviewScreen';
import SavedScreen from '../screens/SavedScreen';
import UserScreen from '../screens/UserScreen';


const Tab = createBottomTabNavigator();

const TabBarContainer = styled(BlurView)`
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
  margin-bottom: 2px;
`;

export default function TabNavigator() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

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
      tabBar={(props) => {
        const { state, descriptors, navigation } = props;
        return (
          <TabBarContainer 
            experimentalBlurMethod="dimezisBlurView" 
            intensity={100} 
            tint={isDark ? 'dark' : 'light'}
            bottomInset={insets.bottom}
          >
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
                >
                  {options.tabBarIcon({
                    focused: isFocused,
                    color: isFocused ? theme.colors.primary : theme.colors.text,
                    size: 24,
                  })}
                  <TabBarLabel style={{ color: isFocused ? theme.colors.primary : theme.colors.text }}>
                    {label}
                  </TabBarLabel>
                </TabButton>
              );
            })}
          </TabBarContainer>
        );
      }}
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
