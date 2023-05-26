import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeScreenRouteProp, RootStackParamList, Vehicle } from "../../types/navigation";
import { API_URL } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button, Divider, TextInput } from "react-native-paper";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
  route: HomeScreenRouteProp;
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [userPoints, setUserPoints] = useState("0");
  const [userFunds, setUserFunds] = useState("0");
  const [userAddress, setUserAddress] = useState("0");
  const [userFundsDollars, setUserFundsDollars] = useState("0");
  const [fundsToBeFunded, setFundsToBeFunded] = useState("");

  //get user points
  useEffect(() => {
    console.log('Fetching user points...');
    const fetchUserPoints = async () => {
      try {
        let userPoints = "0";
        const token = await AsyncStorage.getItem('token');
        const userId = await AsyncStorage.getItem('userId');
        const response = await axios.get(`${API_URL}/get-user-points/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        userPoints = response.data.points;
        await AsyncStorage.setItem('userPoints', userPoints.toString());
        console.log('Fetched user points:', userPoints);
        setUserPoints(userPoints);
      } catch (error) {
        console.error('Failed to fetch user points:', error);
      }
    };
    fetchUserPoints().then();
  }, []);

  //get user funds
  useEffect(() => {
    console.log('Fetching user funds...');
    const fetchUserFunds = async () => {
      try {
        let userFunds = "0";
        const token = await AsyncStorage.getItem('token');
        const userId = await AsyncStorage.getItem('userId');

        const response = await axios.get(`${API_URL}/get-user-funds/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        userFunds = response.data.funds ? response.data.funds : "0";
        let userFundsDollars = response.data.fundsDollars ? response.data.fundsDollars : "0";
        console.log('   Fetched user funds wei: ', userFunds, " - dollars: ", userFundsDollars);

        await AsyncStorage.setItem('userFunds', userFunds.toString());
        setUserFunds(userFunds);
        setUserFundsDollars(userFundsDollars);
      } catch (error) {
        console.error('Failed to fetch user funds:', error);
      }
    };
    fetchUserFunds().then();
  }, []);

  //get user address
  useEffect(() => {
    const fetchUserAddress = async () => {
      try {
        const userAddress =await AsyncStorage.getItem('userAddress');
        setUserAddress(userAddress ? userAddress : "0");
      } catch (error) {
        console.error('Failed to get user address:', error);
      }
    };
    fetchUserAddress().then();
  }, []);

  const fundAccount = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      console.log('Funding account with:', fundsToBeFunded, 'for user:', userId);
      const response = await axios.post(`${API_URL}/fund-account/${userId}`, {amount: fundsToBeFunded}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Fetched funds:', response.data.funds);
      let totalUserFunds = parseFloat(userFunds) + parseFloat(response.data.funds);
      setUserFunds(totalUserFunds.toString());
    } catch (error) {
      console.error('Failed to fetch funds:', error);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.points}>Your Address: {userAddress}</Text>
      </View>
      <View style={styles.header}>
        <Text style={styles.points}>Your Points: {userPoints}</Text>
      </View>
      <View style={styles.header}>
        <Text style={styles.points}>Your Funds: ${userFundsDollars}</Text>
      </View>

      <View style={styles.fundContainer}>
        <TextInput
          label="Amount"
          value={fundsToBeFunded.toString()}
          onChangeText={text => setFundsToBeFunded(text)}
          style={styles.input}
        />
        <Button
          mode="contained"
          onPress={() => fundAccount()}
          style={styles.button}
        >
          Fund Account
        </Button>
      </View>

      <Divider style={styles.divider} />

      <Button
        mode="contained"
        onPress={() => navigation.navigate('Rental')}
        style={styles.button}
      >
        Rent a Vehicle
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  points: {
    marginLeft: 10,
    fontSize: 18
  },
  fundContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  input: {
    flex: 1,
    marginRight: 10
  },
  button: {
    marginTop: 10
  },
  divider: {
    marginVertical: 10
  }
});

export default HomeScreen;
