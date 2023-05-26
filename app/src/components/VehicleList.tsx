import React from 'react';
import { ScrollView } from 'react-native';
import VehicleCard from './VehicleCard';
import { Vehicle } from "../types/navigation";

interface VehicleListProps {
  vehicles: Vehicle[];
  onButton: (vehicle: Vehicle) => void;
  buttonText?: string;
}

const VehicleList: React.FC<VehicleListProps> = ({ vehicles, onButton, buttonText }) => {
  return (
    <ScrollView>
      {vehicles.map((vehicle) => (
        <VehicleCard key={`${vehicle.make}-${vehicle.model}`} vehicle={vehicle} onButton={onButton} buttonText={buttonText} />
      ))}
    </ScrollView>
  );
};

export default VehicleList;
