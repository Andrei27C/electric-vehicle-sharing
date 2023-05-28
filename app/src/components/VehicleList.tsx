import React from 'react';
import { ScrollView } from 'react-native';
import VehicleCard from './VehicleCard';
import { Vehicle } from "../types/navigation";

interface VehicleListProps {
  vehicles: Vehicle[];
  onButton: (vehicle: Vehicle) => void;
  buttonText?: string;
  owner?: boolean;
}

const VehicleList: React.FC<VehicleListProps> = ({ vehicles, onButton, buttonText, owner }) => {
  return (
    <ScrollView>
      {vehicles.map((vehicle) => (
        <VehicleCard key={`${vehicle.make}-${vehicle.model}`} vehicle={vehicle} onButton={onButton} buttonText={buttonText} owner={owner}/>
      ))}
    </ScrollView>
  );
};

export default VehicleList;
