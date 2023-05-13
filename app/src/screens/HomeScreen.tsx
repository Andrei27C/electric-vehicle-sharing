import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { API_URL } from '../config';
import { useFocusEffect } from '@react-navigation/native';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [vehicles, setVehicles] = useState<Array<{ tokenId: string; make: string; model: string; price: string}>>([]);

  useFocusEffect(
    React.useCallback(() => {
      fetchVehicles();
      // Returning an empty function to avoid a warning about useEffect cleanup function
      return () => {};
    }, [])
  );


  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${API_URL}/get-vehicles`);
      setVehicles(response.data.vehicles);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    }
  };

  return (
    <View>
      <FlatList
        data={vehicles}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('Rental', { tokenId: item.tokenId })}
          >
            <Text>{item.make} {item.model} : {item.price}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.tokenId}
      />
      <TouchableOpacity onPress={() => navigation.navigate('CreateVehicle')}>
        <Text>Create Vehicle</Text>
      </TouchableOpacity>
      <br/>
      <TouchableOpacity onPress={() => navigation.navigate('CreateVehicle')}>
        <Text>Create Vehicle</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;
