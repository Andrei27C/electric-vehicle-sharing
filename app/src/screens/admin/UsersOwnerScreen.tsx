import React, { useState } from 'react';
import { Alert, View } from "react-native";
import { Text } from 'react-native-paper';
import axios from 'axios';
import { UsersOwnerScreenNavigationProp, User } from "../../types/navigation";
import { useFocusEffect } from "@react-navigation/native";
import { API_URL } from '../../config';
import AsyncStorage from "@react-native-async-storage/async-storage";
import UserList from "../../components/UserList"; // Make sure to create a UserList component similar to VehicleList

type Props = {
  navigation: UsersOwnerScreenNavigationProp;
};

const UsersOwnerScreen: React.FC<Props> = ({ navigation }) => {
  const [users, setUsers] = useState<User[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      fetchUsers().then();
      return () => {};
    }, [])
  );

  const fetchUsers = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      // const userId = await AsyncStorage.getItem('userId');
      const response = await axios.get(`${API_URL}/get-users/`,{
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const deleteUser = async (user: User) => {
    console.log(`Deleting user with id: ${user.id}`);
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(`${API_URL}/delete-user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh users list after deletion
      await fetchUsers();
      Alert.alert('Success', 'User successfully deleted.');
    } catch (error) {
      console.error('Failed to delete user:', error);
      Alert.alert('Error', 'Failed to delete user. Please try again.');
    }
  };

  const fundPoints = async (user: User, points: number) => {
    console.log(`Funding: ` + points + ` points to user with id: ${user.id}`);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(`${API_URL}/fund-points/${user.id}`, {points: points},{
        headers: { Authorization: `Bearer ${token}` },
      });
      //
      console.log('Fetched funds:', response.data.points);
      console.log(response.data.message);
      // let totalUserFunds = parseFloat(points) + parseFloat(response.data.funds);
      // setUserFunds(totalUserFunds.toString());
      // setFundsToBeFunded("");
      // fetchUserFunds().then();
    } catch (error) {
      console.error('Failed to fetch funds:', error);
    }
  }

  return (
    <View>
      <UserList users={users} onDelete={deleteUser} onFundPoints={fundPoints} />
    </View>
  );
};

export default UsersOwnerScreen;
