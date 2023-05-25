import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Home: undefined;
  CreateVehicle: undefined;
  Rental: {
    tokenId: string;
  };
  Owner: undefined;
  Login: undefined;
  Register: undefined;
};

export interface Vehicle {
  tokenId: string;
  make: string;
  model: string;
  pricePerHour: number;
  maxRentalHours: number;
  startTime?: string;
  endTime?: string;
  currentRenter?: string;
}

export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
export type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;

export type CreateVehicleScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'CreateVehicle'
>;
export type CreateVehicleScreenRouteProp = RouteProp<RootStackParamList, 'CreateVehicle'>;

export type RentalScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Rental'>;
export type RentalScreenRouteProp = RouteProp<RootStackParamList, 'Rental'>;

export type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
export type LoginScreenRouteProp = RouteProp<RootStackParamList, 'Login'>;

export type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;
export type RegisterScreenRouteProp = RouteProp<RootStackParamList, 'Register'>;
