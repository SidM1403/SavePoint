import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthContext } from '../context/AuthContext';

// Pages
import Login from '../pages/Login';
import Register from '../pages/Register';
import Landing from '../pages/Landing';
import Dashboard from '../pages/Dashboard';
import Library from '../pages/Library';
import Search from '../pages/Search';
import Community from '../pages/Community';
import GameDetail from '../pages/GameDetail';
import ListDetail from '../pages/ListDetail';
import Lists from '../pages/Lists';
import Recommend from '../pages/Recommend';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="DashboardTab" component={Dashboard} options={{ title: 'Home' }} />
      <Tab.Screen name="LibraryTab" component={Library} options={{ title: 'Library' }} />
      <Tab.Screen name="SearchTab" component={Search} options={{ title: 'Search' }} />
      <Tab.Screen name="CommunityTab" component={Community} options={{ title: 'Community' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // User is signed in
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="GameDetail" component={GameDetail} options={{ headerShown: true, title: 'Game Details' }} />
            <Stack.Screen name="ListDetail" component={ListDetail} options={{ headerShown: true, title: 'List Details' }} />
            <Stack.Screen name="Lists" component={Lists} options={{ headerShown: true, title: 'My Lists' }} />
            <Stack.Screen name="Recommend" component={Recommend} options={{ headerShown: true, title: 'Recommendations' }} />
          </>
        ) : (
          // No user is signed in
          <>
            <Stack.Screen name="Landing" component={Landing} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
