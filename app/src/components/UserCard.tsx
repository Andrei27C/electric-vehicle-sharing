import React from 'react';
import { Card, Paragraph, Button } from 'react-native-paper';
import { User } from "../types/navigation";

interface UserCardProps {
  user: User;
  onFundPoints: (user: User) => void;
  onDelete: (user: User) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onFundPoints, onDelete }) => {
  return (
    <Card>
      <Card.Title title={`${user.username} `} />
      <Card.Content>
        <Paragraph>Role: {user.role}</Paragraph>
        <Paragraph>Rented Car (if any): {user.vehicle?.tokenId}</Paragraph>
        <Paragraph>Points: {user.points}</Paragraph>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => onFundPoints(user)}>Fund Account</Button>
      </Card.Actions>
      <Card.Actions>
        <Button onPress={() => onDelete(user)}>Delete</Button>
      </Card.Actions>
    </Card>
  );
};

export default UserCard;
