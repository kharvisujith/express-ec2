import { User } from './types';

// Hardcoded data for the API
export let users: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    age: 30
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    age: 25
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    age: 35
  },
  {
    id: 4,
    name: "Alice Brown",
    email: "alice.brown@example.com",
    age: 28
  }
];

// Helper function to get next available ID
export const getNextId = (): number => {
  return Math.max(...users.map(user => user.id)) + 1;
}; 