import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Home: undefined;
  CreateVehicle: undefined;
  Rental: undefined;
  Owner: undefined;
  Login: undefined;
  Register: undefined;
  VehiclesOwner: undefined;
  UsersOwner: undefined;
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
  active?: boolean;
}

export interface User {
  id: string;
  username: string;
  role: string;
  vehicle?: Vehicle;
  points?: number;
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

export type OwnerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Owner'>;
export type OwnerScreenRouteProp = RouteProp<RootStackParamList, 'Owner'>;

export type VehiclesOwnerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'VehiclesOwner'>;
export type VehiclesOwnerScreenRouteProp = RouteProp<RootStackParamList, 'VehiclesOwner'>;

export type UsersOwnerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'UsersOwner'>;
export type UsersOwnerScreenRouteProp = RouteProp<RootStackParamList, 'UsersOwner'>;
