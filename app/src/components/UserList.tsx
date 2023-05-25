import React from 'react';
import { ScrollView } from 'react-native';
import { User } from "../types/navigation";
import UserCard from "./UserCard";

interface UserListProps {
  users: User[];
  onFundPoints: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({ users, onFundPoints }) => {
  return (
    <ScrollView>
      {users.map((user) => (
        <UserCard key={`${user.username}`} user={user} onFundPoints={onFundPoints} />
      ))}
    </ScrollView>
  );
};

export default UserList;
