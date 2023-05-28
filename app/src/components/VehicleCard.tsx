import React from 'react';
import { Card, Paragraph, Button, Divider, Title, Subheading } from "react-native-paper";
import { Vehicle } from "../types/navigation";
import { StyleSheet } from "react-native";

interface VehicleCardProps {
  vehicle: Vehicle;
  onButton: (vehicle: Vehicle) => void;
  buttonText?: string;
}

const styles = StyleSheet.create({
  card: {
    margin: 10,
  },
  content: {
    marginVertical: 10,
  },
  actions: {
    justifyContent: 'flex-end',
  },
});

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onButton, buttonText }) => {
  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <Title>{`${vehicle.make} ${vehicle.model}`}</Title>
        <Subheading>Price per Hour: ${vehicle.pricePerHour}</Subheading>
        <Subheading>Max Rental Hours: {vehicle.maxRentalHours / 3600}</Subheading>
        <Subheading>Current Renter: {vehicle.currentRenter}</Subheading>
      </Card.Content>
      <Card.Actions style={styles.actions}>
        <Button mode="contained" onPress={() => onButton(vehicle)}>{buttonText}</Button>
      </Card.Actions>
      <Divider/>
    </Card>
  );
};

export default VehicleCard;
