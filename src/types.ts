export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  age: number;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  age?: number;
} 