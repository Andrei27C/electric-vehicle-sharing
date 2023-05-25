import * as React from 'react';
import { TextInput, Button, IconButton } from 'react-native-paper';
import { View } from 'react-native';
import { RegisterScreenNavigationProp } from '../types/navigation';
import axios from "axios";
import { API_URL } from "../config";
import AsyncStorage from "@react-native-async-storage/async-storage";

type RegisterScreenProps = {
  navigation: RegisterScreenNavigationProp;
};

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [address, setAddress] = React.useState('');

  const register = async () => {
    try {
      const response = await axios.post(`${API_URL}/register`, { username, password, address });
      console.log(response.data);

      if (response.data.success) {
        console.log('Registered successfully!');
        await AsyncStorage.setItem('token', response.data.token);  // store token in local storage
        navigation.navigate('Home'); // navigate to home page after successful registration
      }
    } catch (error) {
      console.error('Failed to log in:', error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>
      <TextInput
        label="Email"
        value={username}
        onChangeText={text => setUsername(text)}
        style={{ marginBottom: 16 }}
        autoCapitalize="none"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={text => setPassword(text)}
        secureTextEntry
        style={{ marginBottom: 16 }}
        autoCapitalize="none"
      />
      <TextInput
        label="Address"
        value={address}
        onChangeText={text => setAddress(text)}
        style={{ marginBottom: 16 }}
        autoCapitalize="none"
      />
      <Button mode="contained" onPress={register}>
        Register
      </Button>
      {/*<IconButton*/}
      {/*  icon="arrow-left"*/}
      {/*  size={20}*/}
      {/*  onPress={() => navigation.goBack()}*/}
      {/*  style={{ marginTop: 16 }}*/}
      {/*/>*/}
    </View>
  );
}
