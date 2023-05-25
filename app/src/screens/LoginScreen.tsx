import React, { useState } from 'react';
import { View } from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';
import axios from 'axios';
import { API_URL } from '../config';
import { LoginScreenNavigationProp, LoginScreenRouteProp } from "../types/navigation";
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {
  navigation: LoginScreenNavigationProp;
  route: LoginScreenRouteProp;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    try {
      const response = await axios.post(`${API_URL}/login`, { username, password });
      console.log(response.data);
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('userName', response.data.user.username);
      await AsyncStorage.setItem('userId', response.data.user.id.toString());
      await AsyncStorage.setItem('userRole', response.data.user.role);
      navigation.navigate('Home');
    } catch (error) {
      console.error('Failed to log in:', error);
    }
  };

  return (
    <View style={{ padding: 10 }}>
      <Title style={{ textAlign: 'center' }}>Login</Title>
      <TextInput
        label="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button mode="contained" onPress={login}>
        Log In
      </Button>
      <Button mode="contained" onPress={() => navigation.navigate('Register')} style={{ marginTop: 10 }}>
        Register
      </Button>
    </View>
  );
};

export default LoginScreen;
