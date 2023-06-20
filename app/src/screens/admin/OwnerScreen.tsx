import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { OwnerScreenNavigationProp } from "../../types/navigation";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button, Text } from 'react-native-paper';
import { View } from 'react-native';


type Props = {
  navigation: OwnerScreenNavigationProp;
};

const OwnerScreen: React.FC<Props> = ({ navigation }) => {
  const [isOwner, setIsOwner] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      console.log('useFocusEffect');
      checkOwnership();
      // Returning an empty function to avoid a warning about useEffect cleanup function
      return () => {};
    }, [])
  );

  const checkOwnership = async () => {
    // Get the user's address
    try {
      const userRole = await AsyncStorage.getItem('userRole');
      if(userRole !== 'owner') {
        setIsOwner(true);
      }
    } catch (error) {
      console.error('Failed to fetch owner address:', error);
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
    <View style={{ padding: 10 }}>
      <Text style={{ fontSize: 24, marginBottom: 10 }}>Vehicle</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
        <Button mode="contained" onPress={() => navigation.navigate('CreateVehicle')}>
          Create Vehicle
        </Button>
        <Button mode="contained" onPress={() => navigation.navigate('VehiclesOwner')}>
          See all vehicles data
        </Button>
      </View>

      <Text style={{ fontSize: 24, marginBottom: 10 }}>User</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Button mode="contained" onPress={() => navigation.navigate('UsersOwner')}>
          See all users
        </Button>
      </View>
    </View>
  );
};

export default OwnerScreen;
