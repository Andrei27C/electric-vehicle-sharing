import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { API_URL } from '../../config';
import AsyncStorage from "@react-native-async-storage/async-storage";


type CreateVehicleScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateVehicle'>;

type Props = {
  navigation: CreateVehicleScreenNavigationProp;
};

const CreateVehicleScreen: React.FC<Props> = ({ navigation }) => {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');

  const createVehicle = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userRole = await AsyncStorage.getItem('userRole');
      await axios.post(`${API_URL}/create-vehicle`, {  role: userRole, make, model, pricePerHour }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigation.goBack();
    } catch (error) {
      console.error('Failed to create vehicle:', error);
    }
  };

  return (
    <View>
      <Text>Make:</Text>
      <TextInput value={make} onChangeText={setMake} />
      <Text>Model:</Text>
      <TextInput value={model} onChangeText={setModel} />
      <Text>Price:</Text>
      <TextInput value={pricePerHour} onChangeText={setPricePerHour} />
      <TouchableOpacity onPress={createVehicle}>
        <Text>Create Vehicle</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CreateVehicleScreen;
