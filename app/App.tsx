import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/user/HomeScreen';
import CreateVehicleScreen from './src/screens/admin/CreateVehicleScreen';
import RentalScreen from './src/screens/user/RentalScreen';
import OwnerScreen from "./src/screens/admin/OwnerScreen";
import { RootStackParamList } from './src/types/navigation';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import VehiclesOwnerScreen from "./src/screens/admin/VehiclesOwnerScreen";

const Stack = createStackNavigator<RootStackParamList>();

const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3498db',
    accent: '#f1c40f',
  },
};


const App = () => {
  return (
    <PaperProvider theme={theme}>
      {/*<HomePage />*/}

      <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreateVehicle" component={CreateVehicleScreen} />
        <Stack.Screen name="Rental" component={RentalScreen} />
        <Stack.Screen name="Owner" component={OwnerScreen} />
        <Stack.Screen name="VehiclesOwner" component={VehiclesOwnerScreen} />

      </Stack.Navigator>

    </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
