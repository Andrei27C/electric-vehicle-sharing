import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import axios from 'axios';
import { Vehicle } from "../../types/navigation";
import { useFocusEffect } from "@react-navigation/native";
import { API_URL } from '../../config';


const OwnerScreen: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isOwner, setIsOwner] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      console.log('useFocusEffect');
      checkOwnership();
      fetchVehicles();
      // Returning an empty function to avoid a warning about useEffect cleanup function
      return () => {};
    }, [])
  );

  const checkOwnership = async () => {
    // Get the user's address
    const userAddress = '0xdDBc513DA23C9F6002251A0921aA18CB2DDca9b7';
    try {
      console.log('checkOwnership');
      const response = await axios.get(`${API_URL}/contract-owner`);
      setIsOwner(response.data.owner.toLowerCase() === userAddress.toLowerCase());
    } catch (error) {
      console.error('Failed to fetch owner address:', error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${API_URL}/get-all-vehicles-data`);
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

  return (
    <View>
      <Text>Owner's Vehicles:</Text>
      <FlatList
        data={vehicles}
        renderItem={({ item }) => (
          <View>
            <Text>Token ID: {item.tokenId}</Text>
            <Text>Make: {item.make}</Text>
            <Text>Model: {item.model}</Text>
            <Text>Price: {item.pricePerHour}</Text>
            <Text>startTime: {item.startTime}</Text>
            <Text>currentRenter: {item.currentRenter}</Text>
          </View>
        )}
        keyExtractor={(item) => item.tokenId}
      />
    </View>
  );
};

export default OwnerScreen;
