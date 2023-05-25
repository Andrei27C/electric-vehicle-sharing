import React from 'react';
import { Card, Paragraph, Button } from 'react-native-paper';
import { Vehicle } from "../types/navigation";

interface VehicleCardProps {
  vehicle: Vehicle;
  onRent: (vehicle: Vehicle) => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onRent }) => {
  return (
    <Card>
      <Card.Title title={`${vehicle.make} ${vehicle.model}`} />
      <Card.Content>
        <Paragraph>Price per Hour: {vehicle.pricePerHour}</Paragraph>
        <Paragraph>Max Rental Hours: {vehicle.maxRentalHours}</Paragraph>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => onRent(vehicle)}>Rent</Button>
      </Card.Actions>
    </Card>
  );
};

export default VehicleCard;
