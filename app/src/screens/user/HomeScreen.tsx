import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeScreenRouteProp, RootStackParamList, Vehicle } from "../../types/navigation";
import { API_URL } from '../../config';
import { useFocusEffect } from '@react-navigation/native';
import VehicleList from "../../components/VehicleList";
import AsyncStorage from '@react-native-async-storage/async-storage';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
  route: HomeScreenRouteProp;
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [userPoints, setUserPoints] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      const fetchVehicles = async () => {
        try {
          const token = await AsyncStorage.getItem('token');
          const response = await axios.get(`${API_URL}/get-vehicles`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('Fetched vehicles:', response.data.vehicles);
          setVehicles(response.data.vehicles);
        } catch (error) {
          console.error('Failed to fetch vehicles:', error);
        }
      };

      fetchVehicles();
      return () => {};
    }, [])
  );

  useEffect(() => {
    const fetchUserPoints = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userId = await AsyncStorage.getItem('userId');
        console.log('Fetching user points:', userId);
        const response = await axios.get(`${API_URL}/get-user-points/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Fetched user points:', response.data.points);
        setUserPoints(response.data.points);
      } catch (error) {
        console.error('Failed to fetch user points:', error);
      }
    };

    fetchUserPoints();
  }, []);

  const rentVehicle = (vehicle: Vehicle) => {
    console.log(`Renting vehicle ${vehicle.tokenId}`);
    navigation.navigate('Rental', { tokenId: vehicle.tokenId }, );
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
        <Text>Welcome!</Text>
        <Text>Your Points: {userPoints}</Text>
      </View>
      <VehicleList vehicles={vehicles} onRent={rentVehicle} />
      <TouchableOpacity onPress={() => navigation.navigate('CreateVehicle')}>
        <Text>Create Vehicle</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Owner')}>
        <Text>See all vehicles data</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;
