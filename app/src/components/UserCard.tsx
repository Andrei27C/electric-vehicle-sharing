import React, { useState } from "react";
import { Card, Paragraph, Button, TextInput} from 'react-native-paper';
import { User } from "../types/navigation";
import { StyleSheet } from 'react-native';

interface UserCardProps {
  user: User;
  onFundPoints: (user: User, points: number) => void;
  onDelete: (user: User) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onFundPoints, onDelete }) => {
  const [points, setPoints] = useState<number>(0);

  return (
    <Card style={styles.card}>
      <Card.Title title={`${user.username}`} />
      <Card.Content>
        <Paragraph style={styles.paragraph}>Role: {user.role}</Paragraph>
        <Paragraph style={styles.paragraph}>Rented Car (if any): {user.vehicleId || 'None'}</Paragraph>
        <Paragraph style={styles.paragraph}>Points: {user.points}</Paragraph>
        <TextInput
          label="Fund Points"
          value={points.toString()}
          onChangeText={text => setPoints(Number(text))}
          style={styles.input}
          keyboardType="numeric"
          mode="outlined"
          theme={{ colors: { primary: '#4caf50' } }}
        />
      </Card.Content>
      <Card.Actions style={styles.cardActions}>
        <Button
          mode="outlined"
          onPress={() => onDelete(user)}
          style={styles.deleteButton}
          textColor={'#000'}
        >
          Delete
        </Button>
        <Button
          mode="contained"
          onPress={() => onFundPoints(user, points)}
          style={styles.fundButton}
        >
          Fund Account
        </Button>
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  paragraph: {
    marginBottom: 10,
  },
  input: {
    marginBottom: 10,
    backgroundColor: '#fff',
    height: 40,
  },
  cardActions: {
    justifyContent: 'space-between',
  },
  fundButton: {
    backgroundColor: '#4caf50',
  },
  deleteButton: {
    borderColor: '#f45000',
  },
});

export default UserCard;
