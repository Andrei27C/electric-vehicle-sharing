import React, { useEffect, useState } from 'react';
import { View } from "react-native";
import DatePicker from 'react-native-datepicker';
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Vehicle } from "../../types/navigation";
import { API_URL } from '../../config';
import { Card, Button, TextInput, Title, Paragraph, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from "@react-native-async-storage/async-storage";

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
    fetchVehicle().then();
  }, []);

  const fetchVehicle = async () => {
    try {
      console.log('Fetching vehicle:', tokenId);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/vehicles/${tokenId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(response.data);
      await setVehicle(response.data.vehicle);
    } catch (error) {
      console.error('Failed to fetch vehicle:', error);
    }
  };

  const rentVehicle = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/rent-vehicle/${tokenId}`,
        {rentalFeeUSD: vehicle?.pricePerHour},
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
      <Card>
        <Card.Title title={`Vehicle ${tokenId}`} />
        {vehicle ? (
          <>
            <Card.Content>
              <Title>{vehicle.make} {vehicle.model}</Title>
              <Paragraph>Price: {vehicle.pricePerHour}</Paragraph>
              <Paragraph>End Time:</Paragraph>
              {/*<DatePicker*/}
              {/*  style={{width: '100%'}}*/}
              {/*  date={endTime}*/}
              {/*  onDateChange={setEndTime}*/}
              {/*  mode="datetime"*/}
              {/*  format="YYYY-MM-DDTHH:mm"*/}
              {/*  confirmBtnText="Confirm"*/}
              {/*  cancelBtnText="Cancel"*/}
              {/*/>*/}
            </Card.Content>
            <Card.Actions>
              <Button mode="contained" onPress={rentVehicle}>Rent Vehicle</Button>
            </Card.Actions>
          </>
        ) : (
          <ActivityIndicator animating={true} />
        )}
      </Card>
    </View>
  );
};

export default RentalScreen;
