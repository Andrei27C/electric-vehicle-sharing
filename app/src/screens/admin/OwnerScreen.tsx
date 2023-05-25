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
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
      <Button mode="contained" onPress={() => navigation.navigate('CreateVehicle')}>
        Create Vehicle
      </Button>
      <Button mode="contained" onPress={() => navigation.navigate('VehiclesOwner')}>
        See all vehicles data
      </Button>
    </View>
  );
};

export default OwnerScreen;
