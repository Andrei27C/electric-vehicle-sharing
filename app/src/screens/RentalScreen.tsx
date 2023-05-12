import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Vehicle } from "../types/navigation";
import { API_URL } from '../config';


type RentalScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Rental'>;
type RentalScreenRouteProp = RouteProp<RootStackParamList, 'Rental'>;

type Props = {
  navigation: RentalScreenNavigationProp;
  route: RentalScreenRouteProp;
};

const RentalScreen: React.FC<Props> = ({ route, navigation }) => {
  const { tokenId } = route.params;
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    fetchVehicle();
  }, []);

  const fetchVehicle = async () => {
    try {
      const response = await axios.get(`${API_URL}/vehicles/${tokenId}`);
      setVehicle(response.data);
    } catch (error) {
      console.error('Failed to fetch vehicle:', error);
    }
  };

  const rentVehicle = async () => {
    try {
      await axios.post(`${API_URL}/rentals`, { tokenId });
      navigation.goBack();
    } catch (error) {
      console.error('Failed to rent vehicle:', error);
    }
  };

  return (
    <View>
      {vehicle ? (
        <>
          <Text>{vehicle.make} {vehicle.model}</Text>
          <Text>Price: {vehicle.price}</Text>
          <TouchableOpacity onPress={rentVehicle}>
            <Text>Rent Vehicle</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
};

export default RentalScreen;
