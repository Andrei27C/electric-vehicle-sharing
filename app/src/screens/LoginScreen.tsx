import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';
import axios from 'axios';
import { API_URL } from '../config';
import { LoginScreenNavigationProp, LoginScreenRouteProp } from "../types/navigation";
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {
  navigation: LoginScreenNavigationProp;
  route: LoginScreenRouteProp;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
});


const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    try {
      const response = await axios.post(`${API_URL}/login`, { username, password });
      console.log("Logging in...: ", response.data.user);
      console.log("Logged in as: ", response.data.user.username);
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('userName', response.data.user.username);
      await AsyncStorage.setItem('userId', response.data.user.id.toString());
      await AsyncStorage.setItem('userRole', response.data.user.role);
      await AsyncStorage.setItem('userPoints', response.data.user.points.toString());
      await AsyncStorage.setItem('userFunds', response.data.user.funds.toString());
      await AsyncStorage.setItem('userAddress', response.data.user.address);

      if(response.data.user.role === 'admin') {
        navigation.navigate('Owner');
      }
      else
        navigation.navigate('Home');
    } catch (error) {
      console.error('Failed to log in:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Login</Title>
      <TextInput
        label="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        secureTextEntry={false}
        style={styles.input}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button mode="contained" onPress={login} style={styles.button}>
        Log In
      </Button>
      <Button mode="outlined" onPress={() => navigation.navigate('Register')} style={styles.button}>
        Register
      </Button>
    </View>
  );
};

export default LoginScreen;
