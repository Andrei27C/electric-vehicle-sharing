import React, { useState } from 'react';
import { Alert, View } from "react-native";
import { Text } from 'react-native-paper';
import axios from 'axios';
import { VehiclesOwnerScreenNavigationProp, Vehicle } from "../../types/navigation";
import { useFocusEffect } from "@react-navigation/native";
import { API_URL } from '../../config';
import AsyncStorage from "@react-native-async-storage/async-storage";
import VehicleList from "../../components/VehicleList";

type Props = {
  navigation: VehiclesOwnerScreenNavigationProp;
};

const VehiclesOwnerScreen: React.FC<Props> = ({ navigation }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isOwner, setIsOwner] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      console.log('useFocusEffect');
      checkOwnership().then();
      fetchVehicles().then();
      // Returning an empty function to avoid a warning about useEffect cleanup function
      return () => {};
    }, [])
  );

  const checkOwnership = async () => {
    // Get the user's address
    const userAddress = '0xdDBc513DA23C9F6002251A0921aA18CB2DDca9b7';
    try {
      console.log('checkOwnership');
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/contract-owner`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Fetched owner address:', response.data.owner);
      setIsOwner(response.data.owner.toLowerCase() === userAddress.toLowerCase());
    } catch (error) {
      console.error('Failed to fetch owner address:', error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      const response = await axios.get(`${API_URL}/get-vehicles-data-for-view/${userId}`,{
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicles(response.data.vehicles);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    }
  };

  if (!isOwner) {
    return (
      <View>
        <Text>You must be the contract owner to access this screen.</Text>
      </View>
    );
  }

  const deleteVehicle = async (vehicle: Vehicle) => {
    console.log(`Deleting vehicle with id: ${vehicle.tokenId}`);
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(`${API_URL}/delete-vehicle/${vehicle.tokenId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh vehicles list after deletion
      await fetchVehicles();
      Alert.alert('Success', 'Vehicle successfully deleted.');
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
      Alert.alert('Error', 'Failed to delete vehicle. Please try again.');
    }
  };

  return (
    <View>
      <VehicleList vehicles={vehicles} onButton={deleteVehicle} buttonText={"Delete"} owner={true}/>
    </View>
  );
};

export default VehiclesOwnerScreen;
