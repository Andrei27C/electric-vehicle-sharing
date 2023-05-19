import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import DatePicker from 'react-native-datepicker';
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
  const [endTime, setEndTime] = useState('');
  const { tokenId } = route.params;
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    fetchVehicle().then();
  }, []);

  const fetchVehicle = async () => {
    try {
      const response = await axios.get(`${API_URL}/vehicles/${tokenId}`);
      console.log(response.data);
      await setVehicle(response.data.vehicle);
    } catch (error) {
      console.error('Failed to fetch vehicle:', error);
    }
  };

  const rentVehicle = async () => {
    try {
      const response = await axios.post(`${API_URL}/rent-vehicle/${tokenId}`, {endTime, rentalFeeUSD: vehicle?.price});
      console.log(response.data);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to rent vehicle:', error);
    }
  };

  return (
    <View>
      <Text>{tokenId}</Text>
      {vehicle ? (
        <>
          <Text>{vehicle.make} {vehicle.model}</Text>
          <Text>Price: {vehicle.price}</Text>
          <Text>End Time:</Text>
          <DatePicker
            date={endTime}
            onDateChange={setEndTime}
            mode="datetime"
            format="YYYY-MM-DDTHH:mm"
            confirmBtnText="Confirm"
            cancelBtnText="Cancel"
          />
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
