import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type CreateVehicleScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateVehicle'>;

type Props = {
  navigation: CreateVehicleScreenNavigationProp;
};

const CreateVehicleScreen: React.FC<Props> = ({ navigation }) => {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [price, setPrice] = useState('');

  const createVehicle = async () => {
    try {
      await axios.post(`${process.env.API_URL}/vehicles`, { make, model, price });
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
      <TextInput value={price} onChangeText={setPrice} />
      <TouchableOpacity onPress={createVehicle}>
        <Text>Create Vehicle</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CreateVehicleScreen;
