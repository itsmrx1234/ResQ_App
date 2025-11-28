import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FEATURES } from './config/features';

// Screens
import RegisterScreen from './screens/RegisterScreen';
import Calculator from './screens/Calculator';
import HomeScreen from './screens/HomeScreen';
import SOSDial from './screens/SOSDial';
import LocationShare from './screens/LocationShare';
import FileSave from './screens/FileSave';
import Chat from './screens/Chat';
import HiddenFeature from './screens/HiddenFeature';
import Helpline from './screens/Helpline';
import PanicButton from './screens/PanicButton';
import HiddenNotes from './screens/HiddenNotes';

const Stack = createNativeStackNavigator();

const App = () => {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkRegistration = async () => {
      try {
        const isRegistered = await AsyncStorage.getItem('isRegistered');
        setInitialRoute(isRegistered === 'true' ? 'Calculator' : 'Register');
      } catch (error) {
        console.error('Error checking registration:', error);
        setInitialRoute('Register'); // fallback
      }
    };
    checkRegistration();
  }, []);

  if (!initialRoute) return null; // can add loading spinner later

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        {/* Auth Screens */}
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Calculator" component={Calculator} />

        {/* Main App Screens */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="SOSDialPad" component={SOSDial} />
        <Stack.Screen name="LocationShare" component={LocationShare} />

        {/* Main Features */}
        {FEATURES.fileVault && (
          <Stack.Screen name="FileSave" component={FileSave} />
        )}
        {FEATURES.chat && <Stack.Screen name="Chat" component={Chat} />}
        {FEATURES.hiddenFeature && (
          <Stack.Screen name="HiddenFeature" component={HiddenFeature} />
        )}
        <Stack.Screen name="Helpline" component={Helpline} />
        <Stack.Screen name="PanicButton" component={PanicButton} />

        {/* Sub-features */}
        {FEATURES.hiddenNotes && (
          <Stack.Screen name="HiddenNotes" component={HiddenNotes} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
