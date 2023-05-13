import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import CreateVehicleScreen from './src/screens/CreateVehicleScreen';
import RentalScreen from './src/screens/RentalScreen';
import OwnerScreen from "./src/screens/OwnerScreen";
import { RootStackParamList } from './src/types/navigation';

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreateVehicle" component={CreateVehicleScreen} />
        <Stack.Screen name="Rental" component={RentalScreen} />
        <Stack.Screen name="Owner" component={OwnerScreen} />
      </Stack.Navigator>

    </NavigationContainer>
  );
};

export default App;
