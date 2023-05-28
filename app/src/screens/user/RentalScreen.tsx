import React, { useState } from 'react';
import { View } from "react-native";
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { RootStackParamList, Vehicle } from "../../types/navigation";
import { API_URL } from '../../config';
import AsyncStorage from "@react-native-async-storage/async-storage";
import VehicleList from "../../components/VehicleList";

type RentalScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Rental'>;
type RentalScreenRouteProp = RouteProp<RootStackParamList, 'Rental'>;

type Props = {
  navigation: RentalScreenNavigationProp;
  route: RentalScreenRouteProp;
};

const RentalScreen: React.FC<Props> = ({ navigation }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchVehicles = async () => {
        try {
          const token = await AsyncStorage.getItem('token');
          const userId = await AsyncStorage.getItem('userId');
          const response = await axios.get(`${API_URL}/get-vehicles-data-for-view/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('Fetched vehicles:', response.data.vehicles);
          setVehicles(response.data.vehicles);
        } catch (error) {
          console.error('Failed to fetch vehicles:', error);
        }
      };

      fetchVehicles().then();
    }, [])
  );

  const rentVehicle = async(vehicle: Vehicle) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/rent-vehicle/${vehicle.tokenId}`, {},
        {headers: { Authorization: `Bearer ${token}` }}
        );
      console.log(response.data);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to rent vehicle:', error);
    }
  };

  return (
    <View style={{ padding: 10 }}>
      <VehicleList vehicles={vehicles} onButton={rentVehicle} buttonText={"Rent"} owner={false}/>
    </View>
  );
};

export default RentalScreen;
