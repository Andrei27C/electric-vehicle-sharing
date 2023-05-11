import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Home: undefined;
  CreateVehicle: undefined;
  Rental: {
    tokenId: string;
  };
};

export type Vehicle = {
  tokenId: string;
  make: string;
  model: string;
  price: number;
};


export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
export type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;

export type CreateVehicleScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'CreateVehicle'
>;
export type CreateVehicleScreenRouteProp = RouteProp<RootStackParamList, 'CreateVehicle'>;

export type RentalScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Rental'>;
export type RentalScreenRouteProp = RouteProp<RootStackParamList, 'Rental'>;
