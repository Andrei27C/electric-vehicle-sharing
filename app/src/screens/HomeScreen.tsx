import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [vehicles, setVehicles] = useState<Array<{ tokenId: string; make: string; model: string }>>([]);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${process.env.API_URL}/vehicles`);
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
            <Text>{item.make} {item.model}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.tokenId}
      />
      <TouchableOpacity onPress={() => navigation.navigate('CreateVehicle')}>
        <Text>Create Vehicle</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;
