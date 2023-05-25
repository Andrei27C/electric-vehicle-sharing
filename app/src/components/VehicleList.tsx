import React from 'react';
import { ScrollView } from 'react-native';
import VehicleCard from './VehicleCard';
import { Vehicle } from "../types/navigation";

interface VehicleListProps {
  vehicles: Vehicle[];
  onRent: (vehicle: Vehicle) => void;
}

const VehicleList: React.FC<VehicleListProps> = ({ vehicles, onRent }) => {
  return (
    <ScrollView>
      {vehicles.map((vehicle) => (
        <VehicleCard key={`${vehicle.make}-${vehicle.model}`} vehicle={vehicle} onRent={onRent} />
      ))}
    </ScrollView>
  );
};

export default VehicleList;
